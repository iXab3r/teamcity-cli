import assert from "node:assert/strict";
import test from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { knownCredentialMask } from "../src/projection.js";
import { createTestRuntime } from "./support.js";

const server = setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());

for (const surface of ["human", "json", "execute", "rpc"] as const) {
  test(`#75 a 32768-character credential permits projected results on ${surface}`, async t => {
    const token = "s".repeat(32768);
    const rt = await createTestRuntime(t, { tokens: { default: token } });
    const expected = { custom: "ordinary", number: 1, flag: false, empty: null };
    server.use(http.get("https://teamcity.test/app/rest/builds/id:42", () => HttpResponse.json(expected)));
    const cli = rt.createCli();
    const argv = ["builds", "show", "42", "--fields", "custom"];
    if (surface === "execute") {
      const result = await cli.execute(argv).catch(error => {
        assert.equal(String(error).includes(token), false, "error discloses the credential");
        assert.fail("projected execution failed");
      });
      assert.equal(JSON.stringify(result).includes(token), false);
      assert.deepEqual(result, expected);
    } else if (surface === "rpc") {
      const replies = await rt.rpc(cli, [argv, argv]);
      assert.equal(JSON.stringify(replies).includes(token), false, "RPC discloses the credential");
      assert.deepEqual(replies, [0, 1].map(id => ({ jsonrpc: "2.0", id, result: expected })));
    } else {
      const rendered = await rt.run(cli, [...argv, ...(surface === "json" ? ["--json"] : [])]);
      assert.equal((rendered.stdout + rendered.stderr).includes(token), false, "output discloses the credential");
      assert.equal(rendered.exitCode, 0);
      assert.equal(rendered.stderr, "");
      if (surface === "json") assert.deepEqual(JSON.parse(rendered.stdout), expected);
      else assert.match(rendered.stdout, /custom: ordinary/);
    }
  });
}

test("#75 a million-character credential masks long input promptly", { timeout: 5000 }, () => {
  const token = "s".repeat(1_000_000);
  const started = performance.now();
  try {
    const mask = knownCredentialMask(token);
    assert.equal(mask("ordinary"), "ordinary");
    assert.equal(mask(`before ${token} after ${token}`), "before [redacted] after [redacted]");
  } catch {
    assert.fail("long-credential masking failed");
  }
  assert.ok(performance.now() - started < 1000, "masking should finish within one second");
});
