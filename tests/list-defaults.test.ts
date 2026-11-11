import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { assertHttpRequest, trackRequests } from "@eyeauras/cli-factory/testing";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createTestRuntime } from "./support.js";

const server = setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());

type Case = { name: string; argv: string[]; path: string; locator: string;
  fields?: string; environment?: NodeJS.ProcessEnv };
const allBuilds = "defaultFilter:false,branch:(default:any)";
const cases: Case[] = [
  { name: "all builds", argv: ["builds", "list"], path: "/builds", locator: allBuilds + ",lookupLimit:5000,start:0,count:101" },
  { name: "job scope has no lookup cap", argv: ["builds", "list", "--job", "Example"], path: "/builds", locator: allBuilds + ",buildType:(id:Example),start:0,count:101" },
  { name: "simple branch", argv: ["builds", "list", "--job", "Example", "--branch", "main"], path: "/builds", locator: "defaultFilter:false,branch:(name:main),buildType:(id:Example),start:0,count:101" },
  { name: "branch delimiters", argv: ["builds", "list", "--job", "Example", "--branch", "a:,()$"], path: "/builds", locator: "defaultFilter:false,branch:(name:(value:($base64:YTosKCkk))),buildType:(id:Example),start:0,count:101" },
  { name: "default branch", argv: ["builds", "list", "--job", "Example", "--branch", "@default"], path: "/builds", locator: "defaultFilter:false,branch:(default:true),buildType:(id:Example),start:0,count:101" },
  { name: "explicit default filter replaces default", argv: ["builds", "list", "--default-filter", "true", "--state", "running", "--status", "FAILURE"], path: "/builds", locator: "defaultFilter:true,branch:(default:any),state:running,status:FAILURE,lookupLimit:5000,start:0,count:101" },
  { name: "explicit false default filter", argv: ["builds", "list", "--default-filter", "false"], path: "/builds", locator: allBuilds + ",lookupLimit:5000,start:0,count:101" },
  { name: "project scope retains lookup cap", argv: ["builds", "list", "--project", "Example"], path: "/builds", locator: allBuilds + ",affectedProject:(id:Example),lookupLimit:5000,start:0,count:101" },
  { name: "lookup env", argv: ["builds", "list"], path: "/builds", locator: allBuilds + ",lookupLimit:73,start:0,count:101", environment: { TEAMCITY_CLI_LOOKUP_LIMIT: "73" } },
  { name: "lookup env ignored with job", argv: ["builds", "list", "--job", "Example"], path: "/builds", locator: allBuilds + ",buildType:(id:Example),start:0,count:101", environment: { TEAMCITY_CLI_LOOKUP_LIMIT: "73" } },
  ...["", "0", "-2", "1.5", "no", "1e3", "9007199254740992", " 7 "].map(value => ({ name: `invalid lookup env ${JSON.stringify(value)}`, argv: ["builds", "list"], path: "/builds", locator: allBuilds + ",lookupLimit:5000,start:0,count:101", environment: { TEAMCITY_CLI_LOOKUP_LIMIT: value } })),
  { name: "all agent authorization states", argv: ["agents", "list"], path: "/agents", locator: "authorized:any,start:0,count:101" },
  { name: "agent flags narrow", argv: ["agents", "list", "--authorized", "false", "--enabled", "false", "--connected", "false"], path: "/agents", locator: "connected:false,enabled:false,authorized:false,start:0,count:101" },
  { name: "native scoped builds", argv: ["jobs", "builds", "Example"], path: "/buildTypes/id:Example/builds", locator: allBuilds, fields: "id" },
  { name: "inactive job branches", argv: ["jobs", "branches", "Example"], path: "/buildTypes/id:Example/branches", locator: "policy:ALL_BRANCHES,start:0,count:101" },
  { name: "inactive project branches", argv: ["projects", "branches", "Example"], path: "/projects/id:Example/branches", locator: "policy:ALL_BRANCHES,start:0,count:101" },
  { name: "private build tags", argv: ["builds", "tags", "list", "7"], path: "/builds/id:7/tags", locator: "private:any", fields: "id" },
  { name: "private queue tags", argv: ["queue", "tags", "list", "7"], path: "/buildQueue/id:7/tags", locator: "private:any", fields: "id" },
  { name: "tag locator overrides", argv: ["builds", "tags", "list", "7", "--locator", "private:false"], path: "/builds/id:7/tags", locator: "private:false", fields: "id" },
  { name: "orphaned pools", argv: ["pools", "list"], path: "/agentPools", locator: "orphanedPool:any,start:0,count:101" },
  { name: "system and legacy audit events", argv: ["audit", "list"], path: "/audit", locator: "systemAction:any,hidden:any,start:0,count:101" },
  { name: "all health scopes", argv: ["health", "list"], path: "/health", locator: "project:(id:_Root),global:true,start:0,count:101" },
  { name: "project health scope narrows", argv: ["health", "list", "--project", "Example"], path: "/health", locator: "project:(id:Example),start:0,count:101" },
  { name: "global health scope narrows", argv: ["health", "list", "--global"], path: "/health", locator: "global:true,start:0,count:101" },
  ...[
    { argv: ["builds", "artifacts"], path: "/builds/id:7/artifacts", count: 101, archives: ",browseArchives:true" },
    { argv: ["jobs", "files"], path: "/buildTypes/id:7/vcs/files/latest", count: 100, archives: "" },
    { argv: ["server", "files"], path: "/server/files/7", count: 100, archives: "" },
    { argv: ["vcs", "instances", "files"], path: "/vcs-root-instances/id:7/files/latest", count: 100, archives: "" },
  ].flatMap(tree => ["list", "children"].map(action => ({ name: `hidden files ${tree.argv.join(" ")} ${action}`, argv: [...tree.argv, action, "7", ...(action === "children" ? ["src"] : [])], path: tree.path + (action === "children" ? "/src" : ""), locator: `hidden:any,count:${tree.count}${tree.archives}`, fields: "count,file(id)" }))),
];

for (const c of cases) test(`#385 ${c.name}`, async t => {
  const runtime = await createTestRuntime(t);
  const cli = runtime.createCli();
  const field = c.fields ?? `nextHref,${c.path === "/agents" ? "agent" : c.path === "/agentPools" ? "agentPool" : c.path === "/audit" ? "auditEvent" : c.path === "/health" ? "healthItem" : c.path.endsWith("/branches") ? "branch" : "build"}(id)`;
  const requests = trackRequests(t, 1, async request => {
    await assertHttpRequest(request, { method: "GET", url: "https://teamcity.test/app/rest" + c.path,
      query: { locator: c.locator, fields: field } });
    return HttpResponse.json({});
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  await runtime.json(cli, [...c.argv, "--fields", "id"], { environment: c.environment ?? {} });
});

test("#385 @this uses the invocation working directory, including nested paths", async t => {
  const runtime = await createTestRuntime(t);
  const directory = await mkdtemp(join(process.env.TMPDIR!, "branch-385-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  execFileSync("git", ["init", "--initial-branch=feature/fixture"], { cwd: directory, stdio: "ignore" });
  const cwd = join(directory, "nested");
  await mkdir(cwd);
  const requests = trackRequests(t, 1, async request => {
    await assertHttpRequest(request, { method: "GET", url: "https://teamcity.test/app/rest/builds", query: {
      locator: "defaultFilter:false,branch:(name:(value:($base64:ZmVhdHVyZS9maXh0dXJl))),buildType:(id:Example),start:0,count:101",
      fields: "nextHref,build(id)",
    } });
    return HttpResponse.json({});
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  await runtime.json(runtime.createCli(), ["builds", "list", "--job", "Example", "--branch", "@this", "--fields", "id"], { cwd });
});

test("#385 @this outside git fails clearly without HTTP", async t => {
  const runtime = await createTestRuntime(t);
  const directory = await mkdtemp(join(process.env.TMPDIR!, "not-git-385-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const requests = trackRequests(t, 0, async () => HttpResponse.json({}));
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  const result = await runtime.run(runtime.createCli(), ["builds", "list", "--branch", "@this"], { cwd: directory });
  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /not.*git repository/i);
});
