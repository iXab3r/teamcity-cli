/** Project the pinned public Swagger document into minimal operation facts. */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const capture = resolve(process.argv[2] ?? '.workspace/workstreams/rest-api-coverage-audit');
const output = resolve(process.argv[3] ?? 'docs/rest-api-coverage');
const bytes = await readFile(resolve(capture, 'raw/swagger.json'));
const swagger = JSON.parse(bytes);
const methods = ['get', 'put', 'post', 'delete', 'patch', 'head', 'options'];
const canonical = path => { let index = 0; return path.replace(/\{[^}]+\}/g, () => `{p${++index}}`); };
const facts = [];
for (const [path, item] of Object.entries(swagger.paths)) {
  for (const method of methods) {
    const operation = item[method];
    if (!operation) continue;
    const parameters = [...(item.parameters ?? []), ...(operation.parameters ?? [])];
    facts.push({
      id: method.toUpperCase() + ' ' + canonical(path), method: method.toUpperCase(), path: canonical(path), swaggerPath: path,
      group: operation.tags?.join(',') ?? '', operationId: operation.operationId ?? null,
      summary: operation.summary ?? null, deprecated: operation.deprecated === true,
      permissionCategory: method === 'get' ? 'ReadOnly' : 'Update',
      queryParameters: parameters.filter(parameter => parameter.in === 'query').map(parameter => parameter.name),
      hasBody: parameters.some(parameter => parameter.in === 'body' || parameter.in === 'formData'),
      consumes: operation.consumes ?? [], produces: operation.produces ?? [],
    });
  }
}
facts.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
if (new Set(facts.map(fact => fact.id)).size !== facts.length) throw new Error('Duplicate operation identity.');
const projection = JSON.stringify(facts, null, 1) + '\n';
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'official-operations.json'), projection);
await writeFile(resolve(output, 'source-lock.json'), JSON.stringify({
  retrievedDateUTC: '2026-11-10',
  swagger: { url: 'https://teamcity.jetbrains.com/app/rest/swagger.json', sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length, swaggerVersion: swagger.swagger, infoVersion: swagger.info?.version,
    pathCount: Object.keys(swagger.paths).length, operationCount: facts.length },
  projectionSha256: createHash('sha256').update(projection).digest('hex'),
}, null, 2) + '\n');
console.log(facts.length);
