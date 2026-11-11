import assert from "node:assert/strict";
import test from "node:test";
import { join } from "node:path";
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
    test(`#236 ${argv.slice(0, 3).join(" ")} forwards ${JSON.stringify(value)} for ${argv.at(-1)}`, async t => {
      const rt = await createTestRuntime(t);
      let calls = 0;
      server.use(http.all("*", ({ request }) => {
        calls++;
        const key = argv.at(-1) === "--archive-name" ? "name" : "basePath";
        assert.equal(new URL(request.url).searchParams.get(key), value);
        return argv.includes("archive") ? new HttpResponse(new Uint8Array([80,75,5,6,...Array(18).fill(0)]), { headers: { "content-type": "application/zip" } }) : HttpResponse.json({file:[]});
      }));
      const cli = rt.createCli();
      const input = argv.map(part => part === "result.zip" ? join(rt.root, "blank-control.zip") : part);
      await cli.execute([...input, value]);
      assert.equal(calls, 1);
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
