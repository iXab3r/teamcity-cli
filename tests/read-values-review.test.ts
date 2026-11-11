import assert from "node:assert/strict";
import test from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createTestRuntime } from "./support.js";

const server = setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());
const base = "https://teamcity.test/app/rest";
const job = "/buildTypes/id:Example_Build";

for (const field of ["number", "status", "startDate"]) test(`#156 builds fields show forwards ${field}`, async t => {
  const rt = await createTestRuntime(t);
  server.use(http.get(`${base}/builds/id:101/${field}`, () => HttpResponse.text("synthetic-text")));
  assert.deepEqual(await rt.createCli().execute(["builds", "fields", "show", "101", field]), {
    buildId: 101, field, value: "synthetic-text",
  });
});

for (const [owner, id, path] of [["projects", "Example", "/projects/id:Example"], ["jobs", "Example_Build", job]] as const) {
  const argv = [owner, "parameters", "value", "show", id, "setting"];
  const metadata = http.get(`${base}${path}/parameters/setting`, () => HttpResponse.json({ name: "setting" }));
  test(`#156 ${owner} parameter value without a returned value stays valueless`, async t => {
    const rt = await createTestRuntime(t);
    server.use(metadata, http.get(`${base}${path}/parameters/setting/value`, () => new HttpResponse(null, { status: 204 })));
    assert.deepEqual(await rt.createCli().execute(argv), { name: "setting", type: "plain", redacted: true });
  });
  test(`#156 ${owner} parameter value keeps a returned empty string`, async t => {
    const rt = await createTestRuntime(t);
    server.use(metadata, http.get(`${base}${path}/parameters/setting/value`, () => HttpResponse.text("")));
    assert.deepEqual(await rt.createCli().execute(argv), { name: "setting", type: "plain", redacted: false, value: "" });
  });
}

for (const field of ["", "   "]) test(`#156 builds fields show rejects blank field ${JSON.stringify(field)} before any request`, async t => {
  const rt = await createTestRuntime(t);
  await assert.rejects(rt.createCli().execute(["builds", "fields", "show", "101", field]), /Field name is required/);
});

for (const [argv, path] of [
  [["jobs", "triggers", "fields", "show", "Example_Build", "Trigger"], `${job}/triggers/Trigger`],
  [["jobs", "fields", "show", "Example_Build"], job],
  [["projects", "fields", "show", "Example"], "/projects/id:Example"],
  [["pools", "fields", "show", "1"], "/agentPools/id:1"],
  [["agents", "fields", "show", "1"], "/agents/id:1"],
  [["builds", "fields", "show", "101"], "/builds/id:101"],
  [["changes", "field", "1"], "/changes/id:1"],
  [["users", "fields", "get", "1"], "/users/id:1"],
  [["vcs", "roots", "fields", "get", "Root"], "/vcs-roots/id:Root"],
  [["vcs", "instances", "fields", "get", "1"], "/vcs-root-instances/id:1"],
  [["projects", "versioned-settings", "config", "fields", "get", "Example"], "/projects/id:Example/versionedSettings/config/parameters"],
  [["server", "field"], "/server"],
] as const) {
  test(`#376 ${argv.join(" ")} does not infer secrecy from a field name or value`, async t => {
    const rt = await createTestRuntime(t);
    let calls = 0;
    server.use(http.get(`${base}${path}/access_token`, ({ request }) => {
      assert.equal(new URL(request.url).search, "");
      calls++;
      return HttpResponse.text("*****");
    }));
    const result = await rt.createCli().execute([...argv, "access_token"]) as { value: string };
    assert.equal(result.value, "*****");
    assert.equal(calls, 1);
  });
}

test("#376 trigger cron properties are read through the trigger, not its scalar field route", async t => {
  const rt = await createTestRuntime(t);
  const cli = rt.createCli();
  let scalarReads = 0;
  server.use(
    http.get(`${base}${job}/triggers/Trigger/cronExpression_dm`, () => {
      scalarReads++;
      return HttpResponse.text("synthetic-private-response", { status: 400 });
    }),
    http.get(`${base}${job}/triggers/Trigger`, () => HttpResponse.json({
      id: "Trigger", type: "schedulingTrigger",
      properties: { property: [{ name: "cronExpression_dm", value: "*" }] },
    })),
  );
  const rejected = await rt.run(cli, ["jobs", "triggers", "fields", "show", "Example_Build", "Trigger", "cronExpression_dm", "--json"]);
  assert.equal(rejected.exitCode, 1);
  assert.equal(JSON.parse(rejected.stderr).error.code, "http.rejected");
  assert.doesNotMatch(rejected.stderr, /synthetic-private-response/);
  assert.equal(scalarReads, 1);
  const result = await cli.execute(["jobs", "triggers", "show", "Example_Build", "Trigger"]) as { properties: unknown };
  assert.deepEqual(result.properties, [{ name: "cronExpression_dm", type: "plain", value: "*", redacted: false }]);
});

test("#156 authentication show keeps module properties and hides only protected values", async t => {
  const rt = await createTestRuntime(t);
  server.use(http.get(`${base}/server/authSettings`, () => HttpResponse.json({
    allowGuest: false,
    modules: { module: [{ name: "LDAP", properties: { property: [
      { name: "serverUrl", value: "ldap://directory.test" },
      { name: "bindToken", value: "synthetic-plain-name" },
      { name: "bindPassword", value: "synthetic-protected", type: { rawValue: "password" } },
      { name: "secure:key", value: "synthetic-secure" },
      { name: "absent" },
    ] } }, { name: "Default" }] },
  })));
  assert.deepEqual(await rt.createCli().execute(["server", "authentication", "show"]), {
    allowGuest: false,
    modules: [
      { name: "LDAP", properties: [
        { name: "serverUrl", type: "plain", redacted: false, value: "ldap://directory.test" },
        { name: "bindToken", type: "plain", redacted: false, value: "synthetic-plain-name" },
        { name: "bindPassword", type: "protected", redacted: true },
        { name: "secure:key", type: "plain", redacted: true },
        { name: "absent", type: "plain", redacted: true },
      ] },
      { name: "Default" },
    ],
  });
});
