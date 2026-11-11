import assert from "node:assert/strict";
import test from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createTestRuntime } from "./support.js";

const base = "https://teamcity.test/app/rest";
const server = setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());

const plain = [
  { name: "script.content", value: "echo first\necho second --token=ordinary-text" },
  { name: "plugin.docker.imageId", value: "example/image:latest" },
  { name: "command.parameters", value: "--input source --output dist" },
  { name: "docker.run.parameters", value: "--volume cache:/cache" },
  { name: "property-name", value: "env.API_TOKEN" },
  { name: "property-value", value: "linux" },
  { name: "branchFilter", value: "+:release/*" },
  { name: "pathRules", value: "dist/*.zip => artifacts" },
  { name: "url", value: "ssh://git@example.test/project/repo.git" },
  { name: "env.ACCESS_TOKEN", value: "plain-configuration" },
  { name: "system.os.name", value: "SyntheticOS" },
  { name: "env.PATH", value: "/synthetic/bin" },
  { name: "teamcity.tool.example", value: "1.0" },
  { name: "future.setting", value: "future-value", type: { rawValue: "future label='password'" } },
  { name: "hidden.text", value: "readable", type: { rawValue: "text display='hidden'" } },
];
const secrets = [
  { name: "login", value: "synthetic-protected-value", type: { rawValue: "password label='Login'" } },
  { name: "secure:connection", value: "synthetic-protected-value" },
  { name: "server.masked", value: "********" },
  { name: "server.null", value: null },
  { name: "server.omitted" },
];
const properties = [...plain, ...secrets];

function assertValues(result: unknown) {
  const values = result as Array<{ name: string; value?: string; redacted: boolean }>;
  for (const property of plain) {
    const actual = values.find((item) => item.name === property.name)!;
    assert.equal(actual.value, property.value, property.name);
    assert.equal(actual.redacted, false, property.name);
  }
  for (const property of secrets) {
    const actual = values.find((item) => item.name === property.name)!;
    assert.equal(actual.value, undefined, property.name);
    assert.equal(actual.redacted, true, property.name);
  }
}

for (const family of ["steps", "features", "triggers", "agent-requirements", "snapshot-dependencies", "artifact-dependencies"]) {
  test(`${family} list/show returns script and plain options while hiding server secrets`, async t => {
    const rt = await createTestRuntime(t);
    const cli = rt.createCli();
    const collection = family.replace(/ies$/, "y").replace(/s$/, "");
    server.use(http.get(`${base}/buildTypes/id:Build/${family}*`, ({ request }) => {
      const entity = { id: "Entity", name: "Fixture", type: "plugin", properties: { property: properties } };
      return HttpResponse.json(new URL(request.url).pathname.endsWith(family) ? { [collection]: [entity] } : entity);
    }));
    const list = await cli.execute(["jobs", family, "list", "Build"]) as { properties: unknown }[];
    assertValues(list[0]!.properties);
    const show = await cli.execute(["jobs", family, "show", "Build", "Entity"]) as { properties: unknown };
    assertValues(show.properties);
  });
}

test("step values survive human, JSON and persistent RPC output without secret values", async t => {
  const rt = await createTestRuntime(t);
  const cli = rt.createCli();
  server.use(http.get(`${base}/buildTypes/id:Build/steps`, () => HttpResponse.json({
    step: [{ id: "Runner", name: "Script", type: "simpleRunner", properties: { property: properties } }],
  })));
  const argv = ["jobs", "steps", "list", "Build"];
  const json = await rt.json(cli, argv) as { properties: unknown }[];
  assertValues(json[0]!.properties);
  const human = await rt.run(cli, argv);
  assert.equal(human.exitCode, 0);
  assert.match(human.stdout, /echo first/);
  assert.match(human.stdout, /echo second/);
  assert.doesNotMatch(human.stdout, /synthetic-protected-value/);
  const rpc = await rt.rpc(cli, [argv, argv]) as { result: { properties: unknown }[] }[];
  for (const reply of rpc) assertValues(reply.result[0]!.properties);
});

for (const [argv, path, nested] of [
  [["projects", "parameters", "list", "Example"], "/projects/id:Example/parameters", false],
  [["jobs", "parameters", "list", "Build"], "/buildTypes/id:Build/parameters", false],
  [["jobs", "output-parameters", "list", "Build"], "/buildTypes/id:Build/output-parameters", false],
  [["jobs", "steps", "parameters", "list", "Build", "Runner"], "/buildTypes/id:Build/steps/Runner/parameters", false],
  [["jobs", "features", "parameters", "list", "Build", "Feature"], "/buildTypes/id:Build/features/Feature/parameters", false],
  [["vcs", "roots", "properties", "list", "Root"], "/vcs-roots/id:Root/properties", false],
  [["vcs", "instances", "properties", "8"], "/vcs-root-instances/id:8/properties", false],
  [["agents", "parameters", "list", "1"], "/agents/id:1", true],
  [["builds", "output-parameters", "list", "42"], "/builds/id:42/output-parameters", false],
  [["builds", "resulting-properties", "list", "42"], "/builds/id:42/resulting-properties", false],
] as const) {
  test(`${argv.join(" ")} uses the same server-secret read policy`, async t => {
    const rt = await createTestRuntime(t);
    server.use(http.get(base + path, ({ request }) => {
      assert.match(new URL(request.url).searchParams.get("fields")!, /name,value,inherited,type\(rawValue\)/);
      const body = { property: properties };
      return HttpResponse.json(nested ? { properties: body } : body);
    }));
    assertValues(await rt.createCli().execute([...argv]));
  });
}

test("single plugin-property show uses password metadata and preserves ordinary values", async t => {
  const rt = await createTestRuntime(t);
  let scalarReads = 0;
  server.use(http.get(`${base}/buildTypes/id:Build/steps/Runner/parameters`, () => HttpResponse.json({ property: properties })));
  server.use(http.get(`${base}/buildTypes/id:Build/steps/Runner/parameters/:name`, ({ params }) => {
    const property = plain.find((item) => item.name === params.name);
    assert.ok(property, "Server-protected properties must not be read through the scalar endpoint");
    scalarReads++;
    return HttpResponse.text(property.value);
  }));
  const cli = rt.createCli();
  for (const property of properties) {
    const result = await cli.execute(["jobs", "steps", "parameters", "show", "Build", "Runner", property.name]);
    const row = result as { value?: string };
    assert.equal(row.value, plain.includes(property as typeof plain[number]) ? property.value : undefined);
  }
  assert.equal(scalarReads, plain.length);
});

for (const argv of [["jobs", "configuration", "show", "Build"], ["projects", "templates", "show", "Template"]]) {
  test(`${argv.join(" ")} includes build settings, template content and VCS connections`, async t => {
    const rt = await createTestRuntime(t);
    const settings = [
      { name: "artifactRules", value: "dist/** => release.zip" },
      { name: "buildNumberPattern", value: "1.0.%build.counter%" },
      { name: "checkoutMode", value: "ON_AGENT" },
      { name: "executionTimeoutMin", value: "30" },
      { name: "cleanup.fixture", value: "server-exposed-setting" },
    ];
    server.use(http.get(`${base}/buildTypes/id:${argv[3]}`, ({ request }) => {
      const fields = new URL(request.url).searchParams.get("fields")!;
      for (const name of ["settings", "parameters", "output-parameters", "steps", "features", "triggers", "agent-requirements", "snapshot-dependencies", "artifact-dependencies", "vcs-root-entries", "templates"])
        assert.ok(fields.includes(`${name}(`), name);
      return HttpResponse.json({ id: argv[3], name: "Configuration", type: "regular",
        settings: { property: settings }, parameters: { property: properties },
        steps: { step: [{ id: "Runner", properties: { property: properties } }] },
        "vcs-root-entries": { "vcs-root-entry": [{ "checkout-rules": "+:src => .", "vcs-root": { id: "Root", properties: { property: properties } } }] },
      });
    }));
    const result = await rt.createCli().execute(argv) as { settings: { property: unknown }; parameters: { property: { value?: string; redacted?: boolean }[] }; redacted?: boolean };
    assert.deepEqual(result.settings.property, settings);
    assert.equal(result.redacted, undefined);
    for (const [index, property] of plain.entries()) assert.equal(result.parameters.property[index]!.value, property.value);
    for (const property of result.parameters.property.slice(plain.length)) assert.deepEqual([property.value, property.redacted], [undefined, true]);
    assert.doesNotMatch(JSON.stringify(result), /synthetic-protected-value/);
  });
}

test("native projected reads redact server secrets for token and guest profiles", async t => {
  for (const guest of [false, true]) {
    const rt = await createTestRuntime(t, { profiles: [{ name: "default", url: "https://teamcity.test", guest }] });
    server.use(http.get(`https://teamcity.test/${guest ? "guestAuth/" : ""}app/rest/builds/id:42`, () => HttpResponse.json({ properties: { property: properties } })));
    const result = await rt.createCli().execute(["builds", "show", "42", "--fields", "properties(property(name,value,type(rawValue)))"]);
    assert.doesNotMatch(JSON.stringify(result), /synthetic-protected-value/);
    assert.match(JSON.stringify(result), /echo first/);
  }
});

test("configuration, template and agent parameter reads require ReadOnly before HTTP", async t => {
  const rt = await createTestRuntime(t, { profiles: [{ name: "default", url: "https://teamcity.test", permissions: [] }] });
  let requests = 0;
  server.use(http.all("*", () => { requests++; return HttpResponse.json({}); }));
  const cli = rt.createCli();
  for (const argv of [["jobs", "configuration", "show", "Build"], ["projects", "templates", "show", "Template"], ["agents", "parameters", "list", "1"]])
    await assert.rejects(cli.execute(argv), /Permission 'ReadOnly'/);
  assert.equal(requests, 0);
});
