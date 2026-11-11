import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { assertHttpRequest, trackRequests } from "@eyeauras/cli-factory/testing";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createTestRuntime } from "./support.js";
import type { CommandDefinition } from "@eyeauras/cli-factory";
import { teamCityDefinition } from "../src/cli.js";

const server = setupServer();
const origin = "https://teamcity.test";
const projection = " extra(*),properties(property(*)) ";
const native = { extra: { enabled: false, values: [null, 0, "native"] } };
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());

// Independent method/path/query expectations for each previously missing response family.
const cases: Array<{ argv: string[]; method: string; path: string; query?: Record<string, string>; noFields?: boolean; body?: unknown; text?: string }> = [
  { argv: ["users", "roles", "list", "7"], noFields: true, method: "GET", path: "/users/id:7/roles" },
  { argv: ["users", "roles", "replace", "7", "--item", '{"roleId":"reader","global":true}'], noFields: true, method: "PUT", path: "/users/id:7/roles", body: { role: [{ roleId: "reader", scope: "g" }] } },
  { argv: ["server", "settings", "show"], noFields: true, method: "GET", path: "/server/globalSettings" },
  { argv: ["server", "settings", "set", "--item", '{}'], noFields: true, method: "PUT", path: "/server/globalSettings", body: {} },
  { argv: ["server", "cleanup", "show"], noFields: true, method: "GET", path: "/server/cleanup" },
  { argv: ["server", "cleanup", "configure", "--item", '{}'], noFields: true, method: "PUT", path: "/server/cleanup", body: {} },
  { argv: ["server", "authentication", "show"], noFields: true, method: "GET", path: "/server/authSettings" },
  { argv: ["server", "authentication", "replace", "--item", '{}', "--confirm"], noFields: true, method: "PUT", path: "/server/authSettings", body: {} },
  { argv: ["jobs", "run", "Demo"], method: "POST", path: "/buildQueue", body: { buildType: { id: "Demo" } } },
  { argv: ["jobs", "delete", "Demo"], noFields: true, method: "DELETE", path: "/buildTypes/id:Demo" },
  { argv: ["users", "properties", "exists", "7", "color"], method: "GET", path: "/users/id:7/properties/color", noFields: true, text: "blue" },
  { argv: ["users", "properties", "set", "7", "color", "blue"], method: "PUT", path: "/users/id:7/properties/color", noFields: true, text: "blue" },
  { argv: ["builds", "batch", "status", "--build", "7"], method: "GET", path: "/builds/aggregated/item:(id:7)/status", noFields: true, text: "SUCCESS" },
  { argv: ["server", "rest-info"], method: "GET", path: "", noFields: true, text: "future REST landing response" },
  { argv: ["server", "rest-version"], method: "GET", path: "/version", noFields: true, text: "future" },
  { argv: ["jobs", "features", "parameters", "replace", "Demo", "feature", "--property", "color=blue"], method: "PUT", path: "/buildTypes/id:Demo/features/feature/parameters", body: { property: [{ name: "color", value: "blue" }] } },
  { argv: ["vcs", "roots", "properties", "replace", "Demo", "--property", "color=blue"], method: "PUT", path: "/vcs-roots/id:Demo/properties", body: { property: [{ name: "color", value: "blue" }] } },
  { argv: ["projects", "versioned-settings", "context", "replace", "Demo", "--property", "color=blue"], noFields: true, method: "PUT", path: "/projects/id:Demo/versionedSettings/contextParameters", body: { versionedSettingsContextParameter: [{ name: "color", value: "blue" }] } },
  { argv: ["projects", "versioned-settings", "tokens", "list", "Demo"], noFields: true, method: "GET", path: "/projects/id:Demo/versionedSettings/tokens" },
  { argv: ["changes", "attributes", "7"], method: "GET", path: "/changes/id:7/attributes" },
  { argv: ["users", "properties", "list", "7"], method: "GET", path: "/users/id:7/properties" },
  { argv: ["agents", "parameters", "list", "7"], method: "GET", path: "/agents/id:7" },
];

for (const c of cases) test(`#382 native response: ${c.argv.join(" ")}`, async t => {
  const rt = await createTestRuntime(t, { profiles: [{ name: "default", url: origin, permissions: ["ReadOnly", "Update", "Admin", "Credentials"] }] });
  const requests = trackRequests(t, 4, async request => {
    await assertHttpRequest(request.clone(), {
      method: c.method, url: origin + "/app/rest" + c.path,
      query: { ...c.query, ...(c.noFields ? {} : { fields: projection }) },
      ...(c.body === undefined ? c.method === "PUT" && c.text ? { body: { text: "blue" } } : {} : { body: { json: c.body } }),
    });
    return c.text === undefined ? HttpResponse.json(native) : HttpResponse.text(c.text);
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  const cli = rt.createCli();
  const argv = [...c.argv, "--fields", projection];
  const expected = c.text ?? native;
  assert.deepEqual(await cli.execute(argv), expected);
  assert.deepEqual(await rt.json(cli, argv), expected);
  assert.deepEqual(await rt.rpc(cli, [argv]), [{ jsonrpc: "2.0", id: 0, result: expected }]);
  const human = await rt.run(cli, argv);
  assert.equal(human.exitCode, 0, human.stderr);
  assert.match(human.stdout, c.text === undefined ? /extra:/ : new RegExp(c.text));
});

test("#382 authentication native properties retain read-side secret hiding", async t => {
  const rt = await createTestRuntime(t, { profiles: [{ name: "default", url: origin, permissions: ["ReadOnly", "Admin"] }] });
  server.use(http.all("*", () => HttpResponse.json({ modules: { module: [{ name: "fixture", properties: { property: [
    { name: "color", value: "blue" }, { name: "secure:key", value: "synthetic-hidden" },
    { name: "password", value: "synthetic-hidden", type: { rawValue: "password" } },
  ] } }] } })));
  for (const argv of [["server", "authentication", "show"], ["server", "authentication", "replace", "--item", "{}", "--confirm"]]) {
    const value = JSON.stringify(await rt.createCli().execute([...argv, "--fields", "*"]));
    assert.match(value, /blue/);
    assert.doesNotMatch(value, /synthetic-hidden/);
  }
});

test("#382 HTTP text is useful, bounded to 4 KiB, UTF-8 safe and masks the profile credential", async t => {
  const token = "synthetic-echoed-profile-token";
  const rt = await createTestRuntime(t, { tokens: { default: token } });
  const prefix = `Server explains: invalid selection ${token} `;
  const body = prefix + "é".repeat(4096) + "beyond-bound";
  server.use(http.all("*", () => HttpResponse.text(body, { status: 400 })));
  const cli = rt.createCli();
  await assert.rejects(cli.execute(["server", "status"]), error => {
    const value = error as Error & { code: string; exitCode: number };
    assert.equal(value.code, "http.rejected");
    assert.match(value.message, /Server explains: invalid selection/);
    assert.doesNotMatch(value.message, /synthetic-echoed-profile-token|beyond-bound|\uFFFD/);
    assert.ok(Buffer.byteLength(value.message) <= 4096 + 100);
    return true;
  });
  for (const verbose of [[], ["--verbose"]]) {
    for (const format of [[], ["--json"]]) {
      const out = await rt.run(cli, ["server", "status", ...verbose, ...format]);
      assert.equal(out.exitCode, 1);
      assert.match(out.stderr, /Server explains: invalid selection/);
      assert.doesNotMatch(out.stderr, new RegExp(token));
    }
    const rpc = JSON.stringify(await rt.rpc(cli, [["server", "status", ...verbose]]));
    assert.match(rpc, /Server explains: invalid selection/);
    assert.doesNotMatch(rpc, new RegExp(token));
  }
});

test("#382 XML outside the old plugin subset returns its original text", async t => {
  const xml = '<?xml version="1.0"?><plugin xmlns="urn:fixture" name="rest"><description><![CDATA[future]]></description></plugin>';
  const rt = await createTestRuntime(t);
  server.use(http.get("*", () => HttpResponse.xml(xml)));
  assert.equal(await rt.createCli().execute(["server", "rest-plugin"]), xml);
});

test("#382 status SVG saves the bytes supplied by TeamCity", async t => {
  const svg = '<?xml version="1.0"?><!-- fixture --><svg xmlns="http://www.w3.org/2000/svg"><text>future</text></svg>';
  const rt = await createTestRuntime(t);
  server.use(http.get("*", () => new HttpResponse(svg, { headers: { "content-type": "text/xml" } })));
  const target = join(rt.root, "fixture.svg");
  await rt.createCli().execute(["builds", "icon", "7", "--output", target]);
  assert.equal(await readFile(target, "utf8"), svg);
});

for (const value of ["%env.MODE%", ""]) test(`#382 stores resolved parameter ${JSON.stringify(value)}`, async t => {
  const rt = await createTestRuntime(t, { profiles: [{ name: "default", url: origin, permissions: ["Credentials"] }] });
  server.use(http.get("*", () => HttpResponse.text(value)));
  assert.deepEqual(await rt.createCli().execute(["builds", "resolve-parameter", "7", "env.MODE", "--store-as", "resolved"]), { alias: "resolved", stored: true });
  assert.equal(await rt.secretStore.get("ai-cli-factory:teamcity-cli", "default:input-secret:resolved"), value);
});

test("#382 every declared response leaf has fields or a native-file/secret/local exception", () => {
  const exceptions = [
    "builds artifacts download <id> <path>", "builds artifacts archive <id> <path>",
    "builds source <id> <path>", "builds icon <id>", "builds aggregate-icon <id>",
    "jobs files download <id> <path>", "jobs files archive <id> <path>",
    "server files download <id> <path>", "server files archive <id> <path>",
    "vcs instances files download <id> <path>", "vcs instances files archive <id> <path>",
    "users avatar download <id>", "users avatar download-hash <id> <hash>",
    "builds resolve-parameter <id> <name>", "projects secure create-reference <id>",
    "projects secure resolve <id>", "pools tokens create <id>",
    "projects secure forget-reference <alias>", "users tokens forget",
    "credentials import <alias>", "credentials forget <alias>",
  ];
  const missing: string[] = [];
  let count = 0;
  function walk(nodes: readonly CommandDefinition[], prefix: string[] = []) {
    for (const node of nodes) {
      if (node.children) walk(node.children, [...prefix, node.name.split(" ")[0]!]);
      else if (node.run) {
        count++;
        if (!node.options?.some(option => option.flags === "--fields <projection>")) missing.push([...prefix, node.name].join(" "));
      }
    }
  }
  walk(teamCityDefinition().commands);
  assert.equal(count, 460);
  assert.deepEqual(missing.sort(), exceptions.sort());
});

test("#382 native scalar values retain known password and secure-name hiding", async t => {
  const rt = await createTestRuntime(t, { profiles: [{ name: "default", url: origin, permissions: ["ReadOnly", "Credentials"] }] });
  server.use(http.all("*", ({ request }) => request.method === "GET" && new URL(request.url).pathname.includes("/parameters/")
    ? HttpResponse.json({ name: "hidden", type: { rawValue: "password" } })
    : HttpResponse.text("synthetic-hidden-value")));
  const cli = rt.createCli();
  for (const argv of [
    ["users", "properties", "exists", "7", "secure:key"],
    ["jobs", "parameters", "set-password", "Demo", "hidden", "--value", "synthetic-input"],
    ["jobs", "parameters", "value", "show", "Demo", "hidden"],
  ]) {
    assert.doesNotMatch(JSON.stringify(await cli.execute([...argv, "--fields", "*"])), /synthetic-hidden-value/);
  }
});

test("#382 relative server paths and text metrics retain the server values", async t => {
  const rt = await createTestRuntime(t);
  server.use(http.get("*/settingsFile", () => HttpResponse.text("relative/future.xml")),
    http.get("*/metrics", () => HttpResponse.json({ metric: [{ name: "fixture", metricValues: { metricValue: [{ name: "value", value: "future" }] } }] })));
  const cli = rt.createCli();
  assert.deepEqual(await cli.execute(["jobs", "settings-path", "Demo"]), { serverPath: "relative/future.xml" });
  assert.deepEqual(await cli.execute(["server", "metrics"]), { count: 1, items: [{ name: "fixture", values: [{ name: "value", value: "future" }] }] });
});

for (const value of ["", "."]) test(`#382 stores the opaque secure reference ${JSON.stringify(value)}`, async t => {
  const rt = await createTestRuntime(t, { profiles: [{ name: "default", url: origin, permissions: ["Credentials"] }] });
  server.use(http.post("*", () => HttpResponse.text(value)));
  assert.deepEqual(await rt.createCli().execute(["projects", "secure", "create-reference", "Demo", "--value", "synthetic-input", "--store-as", "reference"]), { projectId: "Demo", referenceAlias: "reference", stored: true });
  assert.equal(await rt.secretStore.get("ai-cli-factory:teamcity-cli", "default:secure-reference:reference"), value);
});

test("#382 diagnosis keeps its limits with native items and no mandatory status fields", async t => {
  const rt = await createTestRuntime(t);
  const requests = trackRequests(t, 3, request => {
    const url = new URL(request.url);
    const isProblem = url.pathname.endsWith("problemOccurrences");
    const isTest = url.pathname.endsWith("testOccurrences");
    assert.equal(url.searchParams.get("fields"), isProblem ? `nextHref,problemOccurrence(${projection})` : isTest ? `nextHref,testOccurrence(${projection})` : projection);
    if (isProblem || isTest) {
      assert.match(url.searchParams.get("locator")!, new RegExp(isProblem ? "count:11" : "count:21"));
      return HttpResponse.json({ [isProblem ? "problemOccurrence" : "testOccurrence"]: [native] });
    }
    return HttpResponse.json(native);
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  assert.deepEqual(await rt.createCli().execute(["builds", "diagnose", "7", "--fields", projection]), {
    build: native, problems: { status: "complete", items: [native] }, failedTests: { status: "complete", items: [native] }, partial: false,
  });
});

test("#382 wait observes the outcome before requesting an ID-free native projection", async t => {
  const rt = await createTestRuntime(t);
  const requests = trackRequests(t, 2, request => new URL(request.url).searchParams.get("fields") === projection
    ? HttpResponse.json(native) : HttpResponse.json({ id: 7, state: "finished", status: "SUCCESS" }));
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  assert.deepEqual(await rt.createCli().execute(["builds", "wait", "7", "--fields", projection]), native);
});

test("#382 failed waits retain their code and expose the final native result", async t => {
  const rt = await createTestRuntime(t);
  const requests = trackRequests(t, 2, request => new URL(request.url).searchParams.get("fields") === projection
    ? HttpResponse.json(native) : HttpResponse.json({ id: 7, state: "finished", status: "FAILURE" }));
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  await assert.rejects(rt.createCli().execute(["builds", "wait", "7", "--fields", projection]), error => {
    assert.equal((error as { code: string }).code, "build.failed");
    assert.deepEqual((error as { result: unknown }).result, native);
    return true;
  });
});
