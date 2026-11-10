import assert from "node:assert/strict";
import test from "node:test";
import type { CliError } from "@eyeauras/cli-factory";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createTestRuntime } from "./support.js";

const server = setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());

export const partialCases = [
  { name: "batch", argv: ["builds", "batch", "delete", "--build", "42"], body: { count: 1, errorCount: 1 }, code: "batch.partial" },
  { name: "status", argv: ["builds", "set-status", "42", "FAILURE", "--comment", "Fixture"], body: { errors: { item: ["fixture-error"] } }, code: "build.statusPartial" },
  { name: "labels", argv: ["builds", "vcs-labels", "add", "42", "--label", "Fixture", "--root-instance", "Fixture_Root"], body: { vcsLabel: [{ status: "FAILED" }] }, code: "labels.partial" },
];
const cases = [{ name: "success", argv: ["builds", "show", "42"], body: {}, code: undefined }, ...partialCases];

for (const scenario of cases) for (const surface of ["human", "json", "execute", "rpc"] as const) {
  test(`#69 ${scenario.name} masks encoded keys and values on ${surface}`, async t => {
    const token = 'synthetic/a+b:cred?"\\end';
    const rt = await createTestRuntime(t, {
      profiles: [{ name: "default", url: "https://teamcity.test", permissions: ["ReadOnly", "Update"] }],
      tokens: { default: token },
    });
    const variants = [token, JSON.stringify(token).slice(1, -1), ...[encodeURI(token), encodeURIComponent(token)].flatMap(value => [
      value, value.replace(/%[0-9A-F]{2}/g, part => part.toLowerCase()),
      value.replace(/%[0-9A-F]{2}/g, part => part[0]! + part[1]!.toLowerCase() + part[2]!),
    ])];
    const custom = Object.fromEntries(variants.map((value, i) => [`${i}:${value}`, [value, `before ${value} after`, 1, false, null]]));
    const masked = Object.fromEntries(variants.map((_, i) => [`${i}:[redacted]`, ["[redacted]", "before [redacted] after", 1, false, null]]));
    const body = { ...scenario.body, custom, untouched: "https://fixture.test/path?q=value", ordinaryCase: token.toUpperCase() };
    const expected = { ...body, custom: masked };
    server.use(http.all("*", () => HttpResponse.json(body)));
    const cli = rt.createCli();
    const argv = [...scenario.argv, "--fields", "custom(*)"];
    if (surface === "execute") {
      if (scenario.code) await assert.rejects(cli.execute(argv), error => {
        assert.equal((error as CliError).code, scenario.code);
        assert.equal((error as CliError).exitCode, 1);
        assert.deepEqual((error as CliError).result, expected);
        return true;
      });
      else assert.deepEqual(await cli.execute(argv), expected);
    } else if (surface === "rpc") {
      const replies = await rt.rpc(cli, [argv, argv]) as Array<{ result?: unknown; error?: { data: { code: string; exitCode: number; result: unknown } } }>;
      for (const reply of replies) {
        assert.equal(reply.error?.data.code, scenario.code);
        if (scenario.code) assert.equal(reply.error?.data.exitCode, 1);
        assert.deepEqual(scenario.code ? reply.error?.data.result : reply.result, expected);
      }
    } else {
      const rendered = await rt.run(cli, [...argv, ...(surface === "json" ? ["--json"] : [])]);
      assert.equal(rendered.exitCode, scenario.code ? 1 : 0);
      if (surface === "json") {
        const result = JSON.parse(scenario.code ? rendered.stderr : rendered.stdout);
        if (scenario.code) assert.equal(result.error.code, scenario.code);
        assert.deepEqual(scenario.code ? result.error.result : result, expected);
      }
      for (const variant of variants) assert.ok(!(rendered.stdout + rendered.stderr).includes(variant));
      if (!scenario.code) assert.match(rendered.stdout, /\[redacted\]/);
    }
  });
}

for (const guest of [false, true]) test(`#69 ${guest ? "guest" : "one-character credential"} keeps native JSON usable`, async t => {
  const rt = await createTestRuntime(t, {
    profiles: [{ name: "default", url: "https://teamcity.test", guest }], tokens: guest ? {} : { default: "1" },
  });
  server.use(http.all("*", () => HttpResponse.json({ echo: "1", number: 1, flag: false, empty: null })));
  assert.deepEqual(await rt.createCli().execute(["builds", "show", "42", "--fields", "echo"]), {
    echo: guest ? "1" : "[redacted]", number: 1, flag: false, empty: null,
  });
});
