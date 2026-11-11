import assert from "node:assert/strict";
import test from "node:test";
import { assertHttpRequest, trackRequests, assertPermissionDenied } from "@eyeauras/cli-factory/testing";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { TeamCityClient } from "../src/client.js";
import { createTestRuntime } from "./support.js";

const base = "https://teamcity.test/app/rest";
const server = setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());
const json = JSON.stringify;
type Case = { name: string; argv: string[]; path: string; method?: string; permission?: string;
  query?: Record<string, string>; body?: unknown; response?: unknown; text?: string };
const cases: Case[] = [
  { name: "1 open agent policy", argv: ["agents", "policy", "set", "7", "future", "--fields", "id"], path: "/agents/id:7/compatibilityPolicy", query: { fields: "id" }, body: { policy: "future" } },
  { name: "1 authentication mode", argv: ["server", "authentication", "replace", "--item", json({ buildAuthenticationMode: "future" }), "--confirm"], permission: "Admin", path: "/server/authSettings", body: { buildAuthenticationMode: "future" } },
  { name: "1 cleanup ranges", argv: ["server", "cleanup", "configure", "--item", json({ daily: { hour: -1, minute: 99 }, maxCleanupDuration: 2147483648 })], permission: "Admin", path: "/server/cleanup", body: { daily: { hour: -1, minute: 99 }, maxCleanupDuration: 2147483648 } },
  { name: "1 global int32", argv: ["server", "settings", "set", "--item", json({ defaultQuietPeriod: 2147483648 })], permission: "Admin", path: "/server/globalSettings", body: { defaultQuietPeriod: 2147483648 } },
  { name: "1 versioned values", argv: ["projects", "versioned-settings", "config", "replace", "Example", "--fields", "id", "--item", json({ synchronizationMode: "future", buildSettingsMode: "future", importDecision: "future" })], path: "/projects/id:Example/versionedSettings/config", query: { fields: "id" }, body: { synchronizationMode: "future", buildSettingsMode: "future", importDecision: "future" } },
  { name: "2 omitted status comment", argv: ["builds", "set-status", "7", "future", "--fields", "id"], method: "POST", path: "/builds/id:7/status", query: { fields: "id" }, body: { status: "future" } },
  { name: "2 omitted queue reason", argv: ["queue", "paused", "set", "true"], path: "/buildQueue/pausedState", body: { paused: true } },
  { name: "2 omitted requestor", argv: ["builds", "start-agentless", "7", "--fields", "id"], path: "/builds/id:7/runningData", query: { fields: "id" } },
  { name: "2 empty account update", argv: ["users", "update", "7", "--fields", "id"], permission: "Admin", path: "/users/id:7", query: { fields: "id" }, body: {} },
  { name: "2 native account update", argv: ["users", "update", "7", "--fields", "id", "--item", json({ email: "fixture@example.test", enabled: false })], permission: "Admin", path: "/users/id:7", query: { fields: "id" }, body: { email: "fixture@example.test", enabled: false } },
  { name: "2 empty mute collection", argv: ["mutes", "create-many", "--fields", "id"], method: "POST", path: "/mutes/multiple", query: { fields: "id" }, body: { mute: [] } },
  { name: "2 empty investigation collection", argv: ["investigations", "create-many", "--fields", "id"], method: "POST", path: "/investigations/multiple", query: { fields: "id" }, body: { investigation: [] } },
  { name: "2 empty queue reorder", argv: ["queue", "reorder", "--fields", "id"], path: "/buildQueue/order", query: { fields: "id" }, body: { build: [] } },
  { name: "3 native investigation", argv: ["investigations", "create", "--fields", "id", "--item", json({ scope: { project: { id: "Example" } }, target: { anyProblem: true }, assignment: { text: "caller", timestamp: "fixture" } })], method: "POST", path: "/investigations", query: { fields: "id" }, body: { scope: { project: { id: "Example" } }, target: { anyProblem: true }, assignment: { text: "caller", timestamp: "fixture" } } },
  { name: "3 compact mute with native fields", argv: ["mutes", "create", "--fields", "id", "--item", json({ jobs: [], tests: [], resolution: "future", assignment: { text: "caller" } })], method: "POST", path: "/mutes", query: { fields: "id" }, body: { scope: { buildTypes: { buildType: [] } }, target: { tests: { test: [] } }, resolution: { type: "future" }, assignment: { text: "caller" } } },
  { name: "3 native bulk properties", argv: ["jobs", "steps", "replace-all", "Example", "--fields", "id", "--item", json({ properties: { count: 0, property: [] }, plugin: { text: "native" } })], path: "/buildTypes/id:Example/steps", query: { fields: "id" }, body: { step: [{ properties: { count: 0, property: [] }, plugin: { text: "native" } }] } },
  { name: "3 authentication property metadata", argv: ["server", "authentication", "replace", "--confirm", "--item", json({ modules: { count: 1, module: [{ name: "Fixture", properties: { count: 0, href: "fixture", property: [] } }] } })], permission: "Admin", path: "/server/authSettings", body: { modules: { count: 1, module: [{ name: "Fixture", properties: { count: 0, href: "fixture", property: [] } }] } } },
  { name: "4 project list", argv: ["projects", "list", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/projects", query: { locator: "start:0,count:100", fields: "nextHref,project(id)" } },
  { name: "4 job list", argv: ["jobs", "list", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/buildTypes", query: { locator: "start:0,count:100", fields: "nextHref,buildType(id)" } },
  { name: "4 build list", argv: ["builds", "list", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/builds", query: { locator: "start:0,count:100", fields: "nextHref,build(id)" } },
  { name: "4 agent list", argv: ["agents", "list", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/agents", query: { locator: "start:0,count:100", fields: "nextHref,agent(id)" } },
  { name: "4 file controls", argv: ["jobs", "files", "list", "Example", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/buildTypes/id:Example/vcs/files/latest/children", query: { locator: "count:100", fields: "count,file(id)" } },
  { name: "4 cancellation", argv: ["builds", "cancel", "7", "--fields", "id"], method: "POST", path: "/builds/id:7", query: { fields: "id" }, body: {} },
  { name: "4 approval", argv: ["queue", "approval", "approve", "7", "--fields", "id"], method: "POST", path: "/buildQueue/id:7/approve", query: { fields: "id" } },
  { name: "4 backup", argv: ["server", "backup", "start", "fixture", "--confirm"], permission: "Admin", method: "POST", path: "/server/backup", query: { fileName: "fixture" }, text: "fixture" },
  { name: "5 bulk unmute has no GET", argv: ["mutes", "delete-many", "--id", "7", "--confirm", "--fields", "id"], method: "DELETE", path: "/mutes/multiple", query: { fields: "id" }, body: { mute: [{ id: 7 }] } },
  { name: "6 leading and empty path segments", argv: ["jobs", "files", "metadata", "Example", "/a//b", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/buildTypes/id:Example/vcs/files/latest/metadata//a//b", query: { fields: "id" } },
  { name: "6 JSON Unicode", argv: ["users", "update", "7", "--fields", "id", "--item", json({ name: "\ud800", extra: "\ud800" })], permission: "Admin", path: "/users/id:7", query: { fields: "id" }, body: { name: "\ud800", extra: "\ud800" } },
  { name: "6 cloud profile filter", argv: ["cloud", "profiles", "list", "--cloud-profile", "Example", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/cloud/profiles", query: { locator: "profile:(id:Example),start:0,count:100", fields: "nextHref,cloudProfile(id)" } },
  { name: "6 queue deletion without job", argv: ["queue", "delete-page", "--confirm", "--fields", "id"], method: "DELETE", path: "/buildQueue", query: { locator: "start:0,count:100", fields: "id" } },
];
for (const c of cases) test(`#381 category ${c.name}`, async t => {
  const runtime = await createTestRuntime(t, { profiles: [{ name: "default", url: "https://teamcity.test", permissions: [] }] });
  const cli = runtime.createCli();
  const requests = trackRequests(t, 1, async request => {
    await assertHttpRequest(request, { method: c.method ?? "PUT", url: base + c.path, query: c.query ?? {},
      ...(c.body === undefined ? {} : { body: { json: c.body } }) });
    return c.text === undefined ? HttpResponse.json(c.response ?? {}) : HttpResponse.text(c.text);
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  await assertPermissionDenied(cli, c.argv, c.permission ?? "Update", requests);
  await cli.execute(["permissions", "grant", c.permission ?? "Update"]);
  await cli.execute(c.argv);
});

for (const status of [403, 404, 500]) test(`#381 category 5 password metadata ${status} falls back to caller input`, async t => {
  const runtime = await createTestRuntime(t);
  const cli = runtime.createCli();
  await cli.execute(["permissions", "grant", "Credentials"]);
  const path = base + "/buildTypes/id:Example/parameters/env.MODE";
  const requests = trackRequests(t, 2, async (request, index) => {
    await assertHttpRequest(request, index === 0 ? { method: "GET", url: path, query: { fields: "name,inherited,type(rawValue)" } }
      : { method: "PUT", url: path, query: {}, body: { json: { name: "env.MODE", value: "synthetic-value" } } });
    return index === 0 ? new HttpResponse(null, { status }) : new HttpResponse(null, { status: 204 });
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  assert.deepEqual(await cli.execute(["jobs", "parameters", "set-password", "Example", "env.MODE", "--value", "synthetic-value"]), { jobId: "Example", name: "env.MODE", stored: true });
});

const sdkCases: { name: string; path: string; body: unknown; call: (c: TeamCityClient) => Promise<unknown>; query?: Record<string, string> }[] = [
  { name: "3 native step", path: "/buildTypes/id:Example/steps", body: { plugin: true, properties: { count: 0, property: [] } }, call: c => c.createStep("Example", { plugin: true, properties: { count: 0, property: [] } } as never, "id") },
  { name: "3 native extension", path: "/buildTypes/id:Example/features", body: { disabled: false, plugin: true }, call: c => c.createExtension("features", "Example", { disabled: false, plugin: true } as never, "id") },
  { name: "3 native snapshot", path: "/buildTypes/id:Example/snapshot-dependencies", body: { "source-buildType": { id: "Source", extra: true }, plugin: true }, call: c => c.createSnapshotDependency("Example", { "source-buildType": { id: "Source", extra: true }, plugin: true } as never, "id") },
];
for (const c of sdkCases) test(`#381 category ${c.name}`, async t => {
  const requests = trackRequests(t, 1, async request => {
    await assertHttpRequest(request, { method: "POST", url: base + c.path, query: c.query ?? { fields: "id" }, body: { json: c.body } });
    return HttpResponse.json({});
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  await c.call(new TeamCityClient({ baseUrl: "https://teamcity.test", token: "fixture-token" }));
});
