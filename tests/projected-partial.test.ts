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

const cases = [
  { token: "errorCount", argv: ["builds", "batch", "delete", "--build", "42"], body: { count: 1, errorCount: 1 }, expected: { count: 1, "[redacted]": 1 }, code: "batch.partial" },
  { token: "errors", argv: ["builds", "set-status", "42", "FAILURE", "--comment", "Fixture"], body: { errors: { item: ["fixture-error"] } }, expected: { "[redacted]": { item: ["fixture-error"] } }, code: "build.statusPartial" },
  { token: "FAILED", argv: ["builds", "vcs-labels", "add", "42", "--label", "Fixture", "--root-instance", "Fixture_Root"], body: { vcsLabel: [{ status: "FAILED" }] }, expected: { vcsLabel: [{ status: "[redacted]" }] }, code: "labels.partial" },
];
for (const scenario of cases) for (const surface of ["human", "json", "execute", "rpc"] as const) {
  test(`#70 native ${scenario.code} survives masking ${scenario.token} on ${surface}`, async t => {
    const rt = await createTestRuntime(t, {
      profiles: [{ name: "default", url: "https://teamcity.test", permissions: ["Update"] }],
      tokens: { default: scenario.token },
    });
    server.use(http.all("*", () => HttpResponse.json(scenario.body)));
    const cli = rt.createCli();
    const argv = [...scenario.argv, "--fields", "custom(*)"];
    if (surface === "execute") await assert.rejects(cli.execute(argv), error => {
      assert.equal((error as CliError).code, scenario.code);
      assert.equal((error as CliError).exitCode, 1);
      assert.deepEqual((error as CliError).result, scenario.expected);
      return true;
    });
    else if (surface === "rpc") {
      const replies = await rt.rpc(cli, [argv, argv]) as Array<{ error: { data: { code: string; exitCode: number; result: unknown } } }>;
      for (const reply of replies) {
        assert.equal(reply.error.data.code, scenario.code);
        assert.equal(reply.error.data.exitCode, 1);
        assert.deepEqual(reply.error.data.result, scenario.expected);
      }
    } else {
      const rendered = await rt.run(cli, [...argv, ...(surface === "json" ? ["--json"] : [])]);
      assert.equal(rendered.exitCode, 1);
      if (surface === "json") {
        assert.equal(JSON.parse(rendered.stderr).error.code, scenario.code);
        assert.deepEqual(JSON.parse(rendered.stdout), scenario.expected);
      } else assert.match(rendered.stdout, /\[redacted\]/);
    }
  });
}
