import assert from "node:assert/strict";
import test from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { TeamCityClient } from "../src/client.js";
import { createTestRuntime } from "./support.js";

const server = setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());

test("#369 audit and health list validation still throws synchronously", () => {
  const client = new TeamCityClient({
    baseUrl: "https://teamcity.test",
    token: "fixture-token",
    fetch: async () => assert.fail("no request expected"),
  });
  const illFormed = "\ud800";
  assert.throws(() => { void client.listAudit({}, illFormed); });
  assert.throws(() => { void client.listHealth({ project: illFormed }, {}); });
});

const malformed = [
  { argv: ["users", "tokens", "list"], body: { token: 7 }, expression: /\(value\.token \?\? \[\]\)\.map/ },
  { argv: ["groups", "list"], body: { group: 7 }, expression: /\(value\.group \?\? \[\]\)\.map/ },
];
for (const { argv, body, expression } of malformed) {
  test(`#369 ${argv.join(" ")} keeps its diagnostic for a malformed envelope`, async t => {
    const rt = await createTestRuntime(t);
    server.use(http.all("*", () => HttpResponse.json(body)));
    await assert.rejects(rt.createCli().execute(argv), expression);
  });
}

for (const argv of [["server", "plugins", "--help"], ["health", "categories", "list", "--help"]]) {
  test(`#369 ${argv.slice(0, -1).join(" ")} describes its own locator`, async t => {
    const rt = await createTestRuntime(t);
    const result = await rt.run(rt.createCli(), argv);
    assert.equal(result.exitCode, 0);
    assert.match(result.stdout, /--locator <locator>/);
    assert.doesNotMatch(result.stdout, /tags/i);
  });
}
