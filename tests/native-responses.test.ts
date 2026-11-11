import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { assertHttpRequest, trackRequests } from "@eyeauras/cli-factory/testing";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createTestRuntime } from "./support.js";

const server = setupServer();
const origin = "https://teamcity.test";
const projection = " extra(*),properties(property(*)) ";
const native = { extra: { enabled: false, values: [null, 0, "native"] } };
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());

// Independent method/path/query expectations for each previously missing response family.
const cases: Array<{ argv: string[]; method: string; path: string; query?: Record<string, string>; noFields?: boolean; body?: unknown; text?: string }> = [
  { argv: ["users", "roles", "list", "7"], method: "GET", path: "/users/id:7/roles" },
  { argv: ["users", "roles", "replace", "7", "--item", '{"roleId":"reader","global":true}'], method: "PUT", path: "/users/id:7/roles", body: { role: [{ roleId: "reader", scope: "g" }] } },
  { argv: ["server", "settings", "show"], method: "GET", path: "/server/globalSettings" },
  { argv: ["server", "settings", "set", "--item", '{}'], method: "PUT", path: "/server/globalSettings", body: {} },
  { argv: ["server", "cleanup", "show"], method: "GET", path: "/server/cleanup" },
  { argv: ["server", "cleanup", "configure", "--item", '{}'], method: "PUT", path: "/server/cleanup", body: {} },
  { argv: ["server", "authentication", "show"], method: "GET", path: "/server/authSettings" },
  { argv: ["server", "authentication", "replace", "--item", '{}', "--confirm"], method: "PUT", path: "/server/authSettings", body: {} },
  { argv: ["jobs", "run", "Demo"], method: "POST", path: "/buildQueue", body: { buildType: { id: "Demo" } } },
  { argv: ["jobs", "delete", "Demo"], method: "DELETE", path: "/buildTypes/id:Demo" },
  { argv: ["users", "properties", "exists", "7", "color"], method: "GET", path: "/users/id:7/properties/color", noFields: true, text: "blue" },
  { argv: ["users", "properties", "set", "7", "color", "blue"], method: "PUT", path: "/users/id:7/properties/color", noFields: true, text: "blue" },
  { argv: ["builds", "batch", "status", "--build", "7"], method: "GET", path: "/builds/aggregated/(id:7)/status", noFields: true, text: "SUCCESS" },
  { argv: ["server", "rest-info"], method: "GET", path: "", noFields: true, text: "future REST landing response" },
  { argv: ["server", "rest-version"], method: "GET", path: "/version", noFields: true, text: "future" },
  { argv: ["jobs", "features", "parameters", "replace", "Demo", "feature", "--property", "color=blue"], method: "PUT", path: "/buildTypes/id:Demo/features/id:feature/parameters", body: { property: [{ name: "color", value: "blue" }] } },
  { argv: ["vcs", "roots", "properties", "replace", "Demo", "--property", "color=blue"], method: "PUT", path: "/vcs-roots/id:Demo/properties", body: { property: [{ name: "color", value: "blue" }] } },
  { argv: ["projects", "versioned-settings", "context", "replace", "Demo", "--property", "color=blue"], method: "PUT", path: "/projects/id:Demo/versionedSettings/contextParameters", body: { versionedSettingsContextParameter: [{ name: "color", value: "blue" }] } },
  { argv: ["projects", "versioned-settings", "tokens", "list", "Demo"], method: "GET", path: "/projects/id:Demo/versionedSettings/tokens" },
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
  server.use(http.get("*", () => new HttpResponse(svg, { headers: { "content-type": "image/svg+xml" } })));
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
