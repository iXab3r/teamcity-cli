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
const parameter = "/buildTypes/id:Example/parameters";
const fields = "name,value,inherited,type(rawValue)";
const protectedProperty = { name: "env.ACCESS_TOKEN", value: " synthetic-value \n", type: { rawValue: "password" } };

type WriteCase = {
  name: string; argv: string[]; path: string; method?: string; permission?: string;
  query?: Record<string, string>; json?: unknown; text?: string; response?: unknown;
};
const cases: WriteCase[] = [
  {
    name: "credential-like parameter name",
    argv: ["jobs", "parameters", "value", "set", "Example", "env.ACCESS_TOKEN", " synthetic-value \n"],
    path: parameter + "/env.ACCESS_TOKEN/value", text: " synthetic-value \n",
  },
  ...["-----BEGIN PRIVATE KEY-----\nsynthetic-not-a-key\n-----END PRIVATE KEY-----", "Bearer synthetic-value", "https://fixture:synthetic-password@repository.test/path?signature=synthetic-signature", "credentialsJSON:synthetic-value"].map(value => ({
    name: "secret-shaped value " + value.split(/[\n: ]/)[0],
    argv: ["jobs", "parameters", "set", "Example", "env.MODE", "--value", value],
    path: parameter + "/env.MODE", query: { fields }, json: { name: "env.MODE", value },
    response: { name: "env.MODE", value },
  })),
  {
    name: "password-typed parameter without a metadata preflight",
    argv: ["jobs", "parameters", "set", "Example", "env.ACCESS_TOKEN", "--value", protectedProperty.value],
    path: parameter + "/env.ACCESS_TOKEN", query: { fields },
    json: { name: protectedProperty.name, value: protectedProperty.value }, response: protectedProperty,
  },
  {
    name: "collection replacement without a protected-metadata preflight",
    argv: ["jobs", "parameters", "replace-all", "Example", "--property", "env.ACCESS_TOKEN=synthetic-new"],
    path: parameter, query: { fields: `property(${fields})` },
    json: { property: [{ name: "env.ACCESS_TOKEN", value: "synthetic-new" }] }, response: { property: [protectedProperty] },
  },
  {
    name: "protected metadata in a native replacement item",
    argv: ["jobs", "steps", "replace-all", "Example", "--item", JSON.stringify({ name: "Fixture", type: "simpleRunner", properties: [protectedProperty] })],
    path: "/buildTypes/id:Example/steps", query: { fields: `step(id,name,type,disabled,inherited,properties(property(${fields})))` },
    json: { step: [{ name: "Fixture", type: "simpleRunner", properties: { property: [protectedProperty] } }] }, response: {},
  },
  {
    name: "agent credential-like scalar name",
    argv: ["agents", "fields", "set", "7", "authToken", "Bearer synthetic-value"],
    path: "/agents/id:7/authToken", text: "Bearer synthetic-value",
  },
  {
    name: "server credential-like native fields",
    argv: ["server", "settings", "set", "--item", JSON.stringify({ authToken: "Bearer synthetic-value", "superuser-token": "synthetic-value" })],
    permission: "Admin", path: "/server/globalSettings",
    json: { authToken: "Bearer synthetic-value", "superuser-token": "synthetic-value" }, response: {},
  },
  {
    name: "plain password input alongside the alias option",
    argv: ["jobs", "parameters", "set-password", "Example", "env.ACCESS_TOKEN", "--value", protectedProperty.value],
    permission: "Credentials", path: parameter + "/env.ACCESS_TOKEN", json: protectedProperty,
  },
  {
    name: "plain authentication property alongside secret aliases",
    argv: ["server", "authentication", "replace", "--item", JSON.stringify({ modules: [{ name: "Fixture", properties: [{ name: "password", value: "synthetic-value" }] }] }), "--confirm"],
    permission: "Admin", path: "/server/authSettings",
    json: { modules: { module: [{ name: "Fixture", properties: { property: [{ name: "password", value: "synthetic-value" }] } }] } }, response: {},
  },
  {
    name: "plain license key alongside the alias option",
    argv: ["server", "licenses", "add", "--key", "synthetic-license"],
    permission: "Admin", method: "POST", path: "/server/licensingData/licenseKeys",
    query: { fields: "count,licenseKey(valid,active,expired,obsolete,expirationDate,maintenanceEndDate,type,servers,agents,unlimitedAgents,buildTypes,unlimitedBuildTypes,pipelines,unlimitedPipelines)" }, text: "synthetic-license", response: {},
  },
  {
    name: "plain license key lookup",
    argv: ["server", "licenses", "show", "--key", "synthetic-license"],
    permission: "ReadOnly", method: "GET", path: "/server/licensingData/licenseKeys/synthetic-license",
    query: { fields: "valid,active,expired,obsolete,expirationDate,maintenanceEndDate,type,servers,agents,unlimitedAgents,buildTypes,unlimitedBuildTypes,pipelines,unlimitedPipelines" }, response: {},
  },
  {
    name: "plain license key deletion",
    argv: ["server", "licenses", "delete", "--key", "synthetic-license", "--confirm"],
    permission: "Admin", method: "DELETE", path: "/server/licensingData/licenseKeys/synthetic-license",
  },
  {
    name: "plain secure-reference input preserving whitespace",
    argv: ["projects", "secure", "create-reference", "Example", "--value", " synthetic-value \n", "--store-as", "fixture"],
    permission: "Credentials", method: "POST", path: "/projects/id:Example/secure/tokens", text: " synthetic-value \n",
  },
  {
    name: "versioned settings secure storage flag without overriding it",
    argv: ["projects", "versioned-settings", "config", "replace", "Example", "--item", JSON.stringify({ storeSecureValuesOutsideVcs: false })],
    path: "/projects/id:Example/versionedSettings/config",
    query: { fields: "synchronizationMode,vcsRootId,format,buildSettingsMode,allowUIEditing,showSettingsChanges,storeSecureValuesOutsideVcs,portableDsl,settingsPath,applyChangesInDependenciesAndVcsSettings,dslExecutionMode" },
    json: { storeSecureValuesOutsideVcs: false }, response: {},
  },
  {
    name: "versioned settings secure storage scalar flag",
    argv: ["projects", "versioned-settings", "config", "fields", "set", "Example", "storeSecureValuesOutsideVcs", "false"],
    path: "/projects/id:Example/versionedSettings/config/parameters/storeSecureValuesOutsideVcs", text: "false",
  },
  {
    name: "plain versioned token mapping alongside aliases",
    argv: ["projects", "versioned-settings", "tokens", "set", "Example", "--property", "remote= synthetic-value \n"],
    permission: "Credentials", method: "POST", path: "/projects/id:Example/versionedSettings/tokens",
    json: { versionedSettingsToken: [{ name: "remote", value: " synthetic-value \n" }] },
  },
];

for (const c of cases) {
  test(`#379 forwards ${c.name}`, async t => {
    const runtime = await createTestRuntime(t, { profiles: [{ name: "default", url: "https://teamcity.test", permissions: [] }] });
    const cli = runtime.createCli();
    const requests = trackRequests(t, c.name.startsWith("plain password") ? 2 : 1, async request => {
      if (c.name.startsWith("plain password") && request.method === "GET") {
        await assertHttpRequest(request, { method: "GET", url: base + c.path, query: { fields: "name,inherited,type(rawValue)" } });
        return HttpResponse.json(protectedProperty);
      }
      await assertHttpRequest(request, {
        method: c.method ?? "PUT", url: base + c.path, query: c.query ?? {},
        ...(c.json !== undefined ? { body: { json: c.json } } : c.text !== undefined ? { body: { text: c.text } } : {}),
      });
      return c.response === undefined ? HttpResponse.text("synthetic-reference") : HttpResponse.json(c.response);
    });
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    await assertPermissionDenied(cli, c.argv, c.permission ?? "Update", requests);
    await cli.execute(["permissions", "grant", c.permission ?? "Update"]);
    await cli.execute(c.argv);
  });
}

test("#379 SDK collection replacement retains protected metadata and build scalar input", async t => {
  const client = new TeamCityClient({ baseUrl: "https://teamcity.test", token: "fixture-token" });
  const requests = trackRequests(t, 2, async (request, index) => {
    await assertHttpRequest(request, index === 0 ? {
      method: "PUT", url: base + parameter, query: { fields: `property(${fields})` },
      body: { json: { property: [protectedProperty] } },
    } : {
      method: "PUT", url: base + "/builds/id:7/number", query: {},
      body: { text: "Bearer synthetic-value" },
    });
    return index === 0 ? HttpResponse.json({ property: [protectedProperty] }) : HttpResponse.text("accepted");
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  const result = await client.replaceAllParameters("jobs", "Example", [protectedProperty]);
  assert.deepEqual(result, [{ name: protectedProperty.name, type: "protected", redacted: true }]);
  await client.setBuildScalar(7, "number", "Bearer synthetic-value");
});

test("#379 direct input takes precedence over aliases and remote rejection is not retried", async t => {
  const runtime = await createTestRuntime(t);
  const cli = runtime.createCli();
  await cli.execute(["permissions", "grant", "Admin"]);
  const requests = trackRequests(t, 1, async request => {
    assert.equal(await request.text(), " synthetic-license \n");
    return HttpResponse.text("synthetic-private-error", { status: 400 });
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  const result = await runtime.run(cli, ["server", "licenses", "add", "--secret", "missing-alias", "--key", " synthetic-license \n", "--json"]);
  assert.equal(result.exitCode, 1);
  assert.equal(JSON.parse(result.stderr).error.code, "http.rejected");
  assert.doesNotMatch(result.stderr, /synthetic-private-error/);
});

for (const existing of [false, true]) {
  test(`#379 direct versioned mapping skips ${existing ? "existing" : "missing"} alias`, async t => {
    const runtime = await createTestRuntime(t);
    if (existing) await runtime.secretStore.set("ai-cli-factory:teamcity-cli", "default:input-secret:source", "synthetic-alias-value");
    const cli = runtime.createCli();
    await cli.execute(["permissions", "grant", "Credentials"]);
    const requests = trackRequests(t, 1, async request => {
      await assertHttpRequest(request, { method: "POST", url: base + "/projects/id:Example/versionedSettings/tokens", query: {},
        body: { json: { versionedSettingsToken: [{ name: "remote", value: "synthetic-direct" }] } } });
      return new HttpResponse(null, { status: 204 });
    });
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    assert.deepEqual(await cli.execute(["projects", "versioned-settings", "tokens", "set", "Example", "--property", "remote=synthetic-direct", "--mapping", "remote=source"]),
      { names: ["remote"], updated: true });
  });

  test(`#379 direct authentication property skips ${existing ? "existing" : "missing"} alias`, async t => {
    const runtime = await createTestRuntime(t);
    if (existing) await runtime.secretStore.set("ai-cli-factory:teamcity-cli", "default:input-secret:source", "synthetic-alias-value");
    const cli = runtime.createCli();
    await cli.execute(["permissions", "grant", "Admin"]);
    const requests = trackRequests(t, 1, async request => {
      await assertHttpRequest(request, { method: "PUT", url: base + "/server/authSettings", query: {},
        body: { json: { modules: { module: [{ name: "Fixture", properties: { property: [{ name: "password", value: "synthetic-direct" }] } }] } } } });
      return HttpResponse.json({});
    });
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    await cli.execute(["server", "authentication", "replace", "--item", JSON.stringify({ modules: [{ name: "Fixture",
      properties: [{ name: "password", value: "synthetic-direct" }], secrets: [{ name: "password", alias: "source" }] }] }), "--confirm"]);
  });
}

test("#379 alias-backed authentication property forwards control characters in names", async t => {
  const runtime = await createTestRuntime(t);
  await runtime.secretStore.set("ai-cli-factory:teamcity-cli", "default:input-secret:source", "synthetic-alias-value");
  const cli = runtime.createCli();
  await cli.execute(["permissions", "grant", "Admin"]);
  const name = "password\nfixture";
  const requests = trackRequests(t, 1, async request => {
    await assertHttpRequest(request, { method: "PUT", url: base + "/server/authSettings", query: {},
      body: { json: { modules: { module: [{ name: "Fixture", properties: { property: [{ name, value: "synthetic-alias-value" }] } }] } } } });
    return HttpResponse.json({});
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  await cli.execute(["server", "authentication", "replace", "--item", JSON.stringify({ modules: [{ name: "Fixture", secrets: [{ name, alias: "source" }] }] }), "--confirm"]);
});

test("#379 root project deletion reaches TeamCity", async t => {
  const runtime = await createTestRuntime(t);
  const cli = runtime.createCli();
  const argv = ["projects", "delete", "_Root"];
  const requests = trackRequests(t, 1, async request => {
    await assertHttpRequest(request, { method: "DELETE", url: base + "/projects/id:_Root", query: {} });
    return new HttpResponse(null, { status: 204 });
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  await assertPermissionDenied(cli, argv, "Update", requests);
  await cli.execute(["permissions", "grant", "Update"]);
  assert.deepEqual(await cli.execute(argv), { id: "_Root", deleted: true });
});

for (const alias of [undefined, "missing-reference"]) {
  test(`#379 direct secure reference ${alias ? "wins over alias" : "works without alias"}`, async t => {
    const runtime = await createTestRuntime(t);
    const cli = runtime.createCli();
    const argv = ["projects", "secure", "resolve", "Example", "--reference-value", "synthetic/reference ?#%", "--store-as", "resolved",
      ...(alias ? ["--reference", alias] : [])];
    const requests = trackRequests(t, 1, async request => {
      await assertHttpRequest(request, { method: "GET", url: base + "/projects/id:Example/secure/values/synthetic%2Freference%20%3F%23%25", query: {} });
      return HttpResponse.text("synthetic-resolved-value");
    });
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    await assertPermissionDenied(cli, argv, "Credentials", requests);
    await cli.execute(["permissions", "grant", "Credentials"]);
    assert.deepEqual(await cli.execute(argv), { alias: "resolved", stored: true });
    assert.equal(await runtime.secretStore.get("ai-cli-factory:teamcity-cli", "default:input-secret:resolved"), "synthetic-resolved-value");
  });
}

test("#379 direct secure reference retains traversal rejection", async t => {
  const runtime = await createTestRuntime(t);
  const cli = runtime.createCli();
  await cli.execute(["permissions", "grant", "Credentials"]);
  const requests = trackRequests(t, 0, async () => HttpResponse.text("unexpected"));
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  for (const reference of [".", ".."]) {
    const result = await runtime.run(cli, ["projects", "secure", "resolve", "Example", "--reference-value", reference, "--store-as", "resolved", "--json"]);
    assert.equal(result.exitCode, 1);
    assert.match(result.stderr, /Invalid secure reference/);
  }
});
