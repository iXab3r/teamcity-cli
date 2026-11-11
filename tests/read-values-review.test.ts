import assert from "node:assert/strict";
import test from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createTestRuntime } from "./support.js";

const server = setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());
const base = "https://teamcity.test/app/rest";
const job = "/buildTypes/id:Example_Build";

for (const field of ["number", "status", "startDate"]) test(`#156 builds fields show forwards ${field}`, async t => {
  const rt = await createTestRuntime(t);
  server.use(http.get(`${base}/builds/id:101/${field}`, () => HttpResponse.text("synthetic-text")));
  assert.deepEqual(await rt.createCli().execute(["builds", "fields", "show", "101", field]), {
    buildId: 101, field, value: "synthetic-text",
  });
});

for (const [owner, id, path] of [["projects", "Example", "/projects/id:Example"], ["jobs", "Example_Build", job]] as const) {
  const argv = [owner, "parameters", "value", "show", id, "setting"];
  const metadata = http.get(`${base}${path}/parameters/setting`, () => HttpResponse.json({ name: "setting" }));
  test(`#156 ${owner} parameter value without a returned value stays valueless`, async t => {
    const rt = await createTestRuntime(t);
    server.use(metadata, http.get(`${base}${path}/parameters/setting/value`, () => new HttpResponse(null, { status: 204 })));
    assert.deepEqual(await rt.createCli().execute(argv), { name: "setting", type: "plain", redacted: true });
  });
  test(`#156 ${owner} parameter value keeps a returned empty string`, async t => {
    const rt = await createTestRuntime(t);
    server.use(metadata, http.get(`${base}${path}/parameters/setting/value`, () => HttpResponse.text("")));
    assert.deepEqual(await rt.createCli().execute(argv), { name: "setting", type: "plain", redacted: false, value: "" });
  });
}
