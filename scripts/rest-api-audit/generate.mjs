/** Reconcile pinned official facts with CLI leaves observed at the transport in the offline suite. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const capture = resolve(process.argv[2] ?? '.workspace/workstreams/rest-api-coverage-audit');
const output = resolve(process.argv[3] ?? 'docs/rest-api-coverage/current');
const factsBytes = await readFile(new URL('../../docs/rest-api-coverage/official-operations.json', import.meta.url));
const facts = JSON.parse(factsBytes);
const lock = JSON.parse(await readFile(new URL('../../docs/rest-api-coverage/source-lock.json', import.meta.url), 'utf8'));
assert.equal(createHash('sha256').update(factsBytes).digest('hex'), lock.projectionSha256);
const trace = async (name, probe) => (await readFile(resolve(capture, name), 'utf8')).trim().split('\n').filter(Boolean).map(line => ({ ...JSON.parse(line), probe }));
// The probe only reaches declared leaves the suite never drives; it is binding evidence, not test evidence.
const observed = [...await trace('test-requests.ndjson', false), ...await trace('probe-requests.ndjson', true)];
const probed = JSON.parse(await readFile(resolve(capture, 'probe.json'), 'utf8'));
// Query controls fed by a differently named option or argument of the bound leaf.
const explicitControls = {
  'GET /app/rest/buildTypes/{p1}/vcs/files/latest/archived{p2}': { name: '--archive-name <name>' },
  'GET /app/rest/builds/{p1}/artifacts/archived{p2}': { name: '--archive-name <name>' },
  'POST /app/rest/buildTypes/{p1}/move': { targetProjectId: '--project <id>' },
  'POST /app/rest/server/backup': { fileName: '<name>' },
};

// Full command paths come from the product's own exported declaration tree.
const { teamCityDefinition } = await import(`file://${root}/dist/src/cli.js`);
const leaves = [];
(function walk(nodes, prefix) {
  for (const node of nodes) {
    if (node.children) walk(node.children, [...prefix, node.name.split(' ')[0]]);
    else if (node.run) leaves.push({ command: [...prefix, node.name].join(' '), name: node.name, description: node.description,
      permission: node.permission, options: (node.options ?? []).map(option => option.flags) });
  }
})(teamCityDefinition().commands, []);
const leafByCommand = new Map(leaves.map(leaf => [leaf.command, leaf]));
assert.equal(leafByCommand.size, leaves.length, 'Duplicate command path.');

const escape = text => text.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
const matchers = facts.map(fact => ({ fact, literals: fact.swaggerPath.replace(/\{[^}]+\}/g, '').length,
  // A placeholder glued to a literal segment (files{path}, statusIcon{suffix}) is a free suffix.
  pattern: new RegExp('^' + fact.swaggerPath.split(/(\{[^}]+\})/).map((part, index, parts) =>
    !part.startsWith('{') ? escape(part) : (parts[index - 1] ?? '').endsWith('/') || (parts[index - 1] ?? '').endsWith(':') ? '[^/]+' : '.*').join('') + '$') }));
const rowsById = new Map(facts.map(fact => [fact.id, { leafCalls: [], directCalls: [] }]));
const unmatched = [];
// Only when no template matches: a final path placeholder may carry a nested file path.
const nested = matchers.filter(({ fact }) => /\/\{[^}]+\}$/.test(fact.swaggerPath)).map(({ fact, literals, pattern }) => ({ fact, literals,
  pattern: new RegExp(pattern.source.replace(/\[\^\/\]\+\$$/, '.+$')) }));
for (const call of observed) {
  const match = list => list.filter(({ fact, pattern }) => fact.method === call.method && pattern.test(call.path)).sort((a, b) => b.literals - a.literals);
  let candidates = match(matchers);
  if (!candidates.length) candidates = match(nested);
  if (!candidates.length) { unmatched.push(call.method + ' ' + call.path); continue; }
  const row = rowsById.get(candidates[0].fact.id);
  (call.leaf ? row.leafCalls : row.directCalls).push(call);
}
const testLocation = call => {
  const frame = call.frames.map(line => /\((tests\/[^:]+:\d+):\d+\)/.exec(line)?.[1]).find(Boolean);
  return frame ?? call.testFile;
};
const operationRows = facts.map(fact => {
  const { leafCalls, directCalls } = rowsById.get(fact.id);
  const commands = new Map();
  for (const call of leafCalls) {
    const leaf = leafByCommand.get(call.leaf.command);
    assert(leaf, 'Observed leaf is not in the declaration tree: ' + call.leaf.command);
    if (!commands.has(leaf.command)) commands.set(leaf.command, { command: leaf.command, permission: leaf.permission, options: leaf.options,
      clientMethod: /TeamCityClient\.(\w+) /.exec(call.frames.find(line => !/#/.test(line) && line.includes('src/client.ts')) ?? '')?.[1] ?? null });
  }
  const sent = {};
  for (const call of leafCalls) for (const [name, value] of Object.entries(call.query)) (sent[name] ??= new Set()).add(value);
  const bindings = [...commands.values()].sort((a, b) => a.command < b.command ? -1 : 1);
  const optionNames = new Set(bindings.flatMap(binding => binding.options).map(flags => flags.split(' ')[0].slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())));
  const query = fact.queryParameters.map(name => {
    // A declared option counts only when the suite shows it given while the parameter is on the wire.
    const wired = leafCalls.some(call => !call.probe && call.leaf.given.includes(name) && call.query[name] !== undefined);
    const control = explicitControls[fact.id]?.[name] ?? (optionNames.has(name) && wired ? 'same-named option' : null);
    // A locator is composed from typed options and arguments; no raw locator passthrough is claimed.
    const typedLocator = name === 'locator' && sent[name] !== undefined;
    return { name, wire: !sent[name] ? 'omitted' : sent[name].size > 1 ? 'varies' : 'fixed',
      callerControl: control ?? (typedLocator ? 'typed locator dimensions' : null) };
  });
  const unsupported = bindings.length ? query.filter(parameter => !parameter.callerControl).map(parameter => parameter.name) : [];
  const tests = [...new Set(leafCalls.filter(call => !call.probe).map(testLocation))].sort();
  const status = !bindings.length ? 'missing' : unsupported.length ? 'partial' : 'covered';
  return { ...fact, status,
    reason: status === 'missing' ? 'No shipped service leaf reaches this METHOD/path. Authentication checks and direct client calls in tests do not count.'
      : status === 'partial' ? 'The core action is shipped; documented query controls remain unavailable to the caller.'
      : 'The core action and documented query controls are exposed. This is operation coverage, not exhaustive payload, locator-dimension or version conformance.',
    bindings, query, unsupportedQueryParameters: unsupported,
    undocumentedSentQueryParameters: Object.keys(sent).filter(name => !fact.queryParameters.includes(name)).sort(),
    gateDiffersFromMethod: bindings.filter(binding => (binding.permission === 'ReadOnly') !== (fact.method === 'GET')).map(binding => binding.command + ' [' + binding.permission + ']'),
    verification: { existingOffline: !bindings.length ? 'no-shipped-leaf' : tests.length ? 'exercised-in-passing-suite' : 'evidence-gap',
      tests, nonLeafTransportTests: [...new Set(directCalls.map(testLocation))].sort(), liveService: 'not-run', independentReview: 'not-performed' },
  };
});
const statuses = ['covered', 'partial', 'missing'];
const count = rows => ({ total: rows.length, ...Object.fromEntries(statuses.map(status => [status, rows.filter(row => row.status === status).length])) });
const tally = names => Object.fromEntries(Object.entries(Object.groupBy(names, name => name)).map(([name, list]) => [name, list.length]).sort());
const bound = operationRows.filter(row => row.bindings.length);
const observedLeaves = new Set(bound.flatMap(row => row.bindings.map(binding => binding.command)));
const summary = { baselineHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), dateUTC: lock.retrievedDateUTC,
  ...count(operationRows), reached: bound.length,
  byPermission: Object.fromEntries(['ReadOnly', 'Update'].map(permission => [permission, count(operationRows.filter(row => row.permissionCategory === permission))])),
  byGroup: Object.fromEntries([...new Set(facts.map(fact => fact.group))].sort().map(group => [group, count(operationRows.filter(row => row.group === group))])),
  unsupportedByParameter: tally(bound.flatMap(row => row.unsupportedQueryParameters)),
  partialOnlyBecauseOfFields: bound.filter(row => row.unsupportedQueryParameters.join() === 'fields').length,
  verificationEvidenceGaps: bound.filter(row => row.verification.existingOffline === 'evidence-gap').map(row => row.id),
  nonLeafTransportOperations: operationRows.filter(row => !row.bindings.length && row.verification.nonLeafTransportTests.length).map(row => row.id),
  gateDiffersFromMethod: operationRows.filter(row => row.gateDiffersFromMethod.length).map(row => row.id),
  leaves: leaves.length, leafPermissions: tally(leaves.map(leaf => leaf.permission)), leavesReachingTransport: observedLeaves.size,
  localLeavesWithoutRequest: leaves.filter(leaf => !observedLeaves.has(leaf.command)).map(leaf => leaf.command),
  unmatchedObservedRequests: [...new Set(unmatched)].sort(),
};
assert.equal(summary.covered + summary.partial + summary.missing, summary.total);
assert.deepEqual(summary.unmatchedObservedRequests, []);
assert.deepEqual(probed.map(row => row.command).filter(command => !observedLeaves.has(command)).sort(), [...summary.localLeavesWithoutRequest].sort());
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'coverage.json'), JSON.stringify(operationRows, null, 1) + '\n');
await writeFile(resolve(output, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
const columns = ['id', 'group', 'permissionCategory', 'status', 'commands', 'clientMethods', 'unsupportedQueryParameters', 'verification', 'tests'];
await writeFile(resolve(output, 'coverage.tsv'), [columns, ...operationRows.map(row => [row.id, row.group, row.permissionCategory, row.status,
  row.bindings.map(binding => binding.command).join(';'), [...new Set(row.bindings.map(binding => binding.clientMethod))].join(';'),
  row.unsupportedQueryParameters.join(';'), row.verification.existingOffline, row.verification.tests.join(';')])].map(row => row.join('\t')).join('\n') + '\n');
console.log(JSON.stringify(summary, null, 2));
