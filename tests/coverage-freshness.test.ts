import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

type CoverageRow = { status: string; bindings: { permission: string; command: string }[]; query: unknown[] };

const tracked = resolve("docs/rest-api-coverage/current");
const files = ["coverage.json", "coverage.tsv", "summary.json"];

async function fixture(t: TestContext) {
  const root = await mkdtemp(join(tmpdir(), "teamcity-freshness-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const generated = join(root, "generated");
  await cp(tracked, generated, { recursive: true });
  const script = new URL("../../scripts/rest-api-audit/verify.mjs", import.meta.url).href;
  const { assertFreshCoverage } = await import(script) as {
    assertFreshCoverage(expected: string, actual: string): Promise<void>;
  };
  return { generated, assertFreshCoverage };
}

test("coverage freshness accepts only the commit-lineage difference in the summary", async t => {
  const { generated, assertFreshCoverage } = await fixture(t);
  await assertFreshCoverage(tracked, generated);
  const path = join(generated, "summary.json");
  const summary = JSON.parse(await readFile(path, "utf8"));
  summary.baselineHead = "1".repeat(40);
  await writeFile(path, JSON.stringify(summary, null, 2) + "\n");
  await assertFreshCoverage(tracked, generated);
  summary.covered--;
  summary.partial++;
  await writeFile(path, JSON.stringify(summary, null, 2) + "\n");
  await assert.rejects(assertFreshCoverage(tracked, generated), /summary\.json/);
});

test("coverage freshness rejects changed routes, permissions, bindings and statuses", async t => {
  const { generated, assertFreshCoverage } = await fixture(t);
  const original = await readFile(join(tracked, "coverage.json"), "utf8");
  const mutations: ((rows: CoverageRow[]) => void)[] = [
    rows => { rows.pop(); },
    rows => { rows.push(structuredClone(rows[0]!)); },
    rows => { rows[0]!.bindings[0]!.permission = "Synthetic"; },
    rows => { rows[0]!.bindings[0]!.command = "synthetic other command"; },
    rows => { rows[0]!.bindings = []; },
    rows => { rows[0]!.status = "partial"; },
  ];
  for (const mutate of mutations) {
    const rows: CoverageRow[] = JSON.parse(original);
    mutate(rows);
    await writeFile(join(generated, "coverage.json"), JSON.stringify(rows, null, 1) + "\n");
    await assert.rejects(assertFreshCoverage(tracked, generated), /coverage\.json/);
    assert.equal(await readFile(join(tracked, "coverage.json"), "utf8"), original);
  }
});

test("coverage freshness rejects missing, malformed and drifted artifacts by name", async t => {
  const { generated, assertFreshCoverage } = await fixture(t);
  for (const name of files) {
    const path = join(generated, name);
    const original = await readFile(path, "utf8");
    const pattern = new RegExp(name.replace(".", "\\."));
    await rm(path);
    await assert.rejects(assertFreshCoverage(tracked, generated), pattern);
    await writeFile(path, "synthetic invalid artifact");
    await assert.rejects(assertFreshCoverage(tracked, generated), pattern);
    await writeFile(path, original);
  }
  await assertFreshCoverage(tracked, generated);
});
