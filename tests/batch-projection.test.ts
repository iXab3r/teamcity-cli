import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import type { CliApplication, CliError } from "@eyeauras/cli-factory";
import { assertHttpRequest, trackRequests } from "@eyeauras/cli-factory/testing";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createTestRuntime } from "./support.js";
import { actionCases } from "./batch-projection-cases.js";

const server = setupServer();
const origin = "https://teamcity.test";
const token = "synthetic-projection-credential";
const projection = " number,agent(name),triggered(type,user(username)),custom(*) ";
// Deliberately no ID/state: an explicit projection need not contain view/workflow fields.
const native = {
  number: "7",
  agent: { name: "fixture-agent" },
  triggered: { type: "user", user: { username: "fixture-user" } },
  custom: { enabled: false, values: [null, 0, "native"] },
};
const surfaces = ["human", "json", "execute", "rpc"] as const;
type Surface = (typeof surfaces)[number];
type Runtime = Awaited<ReturnType<typeof createTestRuntime>>;
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());

async function runtime(t: test.TestContext, permissions: string[] = ["ReadOnly"]) {
  return createTestRuntime(t, {
    profiles: [{ name: "default", url: origin, permissions }],
    tokens: { default: token },
  });
}

async function success(
  rt: Runtime,
  cli: CliApplication,
  argv: string[],
  surface: Surface,
  expected: unknown,
) {
  if (surface === "execute") assert.deepEqual(await cli.execute(argv), expected);
  else if (surface === "rpc") {
    // Two requests share one persistent session; parsing and projection must stay invocation-local.
    assert.deepEqual(
      await rt.rpc(cli, [argv, argv]),
      [0, 1].map((id) => ({ jsonrpc: "2.0", id, result: expected })),
    );
  } else {
    const rendered = await rt.run(cli, [...argv, ...(surface === "json" ? ["--json"] : [])]);
    assert.equal(rendered.exitCode, 0, rendered.stderr);
    if (surface === "json") assert.equal(rendered.stdout, JSON.stringify(expected) + "\n");
    return rendered;
  }
}

async function failure(
  rt: Runtime,
  cli: CliApplication,
  argv: string[],
  surface: Surface,
  code: string,
) {
  let evidence = "";
  if (surface === "execute") {
    await assert.rejects(cli.execute(argv), (error) => {
      assert.equal((error as { code?: string }).code, code);
      evidence = JSON.stringify(error, Object.getOwnPropertyNames(error));
      return true;
    });
  } else if (surface === "rpc") {
    const replies = (await rt.rpc(cli, [argv, argv])) as Array<{
      error: { code: number; data: { code: string; exitCode: number } };
    }>;
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

for (const c of actionCases) {
  for (const projected of [false, true]) {
    test(`US-006 ${c.name}: ${projected ? "A1 native" : "A3 baseline"} across surfaces`, async (t) => {
      const rt = await runtime(t, [c.name === "show" ? "ReadOnly" : "Update"]);
      const requests = trackRequests(t, 5, async (request) => {
        const url = new URL(request.url);
        assert.equal(request.method, c.request.method);
        assert.equal(url.pathname, c.request.path);
        assert.deepEqual(Object.fromEntries(url.searchParams), {
          ...c.request.query,
          ...(projected ? { fields: projection } : {}),
        });
        assert.equal(await request.text(), c.request.body);
        return HttpResponse.json(projected ? native : c.response);
      });
      server.use(http.all("*", ({ request }) => requests.handle(request)));
      for (const surface of surfaces) {
        const rendered = await success(
          rt,
          rt.createCli(),
          [...c.argv, ...(projected ? ["--fields", projection] : [])],
          surface,
          projected ? native : c.result,
        );
        if (rendered && surface === "human") {
          if (projected) assert.match(rendered.stdout, /custom:/);
          else assert.deepEqual(rendered, c.human);
        }
      }
    });
  }
  test(`US-006-A2 ${c.name}: empty success preserves baseline`, async (t) => {
    const rt = await runtime(t, [c.name === "show" ? "ReadOnly" : "Update"]);
    const requests = trackRequests(t, 5, () => new HttpResponse(null, { status: 200 }));
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces) {
      const argv = [...c.argv, "--fields", projection];
      if (c.empty.code) await failure(rt, rt.createCli(), argv, surface, c.empty.code);
      else await success(rt, rt.createCli(), argv, surface, c.empty.result);
    }
  });
  test(`US-006-A4 ${c.name}: permission denial`, async (t) => {
    const rt = await runtime(t, []);
    const requests = trackRequests(t, 0, () => HttpResponse.json({}));
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces)
      await failure(
        rt,
        rt.createCli(),
        [...c.argv, "--fields", projection],
        surface,
        "permission.denied",
      );
  });
  for (const value of ["", "  "])
    test(`US-006-A6 ${c.name}: invalid projection ${JSON.stringify(value)}`, async (t) => {
      const rt = await runtime(t, [c.name === "show" ? "ReadOnly" : "Update"]);
      const requests = trackRequests(t, 0, () => HttpResponse.json({}));
      server.use(http.all("*", ({ request }) => requests.handle(request)));
      for (const surface of surfaces)
        await failure(rt, rt.createCli(), [...c.argv, "--fields", value], surface, "usage");
    });
}
test("US-006-A2 native partial batch result", async t => {
  const rt = await runtime(t, ["Update"]);
  const body = { count: 2, errorCount: 1, custom: false };
  server.use(http.all("*", () => HttpResponse.json(body)));
  await assert.rejects(rt.createCli().execute([...actionCases[1]!.argv, "--fields", projection]), e => {
    assert.equal((e as CliError).code, "batch.partial");
    assert.deepEqual((e as CliError).result, body);
    return true;
  });
});
for (const [status, code] of [
  [401, "http.unauthorized"],
  [403, "http.forbidden"],
  [404, "http.notFound"],
  [503, "http.serverError"],
  [0, "request.unknownOutcome"],
  [200, "error"],
] as const) {
  test(`US-006-A5 safe failure ${status}`, async (t) => {
    const rt = await runtime(t, ["Update"]);
    const requests = trackRequests(t, 5, () =>
      status === 0
        ? HttpResponse.error()
        : HttpResponse.text("synthetic-server-payload", { status }),
    );
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces)
      await failure(
        rt,
        rt.createCli(),
        [...actionCases[1]!.argv, "--fields", projection],
        surface,
        code,
      );
  });
}
