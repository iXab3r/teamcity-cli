# Аудит публичного TeamCity REST API — 2026-11-10

Это frozen baseline продукта 0.7.1 на commit `20ba82a6b4540a354e950453e734a2ed298ef248`.
Файлы рядом (`coverage.json`, `coverage.tsv`, `summary.json`) сохраняют исходные цифры;
[текущее покрытие](current/summary.json) и [текущий mapping](current/coverage.json) публикуются
отдельно и проверяются командой `npm run test:coverage`.
Current status and scope: [0.8.0 candidate — 449/449 covered](current/README.md).

Baseline: **449 операций — 180 covered, 268 partial, 1 missing**. Полное покрытие по критерию ниже —
**40,09%**. Действие доступно хотя бы в основном варианте для **448/449 = 99,78%**. Эти проценты
отвечают на разные вопросы. Прежняя фраза README «449/449 (100%)» описывала только совпадение
маршрутов и не учитывала ни query controls, ни одну отсутствующую команду.

Аудит не меняет runtime, команды, зависимости, CI и версию. Независимое review не проводилось;
повторная генерация является self-check.

## Вселенная и provenance

Источник: [optional API reference: Swagger публичного сервера JetBrains TeamCity](https://teamcity.jetbrains.com/app/rest/swagger.json),
получен 2026-11-10: Swagger `2.0`, `info.version: 2026.1 (current)`, **268 paths / 449 METHOD+path
операций** (235 GET, 92 PUT, 62 POST, 60 DELETE). SHA-256 исходных bytes:

`f312f0054f5daf58747a46da2a8e19782a7a810be234ddf380c2e0f28168b728`

Это схема одного публичного развёртывания. Версия сервера пользователя не запрашивалась; ни версия
схемы, ни доступность маршрута не обещают совместимость со всеми выпусками или remote permissions.
Upstream URL изменяем. Источник закреплён датой и hash в [source-lock.json](source-lock.json) и
минимальной проекцией [official-operations.json](official-operations.json): метод, path, группа,
query-параметры, наличие body, media types. Raw capture остаётся в ignored `.workspace`. Второго
независимого источника множества (reference pages) этот baseline не сверял.

## Правила счёта и статусы

Один item = HTTP METHOD + path template. Имена placeholders заменяются по позиции на `{p1}`, `{p2}`.
Query и deployment context в identity не входят. Семантика: GET — ReadOnly, остальные методы —
Update; фактическая категория leaf (`ReadOnly`, `Update`, `Admin`, `Credentials`) записана в binding.

- **covered**: операция достигается shipped CLI leaf, и каждый документированный query-параметр
  управляется вызывающим через опцию или аргумент.
- **partial**: leaf достигает операцию, но хотя бы один документированный query-параметр вызывающему
  недоступен — он либо не отправляется, либо отправляется с зашитым значением.
- **missing**: ни один service leaf не достигает METHOD/path. Проверка авторизации и прямые вызовы
  клиента из тестов не считаются.

`locator` считается доступным, когда leaf отправляет его, собирая из типизированных опций и
аргументов (`typed locator dimensions`). Произвольный locator passthrough не заявляется, полнота
dimensions не измерялась. `fields` считается недоступным везде: проекции зашиты в клиент, опции
`--fields` нет ни у одной команды.

Отдельно от статуса записано `verification.existingOffline`: `exercised-in-passing-suite`, если
запрос наблюдался из leaf в проходящем offline-наборе, и `evidence-gap`, если leaf достиг transport
только в audit probe.

## Измеренные результаты

| Семантика | Всего | Covered | Partial | Missing |
|---|---:|---:|---:|---:|
| ReadOnly | 235 | 66 | 168 | 1 |
| Update | 214 | 114 | 100 | 0 |
| Итого | **449** | **180** | **268** | **1** |

Недоступные query-параметры по числу операций: `fields` 253, `basePath` 12, `resolveParameters` 10,
`locator` 9, `field` 6, `logBuildUsage` 5, `name` 4, по одной — `moveToTop`, `approveAll`,
`requestor`, `okOnNothingFound`, `addTimestamp` и шесть `include*` у backup.
**232 из 268 partial** являются partial только из-за `fields`; у остальных 36 есть и другие
недоступные controls.

- **Missing**: `GET /app/rest/users/{p1}`. Маршрут вызывается только как `users/current` при
  проверке авторизации; service leaf для чтения произвольного пользователя отсутствует.
- **Evidence gaps**: `projects show <id>`, `agents show <id>`, `builds changes <id>` достигают
  transport, но CLI-уровневого offline-теста запроса нет (есть клиентские тесты и live proof).
- 456 leaves, из них 452 достигают transport; 4 являются локальными credential workflows без HTTP.
- У 10 GET-операций есть вызывающий leaf с категорией строже ReadOnly (чтение перед записью или
  credential-операция); перечень — `gateDiffersFromMethod` в summary.

Полные строки всех 449 операций — в [coverage.json](coverage.json) и [coverage.tsv](coverage.tsv).

## Границы

Denominator — только пути этого Swagger. Вне него: UI/internal endpoints, плагины, GraphQL,
`/httpAuth` и `/guestAuth` как отдельные префиксы, а также payload/DTO-полнота, значения locator
dimensions и поведение конкретных версий сервера. Covered означает покрытие операции и её query
controls, а не всех полей и значений. Live proof не выполнялся.

## Доказательства

`observe-tests.mjs` на загрузке подменяет в скомпилированном продукте только две точки: обёртку
каждого leaf объявленного дерева (кто вызвал) и вход единственного transport-метода клиента (что
ушло). Handlers и Core runtime не меняются. Полный offline-набор — **696 passed, 0 failed** — дал
трассу запросов; `probe.mjs` отдельно исполнил семь leaves, которые набор до transport не доводит,
на synthetic profile, memory secrets и MSW. `generate.mjs` сопоставляет трассу с закреплёнными
фактами; несопоставленных запросов нет.

## Воспроизведение

```sh
npm ci --ignore-scripts
npm run test:coverage
```

Gate собирает продукт, прогоняет набор с трассировкой, probe, дважды генерирует mapping и
сравнивает его с `current/`; при расхождении падает и оставляет evidence в `.workspace/workstreams/`.
Требуется Node 24+ (synchronous `node:module.registerHooks`); это требование audit tools, а не CLI.

Осознанная регенерация после изменения команд:

```sh
W=.workspace/workstreams/rest-api-coverage-audit && mkdir -p $W && : > $W/test-requests.ndjson
npm run build
node --enable-source-maps --import ./scripts/rest-api-audit/observe-tests.mjs --test dist/tests/*.test.js
TEAMCITY_AUDIT_TRACE=probe-requests.ndjson node --enable-source-maps --import ./scripts/rest-api-audit/observe-tests.mjs scripts/rest-api-audit/probe.mjs
node scripts/rest-api-audit/generate.mjs
```

Проекция источника пересоздаётся из raw capture `raw/swagger.json` командой
`node scripts/rest-api-audit/extract.mjs`; новый upstream snapshot требует явно записанного нового
baseline.
