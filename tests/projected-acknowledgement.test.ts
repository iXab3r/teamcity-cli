import assert from "node:assert/strict";
import test from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createTestRuntime } from "./support.js";

const server = setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());

const cases = [
  { argv: ["builds", "tags", "add", "42", "--tag", "release"], expected: { buildId: 42, tags: ["release"], added: true } },
  { argv: ["builds", "log", "append", "42", "--text", "Fixture"], expected: { buildId: 42, appended: true } },
  { argv: ["queue", "delete-page", "--job", "Demo_Build", "--confirm"], expected: { jobId: "Demo_Build", pageDeleted: true } },
];
for (const scenario of cases) for (const body of ["", " \n", "not JSON", undefined]) {
  for (const surface of ["human", "json", "execute", "rpc"] as const) {
    test(`#71 ${scenario.argv.slice(0, 3).join(" ")} ${JSON.stringify(body)} acknowledgement parity on ${surface}`, async t => {
      const rt = await createTestRuntime(t, {
        profiles: [{ name: "default", url: "https://teamcity.test", permissions: ["Update"] }],
      });
      server.use(http.all("*", () => body === undefined ? new HttpResponse(null, { status: 204 }) : HttpResponse.text(body)));
      const cli = rt.createCli();
      for (const argv of [scenario.argv, [...scenario.argv, "--fields", "tag(name)"]]) {
        if (surface === "execute") assert.deepEqual(await cli.execute(argv), scenario.expected);
        else if (surface === "rpc") assert.deepEqual(await rt.rpc(cli, [argv, argv]), [0, 1].map(id => ({ jsonrpc: "2.0", id, result: scenario.expected })));
        else {
          const rendered = await rt.run(cli, [...argv, ...(surface === "json" ? ["--json"] : [])]);
          assert.equal(rendered.exitCode, 0, rendered.stderr);
          assert.equal(rendered.stderr, "");
          if (surface === "json") assert.deepEqual(JSON.parse(rendered.stdout), scenario.expected);
          else assert.match(rendered.stdout, /(?:added|appended|pageDeleted): true/);
        }
      }
    });
  }
}
