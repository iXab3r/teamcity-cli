/** Offline freshness gate: actual leaves/tests versus the committed pinned operation mapping. */
import { readFile, mkdir, mkdtemp, realpath, readdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const root = await realpath(fileURLToPath(new URL('../../', import.meta.url)));
const artifacts = ['coverage.json', 'coverage.tsv', 'summary.json'];
async function artifact(directory, name) {
  try { return await readFile(join(directory, name)); }
  catch (cause) { throw new Error(`Cannot read REST coverage artifact: ${name}.`, { cause }); }
}
function summary(bytes) {
  try {
    const value = JSON.parse(bytes.toString('utf8'));
    if (!value || Array.isArray(value) || typeof value !== 'object' || !/^[0-9a-f]{40}$/.test(value.baselineHead ?? '')) throw new Error('Invalid lineage');
    const { baselineHead, ...facts } = value;
    return facts;
  } catch (cause) { throw new Error('Invalid REST coverage artifact: summary.json.', { cause }); }
}
export async function assertFreshCoverage(expected, actual) {
  for (const name of artifacts) {
    const [committed, generated] = await Promise.all([artifact(expected, name), artifact(actual, name)]);
    const equal = name === 'summary.json'
      ? isDeepStrictEqual(summary(committed), summary(generated))
      : committed.equals(generated);
    if (!equal) throw new Error(`Stale REST coverage: ${name}. Regenerate and review the current audit artifacts.`);
  }
}
function run(args, environment = process.env) {
  const result = spawnSync(process.execPath, args, { cwd: root, env: environment, stdio: 'inherit' });
  if (result.error || result.status !== 0) throw new Error('Offline REST coverage verification failed in a child check.', { cause: result.error });
}
async function verify() {
  if (process.argv.length !== 2) throw new Error('Use npm run test:coverage without arguments.');
  if (Number(process.versions.node.split('.')[0]) < 24) throw new Error('Repository coverage verification requires Node.js 24 or later.');
  const git = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: root, encoding: 'utf8' });
  if (git.status !== 0 || await realpath(git.stdout.trim()) !== root) throw new Error('Coverage verification requires this repository root.');
  const npm = process.env.npm_execpath;
  if (!npm) throw new Error('Run this check through npm run test:coverage.');
  let notes = root;
  for (const segment of ['.workspace', 'workstreams']) {
    notes = join(notes, segment); await mkdir(notes, { recursive: true }); notes = await realpath(notes);
    if (!notes.startsWith(root + sep)) throw new Error('Coverage evidence must stay inside the verified repository root.');
  }
  const scratch = await mkdtemp(join(notes, 'coverage-verify-'));
  try {
    const capture = join(scratch, 'capture'); await mkdir(capture);
    await writeFile(join(capture, 'test-requests.ndjson'), '');
    run([npm, 'run', 'build']);
    const tests = (await readdir(join(root, 'dist/tests'))).filter(name => name.endsWith('.test.js')).sort().map(name => join('dist/tests', name));
    const observer = ['--enable-source-maps', '--import', './scripts/rest-api-audit/observe-tests.mjs'];
    run([...observer, '--test', ...tests], { ...process.env, TEAMCITY_AUDIT_CAPTURE: capture });
    run([...observer, 'scripts/rest-api-audit/probe.mjs', capture], { ...process.env, TEAMCITY_AUDIT_CAPTURE: capture, TEAMCITY_AUDIT_TRACE: 'probe-requests.ndjson' });
    const generated = join(scratch, 'generated');
    const repeated = join(scratch, 'repeated');
    run(['scripts/rest-api-audit/generate.mjs', capture, generated]);
    run(['scripts/rest-api-audit/generate.mjs', capture, repeated]);
    // Repeat generation includes the exact same lineage; compare every byte here.
    for (const name of artifacts) if (!(await artifact(generated, name)).equals(await artifact(repeated, name))) {
      throw new Error(`Non-reproducible REST coverage: ${name}.`);
    }
    await assertFreshCoverage(join(root, 'docs/rest-api-coverage/current'), generated);
    console.log('Offline REST coverage is fresh; repeated generation matches the committed operation mapping.');
  } catch (error) {
    console.error(`Audit evidence retained at ${relative(root, scratch)}.`);
    throw error;
  }
  await rm(scratch, { recursive: true });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await verify(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
