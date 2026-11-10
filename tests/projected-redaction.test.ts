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

export const partialCases = [
  { name: "batch", argv: ["builds", "batch", "delete", "--build", "42"], body: { count: 1, errorCount: 1 }, code: "batch.partial" },
  { name: "status", argv: ["builds", "set-status", "42", "FAILURE", "--comment", "Fixture"], body: { errors: { item: ["fixture-error"] } }, code: "build.statusPartial" },
  { name: "labels", argv: ["builds", "vcs-labels", "add", "42", "--label", "Fixture", "--root-instance", "Fixture_Root"], body: { vcsLabel: [{ status: "FAILED" }] }, code: "labels.partial" },
];
const cases = [{ name: "success", argv: ["builds", "show", "42"], body: {}, code: undefined }, ...partialCases];

for (const scenario of cases) for (const surface of ["human", "json", "execute", "rpc"] as const) {
  test(`#69 ${scenario.name} masks encoded keys and values on ${surface}`, async t => {
    const token = 'synthetic/a+b:cred?"\\end';
    const rt = await createTestRuntime(t, {
      profiles: [{ name: "default", url: "https://teamcity.test", permissions: ["ReadOnly", "Update"] }],
      tokens: { default: token },
    });
    const variants = [token, JSON.stringify(token).slice(1, -1), ...[encodeURI(token), encodeURIComponent(token)].flatMap(value => [
      value, value.replace(/%[0-9A-F]{2}/g, part => part.toLowerCase()),
      value.replace(/%[0-9A-F]{2}/g, part => part[0]! + part[1]!.toLowerCase() + part[2]!),
    ])];
    const custom = Object.fromEntries(variants.map((value, i) => [`${i}:${value}`, [value, `before ${value} after`, 1, false, null]]));
    const masked = Object.fromEntries(variants.map((_, i) => [`${i}:[redacted]`, ["[redacted]", "before [redacted] after", 1, false, null]]));
    const body = { ...scenario.body, custom, untouched: "https://fixture.test/path?q=value", ordinaryCase: token.toUpperCase() };
    const expected = { ...body, custom: masked };
    server.use(http.all("*", () => HttpResponse.json(body)));
    const cli = rt.createCli();
    const argv = [...scenario.argv, "--fields", "custom(*)"];
    if (surface === "execute") {
      if (scenario.code) await assert.rejects(cli.execute(argv), error => {
        assert.equal((error as CliError).code, scenario.code);
        assert.equal((error as CliError).exitCode, 1);
        assert.deepEqual((error as CliError).result, expected);
        return true;
      });
      else assert.deepEqual(await cli.execute(argv), expected);
    } else if (surface === "rpc") {
      const replies = await rt.rpc(cli, [argv, argv]) as Array<{ result?: unknown; error?: { data: { code: string; exitCode: number; result: unknown } } }>;
      for (const reply of replies) {
        assert.equal(reply.error?.data.code, scenario.code);
        if (scenario.code) assert.equal(reply.error?.data.exitCode, 1);
        assert.deepEqual(scenario.code ? reply.error?.data.result : reply.result, expected);
      }
    } else {
      const rendered = await rt.run(cli, [...argv, ...(surface === "json" ? ["--json"] : [])]);
      assert.equal(rendered.exitCode, scenario.code ? 1 : 0);
      if (surface === "json") {
        if (scenario.code) assert.equal(JSON.parse(rendered.stderr).error.code, scenario.code);
        assert.deepEqual(JSON.parse(rendered.stdout), expected);
      }
      for (const variant of variants) assert.ok(!(rendered.stdout + rendered.stderr).includes(variant));
      if (!scenario.code) assert.match(rendered.stdout, /\[redacted\]/);
    }
  });
}

for (const guest of [false, true]) test(`#69 ${guest ? "guest" : "one-character credential"} keeps native JSON usable`, async t => {
  const rt = await createTestRuntime(t, {
    profiles: [{ name: "default", url: "https://teamcity.test", guest }], tokens: guest ? {} : { default: "1" },
  });
  server.use(http.all("*", () => HttpResponse.json({ echo: "1", number: 1, flag: false, empty: null })));
  assert.deepEqual(await rt.createCli().execute(["builds", "show", "42", "--fields", "echo"]), {
    echo: guest ? "1" : "[redacted]", number: 1, flag: false, empty: null,
  });
});

test("#69 known credential masking preserves Unicode and literal matching", async () => {
  const { knownCredentialMask } = await import("../src/projection.js");
  for (const credential of ["synthetic-😀-credential", "synthetic-\ud800-credential", "synthetic.*[a]+credential"]) {
    const mask = knownCredentialMask(credential);
    assert.equal(mask(`before ${credential} after`), "before [redacted] after");
    assert.equal(mask(JSON.stringify(credential).slice(1, -1)), "[redacted]");
  }
  assert.equal(knownCredentialMask("")("native"), "native");
});

for (const scenario of cases) for (const surface of ["human", "json", "execute", "rpc"] as const) {
  test(`#74 ${scenario.name} masks nested encodings on ${surface}`, async t => {
    const token = 'synthetic/a+b:cred?"\\end';
    const rt = await createTestRuntime(t, {
      profiles: [{ name: "default", url: "https://teamcity.test", permissions: ["ReadOnly", "Update"] }],
      tokens: { default: token },
    });
    const twice = encodeURIComponent(encodeURIComponent(token));
    const thrice = encodeURIComponent(twice);
    const unicode = token.split("").map(char => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`).join("");
    const escaped = JSON.stringify(token).slice(1, -1).replaceAll("/", "\\/");
    const variants = [twice, thrice, encodeURI(encodeURIComponent(token)), encodeURIComponent(encodeURI(token)),
      encodeURI(encodeURIComponent(encodeURI(token))), unicode, escaped, encodeURIComponent(unicode),
      JSON.stringify(JSON.stringify(escaped).slice(1, -1)).slice(1, -1),
    ].flatMap(value => [value, value.replace(/%[\da-f]{2}/gi, part => part.toLowerCase()),
      value.replace(/\\u[\da-f]{4}/gi, part => "\\u" + part.slice(2).toUpperCase()),
    ]);
    const rows = variants.map(value => ({ [value]: { exact: value, longer: `before ${value} after`, array: [value, { echo: value }, 7, false, null] } }));
    const masked = variants.map(() => ({ "[redacted]": { exact: "[redacted]", longer: "[redacted]", array: ["[redacted]", { echo: "[redacted]" }, 7, false, null] } }));
    const body = { ...scenario.body, rows, literal: `before ${token} after ${token}`,
      fourth: encodeURIComponent(thrice), untouched: "ordinary %oops \\uZZZZ \\q",
      url: "https://fixture.test/path%2f?q=%252F+value#fragment", number: 7, flag: false, empty: null };
    const expected = { ...body, rows: masked, literal: "before [redacted] after [redacted]" };
    server.use(http.all("*", () => HttpResponse.json(body)));
    const cli = rt.createCli();
    const argv = [...scenario.argv, "--fields", "custom(*)"];
    if (surface === "execute") {
      if (scenario.code) await assert.rejects(cli.execute(argv), error => {
        assert.equal((error as CliError).code, scenario.code);
        assert.equal((error as CliError).exitCode, 1);
        assert.deepEqual((error as CliError).result, expected);
        return true;
      });
      else assert.deepEqual(await cli.execute(argv), expected);
    } else if (surface === "rpc") {
      const replies = await rt.rpc(cli, [argv, argv]) as Array<{ result?: unknown; error?: { data: { code: string; exitCode: number; result: unknown } } }>;
      for (const reply of replies) {
        assert.equal(reply.error?.data.code, scenario.code);
        if (scenario.code) assert.equal(reply.error?.data.exitCode, 1);
        assert.deepEqual(scenario.code ? reply.error?.data.result : reply.result, expected);
      }
    } else {
      const rendered = await rt.run(cli, [...argv, ...(surface === "json" ? ["--json"] : [])]);
      assert.equal(rendered.exitCode, scenario.code ? 1 : 0);
      if (surface === "json") {
        if (scenario.code) assert.equal(JSON.parse(rendered.stderr).error.code, scenario.code);
        assert.deepEqual(JSON.parse(rendered.stdout), expected);
      } else {
        assert.match(rendered.stdout, /before \[redacted\] after \[redacted\]/);
        assert.ok(rendered.stdout.includes(body.fourth));
        assert.ok(rendered.stdout.includes(body.untouched));
        assert.ok(rendered.stdout.includes(body.url));
      }
      for (const variant of [token, ...variants]) assert.equal((rendered.stdout + rendered.stderr).includes(variant), false);
    }
  });
}

test("#74 tolerant decoding preserves malformed escapes and unrelated text", async () => {
  const { knownCredentialMask } = await import("../src/projection.js");
  const token = 'synthetic/"\\\b\f\n\r\t-ü😀';
  const mask = knownCredentialMask(token);
  const escaped = JSON.stringify(token).slice(1, -1).replaceAll("/", "\\/");
  assert.equal(mask(`%oops \\q ${encodeURIComponent(token)} %FF`), "[redacted]");
  assert.equal(mask(`%oops \\q ${escaped} %FF`), "[redacted]");
  for (const text of ["%FF%E0%A4%A", "\\uZZZZ \\U0061 \\N \\q trailing\\", "ordinary", "https://fixture.test/a%2f?q=%25+value"]) {
    assert.equal(mask(text), text);
  }
  assert.equal(knownCredentialMask("")(`before ${escaped} after`), `before ${escaped} after`);
  assert.equal(knownCredentialMask("q")("before \\q after"), "before \\[redacted] after");
});
