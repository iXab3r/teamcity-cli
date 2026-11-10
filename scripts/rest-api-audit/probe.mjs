/**
 * Reach the declared leaves that the offline suite never drives to the transport.
 * Run with the observer preloaded; synthetic profile, memory secrets and MSW only.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const root = process.cwd();
const capture = resolve(process.argv[2] ?? '.workspace/workstreams/rest-api-coverage-audit');
const { teamCityDefinition } = await import(`file://${root}/dist/src/cli.js`);
const { createTestRuntime } = await import(`file://${root}/dist/tests/support.js`);
const leaves = [];
(function walk(nodes, prefix) {
  for (const node of nodes) {
    if (node.children) walk(node.children, [...prefix, node.name.split(' ')[0]]);
    else if (node.run) leaves.push({ command: [...prefix, node.name].join(' '), node });
  }
})(teamCityDefinition().commands, []);
const observed = new Set((await readFile(resolve(capture, 'test-requests.ndjson'), 'utf8')).trim().split('\n')
  .map(line => JSON.parse(line).leaf?.command).filter(Boolean));
const cleanup = [];
const runtime = await createTestRuntime({ after: fn => cleanup.push(fn) }, {
  profiles: [{ name: 'default', url: 'https://audit.example.test', permissions: ['ReadOnly', 'Update', 'Admin', 'Credentials'] }],
  tokens: { default: 'synthetic-audit-token' },
});
const server = setupServer(http.all('*', () => HttpResponse.json({ id: 1, name: 'synthetic' })));
server.listen({ onUnhandledRequest: 'error' });
await writeFile(resolve(capture, 'probe-requests.ndjson'), '');
const results = [];
try {
  const cli = runtime.createCli();
  for (const { command, node } of leaves.filter(leaf => !observed.has(leaf.command))) {
    // A numeric token satisfies both integer and text identities.
    const argv = command.split(' ').map(token => /^[<[]/.test(token) ? '1' : token);
    for (const option of node.options ?? []) if (option.required) argv.push(option.flags.split(' ')[0], 'synthetic');
    let error = null;
    try { await cli.execute(argv); } catch (cause) { error = cause.code ?? cause.name; }
    results.push({ command, error });
  }
} finally {
  server.close();
  for (const fn of cleanup.reverse()) await fn();
}
await writeFile(resolve(capture, 'probe.json'), JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results));
