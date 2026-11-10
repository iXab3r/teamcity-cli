import assert from "node:assert/strict";
import test from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createTestRuntime } from "./support.js";

const server = setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());

for (const argv of [["vcs", "roots", "instances", "Demo"], ["vcs", "instances", "check-changes", "8"]]) {
  test(`#304 ${argv.slice(0, 3).join(" ")} keeps returning an empty list for a non-envelope body`, async t => {
    const rt = await createTestRuntime(t, {
      profiles: [{ name: "default", url: "https://teamcity.test", permissions: ["ReadOnly", "Update"] }],
    });
    server.use(http.all("*", () => HttpResponse.json([])));
    const cli = rt.createCli();
    assert.deepEqual(await cli.execute(argv), []);
    assert.deepEqual(await rt.json(cli, argv), []);
  });
}
