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

// Credentials whose own text is a JSON escape: each decoding step must be checked on its own.
const credentials = ["synthetic-\\n-cred", "synthetic-\\u0061-cred", "synthetic-\\\\-cred", "synthetic-\\/-cred"];
const percent = (text: string) =>
  [...Buffer.from(text)].map(byte => "%" + byte.toString(16).padStart(2, "0")).join("");

for (const credential of credentials) {
  test(`#76 encoded copies of ${JSON.stringify(credential)} are masked`, () => {
    const mask = knownCredentialMask(credential);
    for (const copy of [
      encodeURIComponent(credential),
      percent(credential),
      encodeURIComponent(encodeURIComponent(credential)),
      percent(encodeURIComponent(credential)),
      JSON.stringify(credential).slice(1, -1),
      encodeURIComponent(JSON.stringify(credential).slice(1, -1)),
    ]) assert.equal(mask(copy), "[redacted]", copy);
    assert.equal(mask(`a ${credential} b`), "a [redacted] b");
    assert.equal(mask("synthetic-%5Cx-cred"), "synthetic-%5Cx-cred");
  });
}

test("#76 a percent-encoded backslash credential is masked in projected JSON", async t => {
  const credential = "synthetic-\\n-cred";
  const rt = await createTestRuntime(t, { tokens: { default: credential } });
  server.use(http.get("https://teamcity.test/app/rest/builds/id:42", () =>
    HttpResponse.json({ custom: encodeURIComponent(credential), number: "7" })));
  const result = await rt.json(rt.createCli(), ["builds", "show", "42", "--fields", "custom,number"]);
  assert.deepEqual(result, { custom: "[redacted]", number: "7" });
});
