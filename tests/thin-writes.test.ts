import assert from "node:assert/strict";
import test from "node:test";
import { assertHttpRequest, trackRequests, assertPermissionDenied } from "@eyeauras/cli-factory/testing";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
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
    const runtime = await createTestRuntime(t);
    const cli = runtime.createCli();
    const requests = trackRequests(t, c.name.startsWith("plain password") ? 2 : 1, async request => {
      if (c.name.startsWith("plain password") && request.method === "GET") {
        await assertHttpRequest(request, { method: "GET", url: base + c.path, query: { fields: "name,inherited,type(rawValue)" } });
        return HttpResponse.json(protectedProperty);
      }
      await assertHttpRequest(request, {
        method: c.method ?? "PUT", url: base + c.path, query: c.query ?? {},
        body: c.json === undefined ? { text: c.text ?? "" } : { json: c.json },
      });
      return c.response === undefined ? HttpResponse.text("synthetic-reference") : HttpResponse.json(c.response);
    });
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    await assertPermissionDenied(cli, c.argv, c.permission ?? "Update", requests);
    await cli.execute(["permissions", "grant", c.permission ?? "Update"]);
    await cli.execute(c.argv);
  });
}
