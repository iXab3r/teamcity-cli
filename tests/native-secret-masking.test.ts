import assert from "node:assert/strict";
import test from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { TeamCityClient } from "../src/client.js";
import { createTestRuntime } from "./support.js";

const server = setupServer();
const secret = "synthetic-review-alias-secret-AbCdEf";
const issued = "synthetic-review-issued-token-AbCdEf";
const profileToken = "synthetic-review-profile-token-AbCdEf";
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());

async function runtime(t: test.TestContext) {
  const rt = await createTestRuntime(t, { tokens: { default: profileToken }, profiles: [
    { name: "default", url: "https://teamcity.test", permissions: ["ReadOnly", "Update", "Admin", "Credentials"] },
  ] });
  await rt.secretStore.set("ai-cli-factory:teamcity-cli", "default:input-secret:input", secret);
  return rt;
}

const writes = [
  { name: "authentication", argv: ["server", "authentication", "replace", "--item", '{"modules":[{"name":"fixture","secrets":[{"name":"password","alias":"input"}]}]}', "--confirm"], response: { value: secret } },
  { name: "versioned tokens", argv: ["projects", "versioned-settings", "tokens", "set", "Demo", "--mapping", "remote=input"], response: { value: secret } },
  { name: "license add", argv: ["server", "licenses", "add", "--secret", "input"], response: { value: secret } },
  { name: "license show", argv: ["server", "licenses", "show", "input"], response: { value: secret } },
  { name: "license delete", argv: ["server", "licenses", "delete", "input", "--confirm"], response: { value: secret } },
  { name: "password parameter", argv: ["jobs", "parameters", "set-password", "Demo", "color", "--value-secret", "input", "--item", '{"type":{"rawValue":"text"}}'], response: { value: secret } },
];

for (const c of writes) test(`#382 ${c.name} masks alias echoes exactly on all four surfaces`, async t => {
  const rt = await runtime(t);
  server.use(http.all("*", () => HttpResponse.json(c.response)));
  const cli = rt.createCli();
  const argv = [...c.argv, "--fields", "*"];
  const expected = { value: "[redacted]" };
  assert.deepEqual(await cli.execute(argv), expected);
  const human = await rt.run(cli, argv);
  assert.deepEqual(human, { exitCode: 0, stdout: "value: [redacted]\n", stderr: "" });
  const json = await rt.run(cli, [...argv, "--json"]);
  assert.deepEqual(json, { exitCode: 0, stdout: JSON.stringify(expected) + "\n", stderr: "" });
  assert.deepEqual(await rt.rpc(cli, [argv]), [{ jsonrpc: "2.0", id: 0, result: expected }]);
});

for (const source of ["profile", "alias"] as const) {
  for (const ending of ["complete", "partial", "encoded", "stream-failure"] as const) {
    test(`#382 ${source} HTTP boundary ${ending} has exact masked output on all surfaces`, async t => {
      const rt = await runtime(t);
      const credential = source === "profile" ? profileToken : secret;
      const prefix = "x".repeat(4080);
      const suffix = ending === "partial" ? credential.slice(0, 16)
        : ending === "encoded" ? [...credential].map(c => "%" + c.charCodeAt(0).toString(16)).join("") : credential;
      if (ending === "stream-failure") {
        rt.runtime.fetch = async () => {
          let sent = false;
          return new Response(new ReadableStream({
            pull(controller) {
              if (sent) controller.error(new Error("synthetic interrupted body"));
              else { sent = true; controller.enqueue(Buffer.from(prefix + credential.slice(0, 16))); }
            },
          }), { status: 400 });
        };
      } else server.use(http.all("*", () => HttpResponse.text(prefix + suffix, { status: 400 })));
      const argv = source === "profile" ? ["server", "status"] : writes[1]!.argv;
      const explanation = ending === "partial" || ending === "stream-failure" ? prefix
        : ending === "encoded" ? "[redacted]" : prefix + "[redacted]";
      const message = "TeamCity request failed with HTTP 400. " + explanation;
      const cli = rt.createCli();
      await assert.rejects(cli.execute(argv), { code: "http.rejected", message, exitCode: 1 });
      assert.deepEqual(await rt.run(cli, argv), { exitCode: 1, stdout: "", stderr: message + "\n" });
      assert.deepEqual(await rt.run(cli, [...argv, "--json"]), { exitCode: 1, stdout: "", stderr: JSON.stringify({ error: { code: "http.rejected", message, exitCode: 1, profile: "default" } }) + "\n" });
      assert.deepEqual(await rt.rpc(cli, [argv]), [{ jsonrpc: "2.0", id: 0, error: { code: -32000, message, data: { code: "http.rejected", exitCode: 1, profile: "default" } } }]);
    });
  }
}

test("#382 stored user token and copies are masked on all surfaces", async t => {
  const rt = await runtime(t);
  server.use(http.post("*", () => HttpResponse.json({ name: "review", value: issued, copy: `echo ${issued}`, [issued]: issued })));
  const cli = rt.createCli();
  const expected = { name: "review", value: "[redacted]", copy: "echo [redacted]", "[redacted]": "[redacted]" };
  for (const surface of ["execute", "human", "json", "rpc"]) {
    const argv = ["users", "tokens", "create", "review", "--alias", surface, "--fields", "*"];
    if (surface === "execute") assert.deepEqual(await cli.execute(argv), expected);
    if (surface === "human") assert.deepEqual(await rt.run(cli, argv), { exitCode: 0, stdout: "name: review\nvalue: [redacted]\ncopy: echo [redacted]\n[redacted]: [redacted]\n", stderr: "" });
    if (surface === "json") assert.deepEqual(await rt.run(cli, [...argv, "--json"]), { exitCode: 0, stdout: JSON.stringify(expected) + "\n", stderr: "" });
    if (surface === "rpc") assert.deepEqual(await rt.rpc(cli, [argv]), [{ jsonrpc: "2.0", id: 0, result: expected }]);
    assert.deepEqual(JSON.parse((await rt.secretStore.get("ai-cli-factory:teamcity-cli", `default:issued-token:${surface}`))!), { name: "review", value: issued });
  }
});

test("#382 plain license keys are returned and prior alias use does not taint the next invocation", async t => {
  const rt = await runtime(t);
  server.use(http.all("*", () => HttpResponse.json({ value: secret })));
  const cli = rt.createCli();
  await cli.execute(["server", "licenses", "show", "input", "--fields", "*"]);
  const argv = ["server", "licenses", "show", "--key", secret, "--fields", "*"];
  const expected = { value: secret };
  assert.deepEqual(await cli.execute(argv), expected);
  assert.deepEqual(await rt.run(cli, argv), { exitCode: 0, stdout: `value: ${secret}\n`, stderr: "" });
  assert.deepEqual(await rt.run(cli, [...argv, "--json"]), { exitCode: 0, stdout: JSON.stringify(expected) + "\n", stderr: "" });
  assert.deepEqual(await rt.rpc(cli, [argv]), [{ jsonrpc: "2.0", id: 0, result: expected }]);
});

for (const kind of ["pool", "reference", "resolved-reference", "parameter"] as const) {
  test(`#382 ${kind} storage-only output stays exact on all surfaces`, async t => {
    const rt = await runtime(t);
    server.use(http.all("*", () => kind === "pool" ? HttpResponse.json({ item: [issued] }) : HttpResponse.text(issued)));
    await rt.secretStore.set("ai-cli-factory:teamcity-cli", "default:secure-reference:reference-input", secret);
    const cli = rt.createCli();
    for (const surface of ["execute", "human", "json", "rpc"]) {
      const argv = kind === "pool" ? ["pools", "tokens", "create", "2", "--ttl", "300"]
        : kind === "reference" ? ["projects", "secure", "create-reference", "Demo", "--value-secret", "input"]
        : kind === "resolved-reference" ? ["projects", "secure", "resolve", "Demo", "--reference", "reference-input"]
        : ["builds", "resolve-parameter", "7", "env.MODE"];
      argv.push("--store-as", surface);
      const expected = kind === "pool" ? { poolId: 2, aliases: [surface], count: 1, timeToLiveSeconds: 300, stored: true }
        : kind === "reference" ? { projectId: "Demo", referenceAlias: surface, stored: true }
        : { alias: surface, stored: true };
      if (surface === "execute") assert.deepEqual(await cli.execute(argv), expected);
      if (surface === "human") {
        const stdout = kind === "pool" ? "poolId: 2\naliases:\n  - human\ncount: 1\ntimeToLiveSeconds: 300\nstored: true\n"
          : kind === "reference" ? "projectId: Demo\nreferenceAlias: human\nstored: true\n" : "alias: human\nstored: true\n";
        assert.deepEqual(await rt.run(cli, argv), { exitCode: 0, stdout, stderr: "" });
      }
      if (surface === "json") assert.deepEqual(await rt.run(cli, [...argv, "--json"]), { exitCode: 0, stdout: JSON.stringify(expected) + "\n", stderr: "" });
      if (surface === "rpc") assert.deepEqual(await rt.rpc(cli, [argv]), [{ jsonrpc: "2.0", id: 0, result: expected }]);
      const key = kind === "reference" ? "secure-reference:" : "input-secret:";
      assert.equal(await rt.secretStore.get("ai-cli-factory:teamcity-cli", `default:${key}${surface}`), issued);
    }
  });
}

test("#382 native aliases mask nested literal, encoded and escaped copies alongside the profile token", async t => {
  const rt = await runtime(t);
  const encoded = [...secret].map(c => "%" + c.charCodeAt(0).toString(16)).join("");
  const escaped = [...secret].map(c => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")).join("");
  server.use(http.all("*", () => HttpResponse.json({ [secret]: { nested: [secret, encoded, escaped, profileToken, "plain"] } })));
  const argv = [...writes[0]!.argv, "--fields", "*"];
  const expected = { "[redacted]": { nested: ["[redacted]", "[redacted]", "[redacted]", "[redacted]", "plain"] } };
  const cli = rt.createCli();
  assert.deepEqual(await cli.execute(argv), expected);
  assert.deepEqual(await rt.run(cli, argv), { exitCode: 0, stdout: "[redacted]:\n  nested:\n    - [redacted]\n    - [redacted]\n    - [redacted]\n    - [redacted]\n    - plain\n", stderr: "" });
  assert.deepEqual(await rt.run(cli, [...argv, "--json"]), { exitCode: 0, stdout: JSON.stringify(expected) + "\n", stderr: "" });
  assert.deepEqual(await rt.rpc(cli, [argv]), [{ jsonrpc: "2.0", id: 0, result: expected }]);
});

test("#382 createProject keeps synchronous argument errors", () => {
  const client = new TeamCityClient({ baseUrl: "https://teamcity.test", token: profileToken });
  assert.throws(() => client.createProject(undefined as unknown as string, {}), { message: "Project ID must be text." });
});
