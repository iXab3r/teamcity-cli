# Current REST coverage — 0.10.0 candidate

The current mapping covers **449 of 449 operations: 449 covered, 0 partial, 0 missing**.
This is the 0.10.0 candidate; the published product is 0.9.1.
Core remains exactly `@eyeauras/cli-factory` 0.7.1.

The pinned source is public JetBrains TeamCity Swagger 2.0,
`info.version: 2026.1 (current)`, captured 2026-11-10.
It contains 268 paths and 449 operations:
235 GET, 92 PUT, 62 POST and 60 DELETE.
Its SHA-256 is
`f312f0054f5daf58747a46da2a8e19782a7a810be234ddf380c2e0f28168b728`.

The frozen product 0.7.1 baseline (product commit `20ba82a`, audit committed as `599b1b2`) had
180 covered, 268 partial and 1 missing operation; 448 of 449 were reachable.
It had 456 service commands. Published 0.8.0 has 457 commands and already covers 449/449 operations.
The candidate has 460:
`users show <id>` remains available, with new job configuration, template and agent-parameter reads.
238 ReadOnly, 171 Update, 37 Admin and 14 Credentials.
Of these, 456 reach transport and 4 are local credential workflows without HTTP.
All 449 operations are issued by a command in the passing offline suite.

## Meaning and limits

Covered means a shipped command issues the operation and every documented query parameter
is caller-controlled. Evidence is a same-named option supplied and observed on the wire
in the offline suite, an explicit mapping in `scripts/rest-api-audit/generate.mjs`,
or a locator composed from typed options.

This does not measure payload fields, locator dimensions, server versions, editions
or remote permissions. Nothing was verified against a live server.
The [mapping](coverage.json) and [summary](summary.json) record the measured state;
the [baseline and rules](../README.md) preserve the original audit.

## Freshness and deliberate regeneration

`npm run test:coverage` runs inside Cake Verify. It regenerates the mapping and fails
when it differs from `docs/rest-api-coverage/current/`.
A passing gate therefore checks the committed mapping against current offline evidence.

To update intentionally, follow the “Осознанная регенерация” commands in the
[reproduction section](../README.md#воспроизведение).
Review the regenerated mapping and retain the 449/0/0 status for this candidate.

Response completeness is separate from this operation/query audit. The #156 regression suite fails
on 0.8.0 main (`c78863b`) and passes on 0.9.0 and later: scripts and ordinary
configuration values are returned while password/secure and server-withheld values stay hidden.
