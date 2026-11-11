/** Observe the product transport and the executing CLI leaf while the offline suite runs. */
import { registerHooks } from 'node:module';
import { appendFileSync } from 'node:fs';
import { AsyncLocalStorage } from 'node:async_hooks';
import { pathToFileURL } from 'node:url';
const root = process.cwd().replaceAll('\\', '/');
const clientUrl = pathToFileURL(root + '/dist/src/client.js').href;
const cliUrl = pathToFileURL(root + '/dist/src/cli.js').href;
const capture = process.env.TEAMCITY_AUDIT_CAPTURE ?? root + '/.workspace/workstreams/rest-api-coverage-audit';
const leafScope = new AsyncLocalStorage();
Error.stackTraceLimit = 40;
// Wrap every leaf of the product's own declaration tree; handlers and Core runtime stay unchanged.
globalThis.__auditTree = definition => {
  const wrap = (nodes, prefix) => nodes.map(node => node.children
    ? { ...node, children: wrap(node.children, [...prefix, node.name.split(' ')[0]]) }
    : !node.run ? node : { ...node, run: (...args) => leafScope.run({ command: [...prefix, node.name].join(' '),
        permission: typeof node.permission === 'string' ? node.permission : null,
        options: (node.options ?? []).map(option => option.flags),
        given: Object.entries(args.find(value => value?.options)?.options ?? {}).filter(([, value]) => value !== undefined).map(([name]) => name).sort(),
      }, () => node.run(...args)) });
  return { ...definition, commands: wrap(definition.commands, []) };
};
globalThis.__auditRequest = (method, path, query, stack) => {
  const frames = stack.replaceAll('\\', '/').split('\n').filter(line => line.includes(root + '/src/') || line.includes(root + '/tests/')).map(line => line.replaceAll(root + '/', ''));
  appendFileSync(capture + '/' + (process.env.TEAMCITY_AUDIT_TRACE ?? 'test-requests.ndjson'), JSON.stringify({
    method, path, query, leaf: leafScope.getStore() ?? null, frames,
    testFile: process.argv[1]?.replaceAll('\\', '/').replace(root + '/dist/', '').replace(/\.js$/, '.ts'),
  }) + '\n');
};
const inject = (source, token, replacement) => {
  if (!source.includes(token)) throw new Error('Audit injection point changed: ' + token);
  return source.replace(token, replacement);
};
registerHooks({ load(url, context, next) {
  const result = next(url, context);
  if (url === clientUrl) {
    const token = 'async #response(method, path, query = {}, body, mediaType = "application/json", accept = mediaType) {';
    return { ...result, source: inject(String(result.source), token, token + ' globalThis.__auditRequest(method, path, query, new Error().stack);') };
  }
  if (url === cliUrl) {
    const token = 'return createCli(teamCityDefinition(runtime));';
    return { ...result, source: inject(String(result.source), token, 'return createCli(globalThis.__auditTree(teamCityDefinition(runtime)));') };
  }
  return result;
} });
