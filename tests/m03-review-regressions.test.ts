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

const blankControls = [
  ["jobs", "files", "list", "Demo", "--base-path"],
  ["jobs", "files", "children", "Demo", "src", "--base-path"],
  ["jobs", "files", "archive", "Demo", "src", "--output", "result.zip", "--base-path"],
  ["jobs", "files", "archive", "Demo", "src", "--output", "result.zip", "--archive-name"],
  ["builds", "artifacts", "list", "42", "--base-path"],
  ["builds", "artifacts", "archive", "42", "logs", "--output", "result.zip", "--archive-name"],
];
for (const argv of blankControls) {
  for (const value of ["", "   "]) {
    test(`#236 ${argv.slice(0, 3).join(" ")} rejects ${JSON.stringify(value)} for ${argv.at(-1)} before HTTP`, async t => {
      const rt = await createTestRuntime(t);
      let calls = 0;
      server.use(http.all("*", () => {
        calls++;
        return HttpResponse.json({});
      }));
      const cli = rt.createCli();
      const result = await rt.run(cli, [...argv, value]);
      assert.equal(result.exitCode, 1);
      await assert.rejects(cli.execute([...argv, value]));
      assert.equal(calls, 0);
    });
  }
}

test("#237 invalid input rejects the returned promise instead of throwing synchronously", async () => {
  const client = new TeamCityClient({
    baseUrl: "https://teamcity.test",
    token: "fixture-token",
    fetch: async () => assert.fail("no request expected"),
  });
  const illFormed = "\ud800";
  const calls: Array<() => Promise<unknown>> = [
    () => client.getParameter("projects", "Demo", ".."),
    () => client.listParameters("projects", illFormed),
    () => client.listJobBuilds(illFormed),
    () => client.getJobInvestigations(illFormed),
    () => client.getJobVcsInstances(illFormed),
  ];
  for (const call of calls) {
    let pending: Promise<unknown> | undefined;
    assert.doesNotThrow(() => { pending = call(); });
    await assert.rejects(pending!);
  }
});
