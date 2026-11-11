import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import type { CliApplication, CliError } from "@eyeauras/cli-factory";
import { assertHttpRequest, trackRequests } from "@eyeauras/cli-factory/testing";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createTestRuntime } from "./support.js";
import { evidenceProjectionCases as buildProjectionCases } from "./evidence-projection-cases.js";

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
  test(`US-002-A1 ${scenario.name}: native projection on all four surfaces`, async t => {
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

  test(`US-002-A3 ${scenario.name}: exact baseline request and output on all four surfaces`, async t => {
    const rt = await runtime(t);
    const cli = rt.createCli();
    const requests = trackRequests(t, 5, async request => {
      await assertHttpRequest(request, {
        method: "GET", url: origin + scenario.path,
        query: { ...(scenario.locator === undefined ? {} : { locator: scenario.locator }), fields: scenario.defaultFields },
        headers: { accept: "application/json", authorization: `Bearer ${token}` },
      });
      return HttpResponse.json(scenario.baselineResponse);
    });
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces) {
      const rendered = await success(rt, cli, scenario.argv, surface, scenario.baselineResult);
      if (rendered) assert.equal(rendered.stderr, surface === "human" ? scenario.stderr : "");
      if (rendered && surface === "human") assert.equal(rendered.stdout, scenario.human);
    }
  });

  test(`US-002 ${scenario.name}: native credential echoes are masked on every surface`, async t => {
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

  test(`US-002-A4 ${scenario.name}: denied ReadOnly has no HTTP, credential or file effects`, async t => {
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
    test(`US-002-A6 ${scenario.name}: forwards ${fields === "" ? "empty" : "blank"} fields on all surfaces`, async t => {
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

const failures = [
  { name: "401", code: "http.unauthorized", response: () => HttpResponse.text(`synthetic-server-payload ${token}`, { status: 401 }) },
  { name: "403", code: "http.forbidden", response: () => HttpResponse.text(`synthetic-server-payload ${token}`, { status: 403 }) },
  { name: "404", code: "http.notFound", response: () => HttpResponse.text(`synthetic-server-payload ${token}`, { status: 404 }) },
  { name: "503", code: "http.serverError", response: () => HttpResponse.text(`synthetic-server-payload ${token}`, { status: 503 }) },
  { name: "transport", code: "request.failed", response: () => HttpResponse.error() },
  { name: "decoding", code: "error", response: () => HttpResponse.text(`invalid JSON synthetic-server-payload ${token}`) },
];
for (const example of failures) {
  test(`US-002-A5 ${example.name}: existing safe error contract without retries on all surfaces`, async t => {
    const rt = await runtime(t);
    const cli = rt.createCli();
    const requests = trackRequests(t, 5, () => example.response());
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces) {
      const evidence = await failure(rt, cli, ["builds", "statistics", "list", "42", "--fields", projection], surface, example.code);
      if (surface !== "human" && ["transport", "decoding"].includes(example.name)) assert.match(evidence, /cause/);
    }
  });
}

for (const fields of [undefined, "text"]) {
  for (const status of [200, 404]) {
    test(`cancellation absence: status ${status}, fields ${fields}`, async t => {
      const rt = await runtime(t);
      const cli = rt.createCli();
      const requests = trackRequests(t, 1, () => new HttpResponse(null, { status }));
      server.use(http.all("*", ({ request }) => requests.handle(request)));
      const argv = ["builds", "canceled-info", "42", ...(fields === undefined ? [] : ["--fields", fields])];
      if (status === 200) assert.equal(await cli.execute(argv), null);
      else await assert.rejects(cli.execute(argv), (error: any) => error.code === "http.notFound");
    });
  }
}
