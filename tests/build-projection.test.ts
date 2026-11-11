import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import type { CliApplication, CliError } from "@eyeauras/cli-factory";
import { assertHttpRequest, trackRequests } from "@eyeauras/cli-factory/testing";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createTestRuntime } from "./support.js";
import { baselineBuild, buildProjectionCases, defaultBuildFields } from "./build-projection-cases.js";

const server = setupServer();
const origin = "https://teamcity.test";
const token = "synthetic-projection-credential";
const projection = " number,agent(name),triggered(type,user(username)),custom(*) ";
// Deliberately no ID/state: an explicit projection need not contain view/workflow fields.
const native = { number: "7", agent: { name: "fixture-agent" }, triggered: { type: "user", user: { username: "fixture-user" } }, custom: { enabled: false, values: [null, 0, "native"] } };
const surfaces = ["human", "json", "execute", "rpc"] as const;
type Surface = typeof surfaces[number];
type Runtime = Awaited<ReturnType<typeof createTestRuntime>>;
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());

async function runtime(t: test.TestContext, permissions: string[] = ["ReadOnly"]) {
  return createTestRuntime(t, {
    profiles: [{ name: "default", url: origin, permissions }], tokens: { default: token },
  });
}

async function success(rt: Runtime, cli: CliApplication, argv: string[], surface: Surface, expected: unknown) {
  if (surface === "execute") assert.deepEqual(await cli.execute(argv), expected);
  else if (surface === "rpc") {
    // Two requests share one persistent session; parsing and projection must stay invocation-local.
    assert.deepEqual(await rt.rpc(cli, [argv, argv]), [0, 1].map(id => ({ jsonrpc: "2.0", id, result: expected })));
  } else {
    const rendered = await rt.run(cli, [...argv, ...(surface === "json" ? ["--json"] : [])]);
    assert.equal(rendered.exitCode, 0, rendered.stderr);
    if (surface === "json") assert.equal(rendered.stdout, JSON.stringify(expected) + "\n");
    return rendered;
  }
}

async function failure(rt: Runtime, cli: CliApplication, argv: string[], surface: Surface, code: string) {
  let evidence = "";
  if (surface === "execute") {
    await assert.rejects(cli.execute(argv), error => {
      assert.equal((error as { code?: string }).code, code);
      evidence = JSON.stringify(error, Object.getOwnPropertyNames(error));
      return true;
    });
  } else if (surface === "rpc") {
    const replies = await rt.rpc(cli, [argv, argv]) as Array<{ error: { code: number; data: { code: string; exitCode: number } } }>;
    for (const reply of replies) {
      assert.equal(reply.error.code, -32000);
      assert.equal(reply.error.data.code, code);
      assert.equal(reply.error.data.exitCode, 1);
    }
    evidence = JSON.stringify(replies);
  } else {
    const rendered = await rt.run(cli, [...argv, ...(surface === "json" ? ["--json"] : [])]);
    assert.equal(rendered.exitCode, 1);
    assert.equal(rendered.stdout, "");
    if (surface === "json") assert.equal(JSON.parse(rendered.stderr).error.code, code);
    else assert.ok(rendered.stderr.trim().split("\n").length <= 3, rendered.stderr);
    evidence = rendered.stderr;
  }
  assert.doesNotMatch(evidence, /synthetic-projection-credential/);
  if (code === "error") assert.doesNotMatch(evidence, /synthetic-server-payload/);
  return evidence;
}

for (const scenario of buildProjectionCases) {
  test(`US-001-A1 ${scenario.name}: native projection on all four surfaces`, async t => {
    const rt = await runtime(t);
    const cli = rt.createCli();
    const requests = trackRequests(t, 5, async request => {
      await assertHttpRequest(request, {
        method: "GET", url: origin + scenario.path,
        query: { ...(scenario.locator === undefined ? {} : { locator: scenario.locator }), fields: scenario.fields(projection) },
        headers: { accept: "application/json", authorization: `Bearer ${token}` },
      });
      return HttpResponse.json(scenario.response(native));
    });
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces) {
      const rendered = await success(rt, cli, [...scenario.argv, "--fields", projection], surface, scenario.result(native));
      if (rendered && surface === "human") {
        assert.match(rendered.stdout, /triggered:/);
        assert.match(rendered.stdout, /fixture-user/);
        assert.match(rendered.stdout, /custom:/);
        assert.doesNotMatch(rendered.stdout + rendered.stderr, /BUILD\s+JOB|Build undefined|Next:|undefined/);
      }
    }
  });

  test(`US-001-A3 ${scenario.name}: exact baseline request and output on all four surfaces`, async t => {
    const rt = await runtime(t);
    const cli = rt.createCli();
    const requests = trackRequests(t, 5, async request => {
      await assertHttpRequest(request, {
        method: "GET", url: origin + scenario.path,
        query: { ...(scenario.locator === undefined ? {} : { locator: scenario.locator }), fields: scenario.fields(defaultBuildFields) },
        headers: { accept: "application/json", authorization: `Bearer ${token}` },
      });
      return HttpResponse.json(scenario.response(baselineBuild));
    });
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces) {
      const rendered = await success(rt, cli, scenario.argv, surface, scenario.result(baselineBuild));
      if (rendered) assert.equal(rendered.stderr, surface === "human" ? scenario.stderr : "");
      if (rendered && surface === "human") assert.equal(rendered.stdout, scenario.human);
    }
  });

  test(`US-001-A4 ${scenario.name}: native credential echoes are masked on every surface`, async t => {
    const rt = await runtime(t);
    const cli = rt.createCli();
    const echoed = { id: 42, nested: { value: `before ${token} after`, [token]: [token, null] } };
    const masked = { id: 42, nested: { value: "before [redacted] after", "[redacted]": ["[redacted]", null] } };
    const requests = trackRequests(t, 5, () => HttpResponse.json(scenario.response(echoed)));
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces) {
      const rendered = await success(rt, cli, [...scenario.argv, "--fields", "id,nested(*)"], surface, scenario.result(masked));
      if (rendered) {
        assert.doesNotMatch(rendered.stdout + rendered.stderr, new RegExp(token));
        if (surface === "human") assert.match(rendered.stdout, /\[redacted\]/);
      }
    }
  });

  test(`US-001-A5 ${scenario.name}: denied ReadOnly has no HTTP, credential or file effects`, async t => {
    const rt = await runtime(t, []);
    const cli = rt.createCli();
    const snapshot = async (path: string): Promise<unknown> => Promise.all((await readdir(path, { withFileTypes: true })).map(async entry => [entry.name,
      entry.isDirectory() ? await snapshot(join(path, entry.name)) : (await readFile(join(path, entry.name))).toString("base64")]));
    const before = await snapshot(rt.root);
    const effects: string[] = [];
    for (const method of ["get", "set", "delete"] as const) {
      t.mock.method(rt.secretStore, method, async () => { effects.push(method); throw new Error("Unexpected credential access."); });
    }
    const requests = trackRequests(t, 0, () => HttpResponse.json({}));
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces) {
      const evidence = await failure(rt, cli, [...scenario.argv, "--fields", projection], surface, "permission.denied");
      assert.match(evidence, /ReadOnly/);
    }
    assert.deepEqual(effects, []);
    assert.deepEqual(await snapshot(rt.root), before);
  });

  for (const fields of ["", " \t\n "]) {
    test(`US-001-A7 ${scenario.name}: forwards ${fields === "" ? "empty" : "blank"} fields on all surfaces`, async t => {
      const rt = await createTestRuntime(t, { profiles: [{ name: "default", url: origin, permissions: ["ReadOnly", "Update", "Admin", "Credentials"] }] });
      const cli = rt.createCli();
      const requests = trackRequests(t, 5, request => {

        const url = new URL(request.url);
        assert.equal(url.pathname, scenario.path);
        assert.equal(url.searchParams.get("fields"), scenario.fields(fields));
        return HttpResponse.json(scenario.response(native));
      });
      server.use(http.all("*", ({ request }) => requests.handle(request)));
      for (const surface of surfaces)
        await success(rt, cli, [...scenario.argv, "--fields", fields], surface, scenario.result(native));
    });
  }
}

test("US-001-A2 native item projections preserve filtered multi-page selection on every surface", async t => {
  const rt = await runtime(t);
  const cli = rt.createCli();
  const requests = trackRequests(t, 10, async (request, index) => {
    const second = index % 2 === 1;
    await assertHttpRequest(request, {
      method: "GET", url: origin + "/app/rest/builds",
      query: {
        fields: "nextHref,build(number,agent(name))",
        locator: "defaultFilter:false,branch:(name:main),buildType:(id:Demo_Build)," +
          "affectedProject:(id:Demo),state:finished,status:SUCCESS," + (second ? "start:8,count:2,lookupLimit:20" : "start:7,count:3"),
      },
    });
    return HttpResponse.json(second ? { build: [{ number: "second", agent: { name: "fixture-b" } }, { number: "lookahead" }] }
      : { build: [{ number: "first", agent: { name: "fixture-a" } }], nextHref: "/app/rest/builds?locator=start:8,lookupLimit:20" });
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  const argv = ["builds", "list", "--job", "Demo_Build", "--project", "Demo", "--branch", "main", "--state", "finished", "--status", "SUCCESS", "--start", "7", "--limit", "2", "--fields", "number,agent(name)"];
  const expected = { count: 2, items: [{ number: "first", agent: { name: "fixture-a" } }, { number: "second", agent: { name: "fixture-b" } }], hasMore: true, nextStart: 9 };
  for (const surface of surfaces) {
    const rendered = await success(rt, cli, argv, surface, expected);
    if (rendered && surface === "human") {
      assert.match(rendered.stdout, /fixture-a/);
      assert.match(rendered.stdout, /nextStart: 9/);
    }
  }
});

const failures = [
  { name: "401", code: "http.unauthorized", response: () => HttpResponse.text(`synthetic-server-payload ${token}`, { status: 401 }) },
  { name: "403", code: "http.forbidden", response: () => HttpResponse.text(`synthetic-server-payload ${token}`, { status: 403 }) },
  { name: "404", code: "http.notFound", response: () => HttpResponse.text(`synthetic-server-payload ${token}`, { status: 404 }) },
  { name: "503", code: "http.serverError", response: () => HttpResponse.text(`synthetic-server-payload ${token}`, { status: 503 }) },
  { name: "transport", code: "request.failed", response: () => HttpResponse.error() },
  { name: "decoding", code: "error", response: () => HttpResponse.text(`invalid JSON synthetic-server-payload ${token}`) },
];
for (const example of failures) {
  test(`US-001-A6 ${example.name}: existing safe error contract without retries on all surfaces`, async t => {
    const rt = await runtime(t);
    const cli = rt.createCli();
    const requests = trackRequests(t, 5, () => example.response());
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces) {
      const evidence = await failure(rt, cli, ["builds", "show", "42", "--fields", projection], surface, example.code);
      if (surface !== "human" && ["transport", "decoding"].includes(example.name)) assert.match(evidence, /cause/);
    }
  });
}

test("US-001 native empty list and latest miss keep their existing envelope/error", async t => {
  const rt = await runtime(t);
  const cli = rt.createCli();
  server.use(http.get(origin + "/app/rest/builds", () => HttpResponse.json({ build: [] })));
  for (const surface of surfaces) {
    await success(rt, cli, ["builds", "list", "--fields", "number"], surface, { count: 0, items: [], hasMore: false, nextStart: null });
    const evidence = await failure(rt, cli, ["builds", "show", "--latest", "--job", "Demo_Build", "--fields", "number"], surface, "error");
    assert.match(evidence, /No finished build matches/);
  }
});

test("US-001 persistent RPC keeps default/custom projections and two profile credentials isolated", async t => {
  const rt = await createTestRuntime(t, {
    profiles: [{ name: "default", url: origin, permissions: ["ReadOnly"] }, { name: "second", url: "https://second.example.test", permissions: ["ReadOnly"] }],
    tokens: { default: token, second: "synthetic-second-credential" },
  });
  const requests = trackRequests(t, 3, async (request, index) => {
    await assertHttpRequest(request, {
      method: "GET", url: (index === 1 ? "https://second.example.test" : origin) + "/app/rest/builds/id:42",
      query: { fields: index === 2 ? defaultBuildFields : "custom" },
      headers: { authorization: `Bearer ${index === 1 ? "synthetic-second-credential" : token}` },
    });
    return HttpResponse.json(index === 2 ? baselineBuild : { custom: index === 1 ? "synthetic-second-credential" : token });
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  const replies = await rt.rpc(rt.createCli(), [
    ["builds", "show", "42", "--fields", "custom"],
    ["builds", "show", "42", "--fields", "custom", "--profile", "second"],
    ["builds", "show", "42"],
  ]);
  assert.deepEqual(replies, [{ jsonrpc: "2.0", id: 0, result: { custom: "[redacted]" } }, { jsonrpc: "2.0", id: 1, result: { custom: "[redacted]" } }, { jsonrpc: "2.0", id: 2, result: baselineBuild }]);
});

for (const credential of ["1", 'synthetic-quote"slash\\credential']) {
  test(`US-001 credential masking preserves JSON types and continuation (${credential === "1" ? "short" : "escaped"})`, async t => {
    const rt = await createTestRuntime(t, { tokens: { default: credential } });
    const requests = trackRequests(t, 2, async (request, index) => {
      await assertHttpRequest(request, {
        method: "GET", url: origin + "/app/rest/builds",
        query: { fields: "nextHref,build(custom)", locator: "defaultFilter:false,branch:(default:any),lookupLimit:5000," + (index === 0 ? "start:0,count:3" : "start:1,count:2") },
      });
      const build = [{ custom: { echo: `before ${credential} after`, number: 1, flag: false, empty: null } }];
      return HttpResponse.json(index === 0 ? { build, nextHref: "/app/rest/builds?locator=start:1" } : { build });
    });
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    assert.deepEqual(await rt.createCli().execute(["builds", "list", "--limit", "2", "--fields", "custom"]), {
      count: 2, items: Array.from({ length: 2 }, () => ({ custom: { echo: "before [redacted] after", number: 1, flag: false, empty: null } })), hasMore: false, nextStart: null,
    });
  });
}

test("US-001 later page errors retain masked native items in list.incomplete", async t => {
  const rt = await runtime(t);
  const requests = trackRequests(t, 2, (_request, index) => index === 0
    ? HttpResponse.json({ build: [{ custom: token }], nextHref: "/app/rest/builds?locator=start:1" })
    : HttpResponse.text(`synthetic-server-payload ${token}`, { status: 503 }));
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  await assert.rejects(rt.createCli().execute(["builds", "list", "--fields", "custom", "--limit", "2"]), error => {
    const failure = error as CliError;
    assert.equal(failure.code, "list.incomplete");
    assert.deepEqual(failure.result, { count: 1, items: [{ custom: "[redacted]" }], hasMore: null, nextStart: 1 });
    assert.equal((failure.cause as CliError).code, "http.serverError");
    return true;
  });
});
