import assert from "node:assert/strict";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import type { CliApplication, CliError } from "@eyeauras/cli-factory";
import { assertHttpRequest, trackRequests } from "@eyeauras/cli-factory/testing";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createTestRuntime } from "./support.js";
import { artifactProjectionCases as buildProjectionCases } from "./artifact-projection-cases.js";

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

for (const scenario of buildProjectionCases) {
  test(`US-004-A1 ${scenario.name}: native projection on all four surfaces`, async (t) => {
    const rt = await runtime(t);
    const cli = rt.createCli();
    const requests = trackRequests(t, 5, async (request) => {
      await assertHttpRequest(request, {
        method: "GET",
        url: origin + scenario.path,
        query: {


          ...(scenario.locator === undefined ? {} : { locator: scenario.locator }),
          fields: scenario.fields(projection),
        },
        headers: { accept: "application/json", authorization: `Bearer ${token}` },
      });
      return HttpResponse.json(scenario.response(native));
    });
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces) {
      const rendered = await success(
        rt,
        cli,
        [...scenario.argv, "--fields", projection],
        surface,
        scenario.result(native),
      );
      if (rendered && surface === "human") {
        assert.match(rendered.stdout, /triggered:/);
        assert.match(rendered.stdout, /fixture-user/);
        assert.match(rendered.stdout, /custom:/);
        assert.doesNotMatch(
          rendered.stdout + rendered.stderr,
          /BUILD\s+JOB|Build undefined|Next:|undefined/,
        );
      }
    }
  });

  test(`US-004-A3 ${scenario.name}: exact baseline request and output on all four surfaces`, async (t) => {
    const rt = await runtime(t);
    const cli = rt.createCli();
    const requests = trackRequests(t, 5, async (request) => {
      await assertHttpRequest(request, {
        method: "GET",
        url: origin + scenario.path,
        query: {


          ...(scenario.locator === undefined ? {} : { locator: scenario.locator }),
          fields: scenario.defaultFields,
        },
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

  test(`US-004 ${scenario.name}: native credential echoes are masked on every surface`, async (t) => {
    const rt = await runtime(t);
    const cli = rt.createCli();
    const echoed = { id: 42, nested: { value: `before ${token} after`, [token]: [token, null] } };
    const masked = {
      id: 42,
      nested: { value: "before [redacted] after", "[redacted]": ["[redacted]", null] },
    };
    const requests = trackRequests(t, 5, () => HttpResponse.json(scenario.response(echoed)));
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces) {
      const rendered = await success(
        rt,
        cli,
        [...scenario.argv, "--fields", "id,nested(*)"],
        surface,
        scenario.result(masked),
      );
      if (rendered) {
        assert.doesNotMatch(rendered.stdout + rendered.stderr, new RegExp(token));
        if (surface === "human") assert.match(rendered.stdout, /\[redacted\]/);
      }
    }
  });

  test(`US-004-A4 ${scenario.name}: denied ReadOnly has no HTTP, credential or file effects`, async (t) => {
    const rt = await runtime(t, []);
    const cli = rt.createCli();
    const snapshot = async (path: string): Promise<unknown> =>
      Promise.all(
        (await readdir(path, { withFileTypes: true })).map(async (entry) => [
          entry.name,
          entry.isDirectory()
            ? await snapshot(join(path, entry.name))
            : (await readFile(join(path, entry.name))).toString("base64"),
        ]),
      );
    const before = await snapshot(rt.root);
    const effects: string[] = [];
    for (const method of ["get", "set", "delete"] as const) {
      t.mock.method(rt.secretStore, method, async () => {
        effects.push(method);
        throw new Error("Unexpected credential access.");
      });
    }
    const requests = trackRequests(t, 0, () => HttpResponse.json({}));
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces) {
      const evidence = await failure(
        rt,
        cli,
        [...scenario.argv, "--fields", projection],
        surface,
        "permission.denied",
      );
      assert.match(evidence, /ReadOnly/);
    }
    assert.deepEqual(effects, []);
    assert.deepEqual(await snapshot(rt.root), before);
  });

  for (const fields of ["", " \t\n "]) {
    test(`US-004-A6 ${scenario.name}: forwards ${fields === "" ? "empty" : "blank"} fields on all surfaces`, async (t) => {
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
  {
    name: "401",
    code: "http.unauthorized",
    response: () => HttpResponse.text(`synthetic-server-payload ${token}`, { status: 401 }),
  },
  {
    name: "403",
    code: "http.forbidden",
    response: () => HttpResponse.text(`synthetic-server-payload ${token}`, { status: 403 }),
  },
  {
    name: "404",
    code: "http.notFound",
    response: () => HttpResponse.text(`synthetic-server-payload ${token}`, { status: 404 }),
  },
  {
    name: "503",
    code: "http.serverError",
    response: () => HttpResponse.text(`synthetic-server-payload ${token}`, { status: 503 }),
  },
  { name: "transport", code: "request.failed", response: () => HttpResponse.error() },
  {
    name: "decoding",
    code: "error",
    response: () => HttpResponse.text(`invalid JSON synthetic-server-payload ${token}`),
  },
];
for (const example of failures) {
  test(`US-004-A5 ${example.name}: existing safe error contract without retries on all surfaces`, async (t) => {
    const rt = await runtime(t);
    const cli = rt.createCli();
    const requests = trackRequests(t, 5, () => example.response());
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces) {
      const evidence = await failure(
        rt,
        cli,
        ["builds", "artifacts", "metadata", "42", "logs", "--fields", projection],
        surface,
        example.code,
      );
      if (surface !== "human" && ["transport", "decoding"].includes(example.name))
        assert.match(evidence, /cause/);
    }
  });
}

for (const action of ["list", "children", "metadata", "download", "archive"]) {
  const argv = ["builds", "artifacts", action, "42", ...(action === "list" ? [] : ["logs"])];
  for (const flag of ["--resolve-parameters", "--log-build-usage"])
    for (const value of ["TRUE", "1", "", " "]) {
      test(`US-004-A2 ${action} rejects ${flag} ${JSON.stringify(value)}`, async (t) => {
        const rt = await runtime(t);
        const requests = trackRequests(t, 0, () => HttpResponse.json({}));
        server.use(http.all("*", ({ request }) => requests.handle(request)));
        for (const surface of surfaces)
          await failure(rt, rt.createCli(), [...argv, flag, value], surface, "usage");
      });
    }
  for (const value of ["true", "false"])
    test(`US-004-A2 ${action} forwards native controls ${value}`, async (t) => {
      const rt = await runtime(t);
      const expected: Record<string, string> = { resolveParameters: value, logBuildUsage: value };
      const extra = ["--resolve-parameters", value, "--log-build-usage", value];
      if (["list", "children", "archive"].includes(action)) {
        expected.basePath = " /artifacts + ";
        extra.push("--base-path", expected.basePath);
      }
      if (action === "archive") {
        expected.name = "server archive.zip";
        extra.push("--archive-name", expected.name);
      }
      const requests = trackRequests(t, 1, (request) => {
        const query = new URL(request.url).searchParams;
        for (const [key, v] of Object.entries(expected)) assert.equal(query.get(key), v);
        return action === "download"
          ? HttpResponse.text("bytes")
          : action === "archive"
            ? new HttpResponse(new Uint8Array([80, 75, 5, 6, ...Array(18).fill(0)]), {
                headers: { "content-type": "application/zip" },
              })
            : HttpResponse.json(action === "metadata" ? { name: "logs" } : { file: [] });
      });
      server.use(http.all("*", ({ request }) => requests.handle(request)));
      await rt
        .createCli()
        .execute([
          ...argv,
          ...extra,
          ...(["download", "archive"].includes(action)
            ? ["--output", join(rt.root, "result" + value)]
            : []),
        ]);
    });
}

for (const action of ["download", "archive"]) {
  const prefix = ["builds", "artifacts", action, "42", "logs"];
  const bytes =
    action === "archive"
      ? new Uint8Array([80, 75, 5, 6, ...Array(18).fill(0)])
      : new TextEncoder().encode("fixture");
  const response = () =>
    new HttpResponse(bytes, {
      headers: {
        "content-type": action === "archive" ? "application/zip" : "application/octet-stream",
      },
    });
  test(`US-004-A5 ${action} denied controls have zero effects on all surfaces`, async (t) => {
    const rt = await runtime(t, []);
    const requests = trackRequests(t, 0, response);
    server.use(http.all("*", ({ request }) => requests.handle(request)));
    for (const surface of surfaces)
      await failure(
        rt,
        rt.createCli(),
        [...prefix, "--resolve-parameters", "true", "--output", join(rt.root, "denied")],
        surface,
        "permission.denied",
      );
  });
  test(`US-004-A3 ${action} controls preserve publication and byte bounds`, async (t) => {
    const rt = await runtime(t);
    const target = join(rt.root, "existing");
    await writeFile(target, "existing fixture");
    server.use(http.all("*", () => response()));
    const argv = [
      ...prefix,
      "--resolve-parameters",
      "true",
      "--log-build-usage",
      "false",
      "--output",
      target,
    ];
    await assert.rejects(rt.createCli().execute(argv), /already exists/);
    assert.equal(await readFile(target, "utf8"), "existing fixture");
    await assert.rejects(
      rt.createCli().execute([...argv.slice(0, -1), join(rt.root, "bounded"), "--max-bytes", "1"]),
    );
    await assert.rejects(readFile(join(rt.root, "bounded")));
  });
}
test("US-004 list item projections preserve count+1 lookahead without adding view fields", async (t) => {
  const rt = await runtime(t);
  const requests = trackRequests(t, 5, async (request) => {
    await assertHttpRequest(request, {
      method: "GET",
      url: origin + "/app/rest/builds/id:42/artifacts",
      query: {


        locator: "count:3,browseArchives:true",
        fields: "count,file(custom)",
      },
    });
    return HttpResponse.json({ file: [{ custom: 1 }, { custom: 2 }, { custom: 3 }] });
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  for (const surface of surfaces)
    await success(
      rt,
      rt.createCli(),
      ["builds", "artifacts", "list", "42", "--limit", "2", "--fields", "custom"],
      surface,
      { count: 2, items: [{ custom: 1 }, { custom: 2 }], hasMore: true },
    );
});
