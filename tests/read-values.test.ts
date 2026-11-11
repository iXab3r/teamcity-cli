import assert from "node:assert/strict";
import test from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { trackRequests } from "@eyeauras/cli-factory/testing";
import { createTestRuntime } from "./support.js";

const server = setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());
const base = "https://teamcity.test/app/rest";
const fields = "name,value,inherited,type(rawValue)";
const script = "echo first\necho second\n";
// Hand-authored synthetic values; no captured configuration or credentials.
const properties = [
  { name: "script.content", value: script },
  { name: "env.ACCESS_TOKEN", value: "synthetic-plain-token-name", type: { rawValue: "text" } },
  { name: "password", value: "synthetic-plain-password-name" },
  { name: "api.key", value: "synthetic-plain-key-name" },
  { name: "url", value: "https://example.test/repo?token=synthetic-query" },
  { name: "hidden-display", value: "visible-text", type: { rawValue: "text display='hidden'" } },
  { name: "future-type", value: "future-value", type: { rawValue: "future-kind label='password'" } },
  { name: "unknown-type", value: "server-value", type: {} },
  { name: "empty", value: "" },
  { name: "protected", value: "synthetic-password-echo", type: { rawValue: "password display='normal'" } },
  { name: "secure:setting", value: "synthetic-secure-echo" },
  { name: "absent" },
  { name: "null", value: null },
];
const expected = properties.map((p, index) => ({
  name: p.name,
  type: index === 1 || index === 5 ? "text" : index === 6 ? "future-kind" : index === 7 ? "unknown" : index === 9 ? "protected" : "plain",
  redacted: index >= 9,
  ...(index < 9 ? { value: p.value } : {}),
}));
const job = "/buildTypes/id:Example_Build";
type Scenario = { argv: string[]; path: string; fields: string; response: unknown; expected: unknown };
const scenarios: Scenario[] = [];
for (const [owner, id, path] of [
  ["projects", "Example", "/projects/id:Example/parameters"],
  ["jobs", "Example_Build", job + "/parameters"],
  ["output-parameters", "Example_Build", job + "/output-parameters"],
]) {
  const prefix = owner === "output-parameters" ? ["jobs", owner] : [owner!, "parameters"];
  scenarios.push({ argv: [...prefix, "list", id!], path: path!, fields: `property(${fields})`, response: { property: properties }, expected });
  for (let i = 0; i < properties.length; i++) scenarios.push({ argv: [...prefix, "show", id!, properties[i]!.name], path: path! + "/" + encodeURIComponent(properties[i]!.name), fields, response: properties[i], expected: expected[i] });
}
for (const kind of ["steps", "features", "triggers", "agent-requirements", "artifact-dependencies", "snapshot-dependencies", "projectFeatures"]) {
  const project = kind === "projectFeatures";
  const prefix = project ? ["projects", "features"] : ["jobs", kind];
  const path = project ? "/projects/id:Example/projectFeatures" : job + "/" + kind;
  const key = kind === "steps" ? "step" : kind === "features" || project ? kind === "features" ? "feature" : "projectFeature" : kind === "triggers" ? "trigger" : kind === "agent-requirements" ? "agent-requirement" : kind.slice(0, -1);
  const response = { id: "Entity", type: "synthetic", ...(kind === "steps" ? { name: "Script" } : {}), properties: { property: properties } };
  const result = { id: response.id, ...(kind === "steps" ? { name: response.name } : {}), type: response.type, properties: expected };
  const entityFields = `id,${kind === "steps" ? "name," : ""}type,disabled,inherited,properties(property(${fields}))${kind.endsWith("dependencies") ? ",source-buildType(id,name,projectId)" : ""}`;
  for (const action of ["list", "show"]) scenarios.push({ argv: [...prefix, action, project ? "Example" : "Example_Build", ...(action === "show" ? ["Entity"] : [])], path: path + (action === "show" ? "/" + (project || kind === "agent-requirements" || kind === "artifact-dependencies" ? "id:" : "") + "Entity" : ""), fields: action === "show" ? entityFields : `${key}(${entityFields})`, response: action === "show" ? response : { [key]: [response] }, expected: action === "show" ? result : [result] });
}
for (const kind of ["steps", "features"]) scenarios.push({ argv: ["jobs", kind, "parameters", "list", "Example_Build", "Entity"], path: `${job}/${kind}/Entity/parameters`, fields: `property(${fields})`, response: { property: properties }, expected });
for (const kind of ["roots", "instances"]) scenarios.push({ argv: ["vcs", kind, "properties", ...(kind === "roots" ? ["list", "Git"] : ["8"])], path: `/vcs-${kind === "roots" ? "roots/id:Git" : "root-instances/id:8"}/properties`, fields: `count,property(${fields})`, response: { property: properties }, expected });
for (const kind of ["output-parameters", "resulting-properties"]) scenarios.push({ argv: ["builds", kind, "list", "101"], path: `/builds/id:101/${kind}`, fields: `count,property(${fields})`, response: { property: properties }, expected });

for (const scenario of scenarios) test(`#156 ${scenario.argv.join(" ")}: return server values and retain secret/absent shapes`, async t => {
  const rt = await createTestRuntime(t);
  const requests = trackRequests(t, 4, request => {
    assert.equal(request.method, "GET");
    assert.equal(new URL(request.url).pathname, "/app/rest" + scenario.path);
    assert.equal(new URL(request.url).searchParams.get("fields"), scenario.fields);
    return HttpResponse.json(scenario.response as object);
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  const cli = rt.createCli();
  assert.deepEqual(await cli.execute(scenario.argv), scenario.expected);
  assert.deepEqual(await rt.json(cli, scenario.argv), scenario.expected);
  assert.deepEqual(await rt.rpc(cli, [scenario.argv]), [{ jsonrpc: "2.0", id: 0, result: scenario.expected }]);
  const human = await rt.run(cli, scenario.argv);
  assert.equal(human.exitCode, 0, human.stderr);
  assert.doesNotMatch(human.stdout, /synthetic-password-echo|synthetic-secure-echo/);
  if (scenario.argv.includes("list") || scenario.argv.includes("Entity") || scenario.argv.includes("script.content")) assert.match(human.stdout, /echo first/);
});

for (const kind of ["steps", "features"]) for (const name of ["script.content", "env.ACCESS_TOKEN", "secure:setting"]) test(`#156 ${kind} scalar property ${name}`, async t => {
  const rt = await createTestRuntime(t);
  const requests = trackRequests(t, 1, () => HttpResponse.text(script));
  server.use(http.get(base + `${job}/${kind}/Entity/parameters/*`, ({ request }) => requests.handle(request)));
  assert.deepEqual(await rt.createCli().execute(["jobs", kind, "parameters", "show", "Example_Build", "Entity", name]), {
    name, type: "plain", redacted: name.startsWith("secure:"), ...(name.startsWith("secure:") ? {} : { value: script }),
  });
});

for (const owner of ["projects", "jobs"]) for (const name of ["env.ACCESS_TOKEN", "secure:setting", "protected"]) test(`#156 ${owner} parameter value ${name}`, async t => {
  const rt = await createTestRuntime(t);
  const hidden = name !== "env.ACCESS_TOKEN";
  const requests = trackRequests(t, hidden ? 1 : 2, request => new URL(request.url).pathname.endsWith("/value") ? HttpResponse.text(script) : HttpResponse.json(properties.find(p => p.name === name)!));
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  assert.deepEqual(await rt.createCli().execute([owner, "parameters", "value", "show", owner === "projects" ? "Example" : "Example_Build", name]), { name, type: name === "protected" ? "protected" : name === "env.ACCESS_TOKEN" ? "text" : "plain", redacted: hidden, ...(!hidden ? { value: script } : {}) });
});

for (const field of ["artifactRules", "buildNumberPattern", "options"]) test(`#156 job scalar ${field} preserves text`, async t => {
  const rt = await createTestRuntime(t);
  server.use(http.get(base + job + "/" + field, () => HttpResponse.text(script)));
  assert.deepEqual(await rt.createCli().execute(["jobs", "fields", "show", "Example_Build", field]), { id: "Example_Build", field, value: script });
});

test("#156 agent parameters and explicit fields preserve native data and profile credential masking", async t => {
  const token = "synthetic-read-profile-credential";
  const rt = await createTestRuntime(t, { tokens: { default: token } });
  const response = { properties: { property: [...properties, { name: "profile-echo", value: token }] } };
  server.use(http.get(base + "/agents/id:8", () => HttpResponse.json(response)));
  const result = await rt.json(rt.createCli(), ["agents", "show", "8", "--fields", "properties(*)"]);
  assert.deepEqual(result, { properties: { property: [...properties, { name: "profile-echo", value: "[redacted]" }] } });
});
