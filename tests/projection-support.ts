import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import type { CliApplication, CliError } from "@eyeauras/cli-factory";
import { assertHttpRequest, trackRequests } from "@eyeauras/cli-factory/testing";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createTestRuntime } from "./support.js";
export type ProjectionCase = {name: string; argv: string[]; method: string; path: string; query: Record<string,string>; body: string; baselineResponse: Record<string,unknown>; baselineResult: unknown; human: string; stderr: string; collection: string; permission: string; field?: boolean; fileCollection?: boolean; fixedQuery?: Record<string,string>; nativeQuery?: Record<string,string>; preflight: {path: string; query: Record<string,string>} | null};
export function projectionAcceptance(story: string, cases: ProjectionCase[], acceptance = {native: 1, paging: 2, mutation: 3, parity: 4, denied: 5, error: 6, blank: 7}) {
const buildProjectionCases = cases.map(c => ({ ...c, locator: (c.query as Record<string,string>).locator, defaultFields: (c.query as Record<string,string>).fields, fields: (s: string) => c.fileCollection ? `count,file(${s})` : c.collection ? `nextHref,${c.collection}(${s})` : s, response: <T>(v: T) => c.fileCollection ? {file: [v]} : c.collection ? { [c.collection]: [v] } : v, result: <T>(v: T) => c.fileCollection ? {count: 1, items: [v]} : c.collection ? {count: 1, items: [v], hasMore: false, nextStart: null} : v }));

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
    assert.deepEqual(await rt.rpc(cli, [argv, argv]), [0, 1].map(id => ({ jsonrpc: "2.0", id, result: JSON.parse(JSON.stringify(expected)) })));
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
  assert.doesNotMatch(evidence, /synthetic-projection-credential|synthetic-server-payload/);
  return evidence;
}

for (const scenario of buildProjectionCases) {
  test(`${story}-A${acceptance.native} ${scenario.name}: native projection on all four surfaces`, async t => {
    const rt = await runtime(t, [scenario.permission]);
    const cli = rt.createCli();
    const requests = trackRequests(t, scenario.preflight ? 10 : 5, async request => {
      if (scenario.preflight && request.method === "GET") {
        await assertHttpRequest(request.clone(), {method: "GET", url: origin + scenario.preflight.path, query: scenario.preflight.query});
        return HttpResponse.json(scenario.baselineResponse);
      }
      await assertHttpRequest(request.clone(), {
        method: scenario.method, url: origin + scenario.path,
        query: { ...scenario.fixedQuery, ...scenario.nativeQuery, ...(scenario.locator === undefined ? {} : { locator: scenario.locator }), ...(scenario.field ? {field: projection} : {fields: scenario.fields(projection)}) },
        headers: { accept: "application/json", authorization: `Bearer ${token}` },
        body: { text: scenario.body },
      });
      assert.equal(await request.text(), scenario.body);
      return HttpResponse.json(scenario.field ? scenario.baselineResponse : scenario.response(native));
    });
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces) {
      const rendered = await success(rt, cli, [...scenario.argv, ...Object.entries(scenario.nativeQuery ?? {}).flatMap(([key,value]) => ["--" + key, value]), scenario.field ? "--field" : "--fields", projection], surface, scenario.field ? scenario.baselineResult : scenario.result(native));
      if (rendered && surface === "human" && !scenario.field) {
        assert.match(rendered.stdout, /triggered:/);
        assert.match(rendered.stdout, /fixture-user/);
        assert.match(rendered.stdout, /custom:/);
        assert.doesNotMatch(rendered.stdout + rendered.stderr, /BUILD\s+JOB|Build undefined|Next:|undefined/);
      }
    }
  });

  test(`${story}-A${acceptance.parity} ${scenario.name}: exact baseline request and output on all four surfaces`, async t => {
    const rt = await runtime(t, [scenario.permission]);
    const cli = rt.createCli();
    const requests = trackRequests(t, scenario.preflight ? 10 : 5, async request => {
      if (scenario.preflight && request.method === "GET") {
        await assertHttpRequest(request.clone(), {method: "GET", url: origin + scenario.preflight.path, query: scenario.preflight.query});
        return HttpResponse.json(scenario.baselineResponse);
      }
      await assertHttpRequest(request.clone(), {
        method: scenario.method, url: origin + scenario.path,
        query: scenario.query,
        headers: { accept: scenario.argv.includes("rest-plugin") ? "application/xml" : "application/json", authorization: `Bearer ${token}` },
        body: { text: scenario.body },
      });
      assert.equal(await request.text(), scenario.body);
      return scenario.argv.includes("rest-plugin") ? HttpResponse.text(`<plugin name="rest"/>`, {headers: {"content-type": "application/xml"}}) : HttpResponse.json(scenario.baselineResponse);
    });
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces) {
      const rendered = await success(rt, cli, scenario.argv, surface, scenario.baselineResult);
      if (rendered) assert.equal(rendered.stderr, surface === "human" ? scenario.stderr : "");
      if (rendered && surface === "human") assert.equal(rendered.stdout, scenario.human);
    }
  });

  test(`${story}-A${acceptance.denied} ${scenario.name}: denied ReadOnly has no HTTP, credential or file effects`, async t => {
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
      const evidence = await failure(rt, cli, [...scenario.argv, ...Object.entries(scenario.nativeQuery ?? {}).flatMap(([key,value]) => ["--" + key, value]), scenario.field ? "--field" : "--fields", projection], surface, "permission.denied");
      assert.match(evidence, new RegExp(scenario.permission));
    }
    assert.deepEqual(effects, []);
    assert.deepEqual(await snapshot(rt.root), before);
  });

  for (const fields of ["", " \t\n "]) {
    test(`${story}-A${acceptance.blank} ${scenario.name}: rejects ${fields === "" ? "empty" : "blank"} fields locally on all surfaces`, async t => {
      const rt = await runtime(t, [scenario.permission]);
      const cli = rt.createCli();
      const requests = trackRequests(t, 0, () => HttpResponse.json({}));
      server.use(http.all("*", ({ request }) => requests.handle(request)));
      for (const surface of surfaces) {
        const evidence = await failure(rt, cli, [...scenario.argv, scenario.field ? "--field" : "--fields", fields], surface, "usage");
        assert.match(evidence, /non-empty/i);
      }
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
  test(`${story}-A${acceptance.error} ${example.name}: existing safe error contract without retries on all surfaces`, async t => {
    const rt = await runtime(t);
    const cli = rt.createCli();
    const requests = trackRequests(t, 5, () => example.response());
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces) {
      const evidence = await failure(rt, cli, [...cases[0]!.argv, "--fields", projection], surface, example.code);
      if (surface !== "human" && ["transport", "decoding"].includes(example.name)) assert.match(evidence, /cause/);
    }
  });
}


for (const scenario of buildProjectionCases.filter(c => c.collection)) {
  test(`${story}-A${acceptance.paging} ${scenario.name}: continuation preserves locator and native items`, async t => {
    const rt = await runtime(t); const cli = rt.createCli(); let page = 0;
    const requests = trackRequests(t, 2, request => {
      const url = new URL(request.url);
      assert.equal(url.searchParams.get("fields"), scenario.fields(projection));
      assert.equal(url.searchParams.get("locator"), scenario.locator!.replace("start:3", `start:${page ? 4 : 3}`).replace("count:3", `count:${page ? 2 : 3}`));
      return HttpResponse.json({[scenario.collection]: [native], ...(page++ === 0 ? {nextHref: "?locator=start:4,count:3"} : {})});
    });
    server.use(http.all("*", ({request}) => requests.handle(request)));
    assert.deepEqual(await cli.execute([...scenario.argv, "--fields", projection]), {count: 2, items: [native,native], hasMore: false, nextStart: null});
  });
}

for (const c of buildProjectionCases.filter(c => c.method !== "GET")) {
  for (const kind of ["empty", "malformed", "lost"] as const) test(`${story}-A${acceptance.mutation} mutation ${c.name}: ${kind} parity on every surface`, async t => {
    const rt = await runtime(t, [c.permission]); const cli = rt.createCli();
    let calls = 0;
    server.use(http.all("*", ({request}) => {
      if (c.preflight && request.method === "GET") return HttpResponse.json(c.baselineResponse);
      calls++;
      return kind === "lost" ? HttpResponse.error() : new HttpResponse(kind === "empty" ? null : "invalid JSON");
    }));
    for (const surface of surfaces) {
      if (kind === "lost") {
        await failure(rt, cli, c.argv, surface, "request.unknownOutcome");
        await failure(rt, cli, [...c.argv, "--fields", projection], surface, "request.unknownOutcome");
      } else if (c.argv.includes("start")) {
        await success(rt, cli, c.argv, surface, c.baselineResult);
        await success(rt, cli, [...c.argv, "--fields", projection], surface, c.baselineResult);
      } else {
        await failure(rt, cli, c.argv, surface, "error");
        await failure(rt, cli, [...c.argv, "--fields", projection], surface, "error");
      }
    }
    assert.equal(calls, 10);
  });
}

}

export function fileControlsAcceptance(story: string) {
  const server = setupServer();
  test.before(() => server.listen({ onUnhandledRequest: "error" }));
  test.afterEach(() => server.resetHandlers());
  test.after(() => server.close());
  for (const action of ["list", "children", "metadata", "download", "archive"]) {
    const argv = ["jobs", "files", action, "Demo", ...(action === "list" ? [] : ["src"])];
    const saving = ["download", "archive"].includes(action);
    const controls = ["--resolve-parameters", "true", ...(["list", "children", "archive"].includes(action) ? ["--base-path", " /src + "] : []), ...(action === "archive" ? ["--archive-name", "source +.zip"] : [])];
    const bytes = action === "archive" ? new Uint8Array([80,75,5,6,...Array(18).fill(0)]) : new TextEncoder().encode("fixture");
    const response = () => saving ? new HttpResponse(bytes, {headers: {"content-type": action === "archive" ? "application/zip" : "application/octet-stream"}}) : HttpResponse.json(action === "metadata" ? {name: "src", size: 7} : {file: [{name: "src", size: 7}]});
    test(`${story}-A1 ${action}: query controls unchanged on all surfaces`, async t => {
      const rt = await createTestRuntime(t, {profiles: [{name: "default", url: "https://teamcity.test", permissions: ["ReadOnly"]}], tokens: {default: "synthetic-file-token"}});
      const requests = trackRequests(t, 4, request => {
        const query = new URL(request.url).searchParams;
        assert.equal(query.get("resolveParameters"), "true");
        assert.equal(query.get("basePath"), controls.includes("--base-path") ? " /src + " : null);
        assert.equal(query.get("name"), action === "archive" ? "source +.zip" : null);
        assert.equal(query.get("logBuildUsage"), null);
        return response();
      });
      server.use(http.all("*", ({request}) => requests.handle(request)));
      const cli = rt.createCli();
      for (const surface of ["human", "json", "execute", "rpc"]) {
        const args = [...argv, ...controls, ...(saving ? ["--output", join(rt.root, surface)] : [])];
        if (surface === "execute") await cli.execute(args);
        else if (surface === "rpc") assert.ok(!(await rt.rpc(cli, [args]) as {error?: unknown}[])[0]!.error);
        else assert.equal((await rt.run(cli, [...args, ...(surface === "json" ? ["--json"] : [])])).exitCode, 0);
      }
    });
    for (const value of ["", " ", "TRUE", "1"]) test(`${story}-A6 ${action}: invalid boolean ${JSON.stringify(value)} is local`, async t => {
      const rt = await createTestRuntime(t);
      const requests = trackRequests(t, 0, response);
      server.use(http.all("*", ({request}) => requests.handle(request)));
      await assert.rejects(rt.createCli().execute([...argv, "--resolve-parameters", value]), {code: "usage"});
    });
    if (saving) test(`${story}-A3 ${action}: preserves destination and byte bounds`, async t => {
      const {writeFile} = await import("node:fs/promises");
      const rt = await createTestRuntime(t, {profiles: [{name: "default", url: "https://teamcity.test", permissions: ["ReadOnly"]}], tokens: {default: "synthetic-file-token"}});
      server.use(http.all("*", response));
      const target = join(rt.root, "existing"); await writeFile(target, "existing fixture");
      await assert.rejects(rt.createCli().execute([...argv, ...controls, "--output", target]), /already exists/);
      assert.equal(await readFile(target, "utf8"), "existing fixture");
      await assert.rejects(rt.createCli().execute([...argv, ...controls, "--output", join(rt.root, "bounded"), "--max-bytes", "1"]));
      await assert.rejects(readFile(join(rt.root, "bounded")));
    });
  }
}
