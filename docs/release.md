# Build and staged npm releases

This product independently releases **@eyeauras/teamcity-cli**, executable `teamcity-cli`.
It consumes an exact published Core pin and never publishes Factory packages. .NET 10,
Node 22+ and pinned `packageManager` npm are required; TeamCity uses `node:24-bookworm`.
The Cake driver is adapted from pinned nexus-cli/opensearch-cli; see [build/NOTICE](../build/NOTICE).

## Current migration gate

Candidate **0.7.1** pins Core **0.7.1** for the merged broken-pipe guarantee. That Core patch
has not yet been published. The lock binds the locally packed Core candidate's integrity to its
future registry URL; this is preparation, **not** successful clean registry-based adoption.
After parent-reviewed Factory merge, exact Core staging and owner approval, download the
published archive, compare integrity with the lock, update instruction links to its verified
release revision, and run a clean `npm ci`/Verify/Pack/DryRun. Any byte difference requires an
explicit reviewed lock update. Local tarball rehearsals are not final acceptance evidence.
No workspace/file dependency belongs in this package or its final lock.

New TeamCity project `EyeAuras_TeamCityCli`, anonymous main root
`EyeAuras_TeamCityCli_Repo` and quota-one `teamcity-cli-release` resource exist. The project is
**archived**. Native job copying was rejected with HTTP 403 on the first Verify copy; no
protected-token copies or jobs were created. The local Credentials gate was restored disabled.
Do not resolve credentials, widen token permissions or treat invalid configuration as an
approval gate. Parent owns access diagnosis, review and cutover.

## Local driver

```sh
npm ci
npm test
npm run test:package
dotnet run --project build -- --target Verify
dotnet run --project build -- --target SetVersion --release-version 0.7.1
RELEASE_REVISION=$(git rev-parse HEAD) dotnet run --project build -- --target DryRun --release-version 0.7.1 --dry-run
```

Verify runs clean dependency installation, offline mocked tests, installed-package smoke and
release-safety tests. Pack also performs Verify, packs this product, records source/SHA-1/SHA-512
in `output/release/release-manifest.json` and tests those exact archive bytes. `npm run
test:package -- --tarball /absolute/archive.tgz` checks an existing archive; `npm run test:registry
-- 0.7.1` checks the registry version. Installs use disposable prefixes/config/cache and synthetic
AppData/fetch/secrets, never real profiles. Core must resolve inside that prefix at the exact pin.
Tests, source, local proof and build tools are excluded from the product archive.

Every release target requires the full 40-character RELEASE_REVISION to match the checkout.
Live modes require a clean tree; Stage additionally requires current remote main. DryRun calls
only `npm publish --dry-run`. Stage and Release call only `npm stage publish`; Release with
`--dry-run` follows DryRun. `Stage --dry-run` rejects before staging. Cake `--dryrun` only prints
the task plan. `--exclusive` is a reviewed recovery mechanism, not fresh Verify/Pack evidence.

## TeamCity configuration to complete

| Object | Identity |
|---|---|
| Project under EyeAuras | `EyeAuras_TeamCityCli` (created, archived) |
| Public anonymous main root | `EyeAuras_TeamCityCli_Repo` (created) |
| Verify | `EyeAuras_TeamCityCli_Verify` (pending native copy) |
| Manual stage/registry verification | `EyeAuras_TeamCityCli_NpmStage` (pending native copy) |
| Exclusive shared resource | `teamcity-cli-release writeLock` (resource created) |

Use installed teamcity-cli 0.7.0+ and native server-side copies of
`EyeAuras_OpenSearchCli_Verify` / `EyeAuras_OpenSearchCli_NpmStage`. Keep the new project archived,
pause each copy immediately and disable its Verify trigger before configuration. Replace only
these copies' root attachments with the product root, set `RUNNER_1` script to `bash
build/teamcity.sh`, retain Linux/Docker rules, and replace the copied lock with this product's
writeLock. Verify's VCS filter must be `+:<default>`; stage has no triggers or upstream dependencies.
Set `env.RELEASE_MODE=--dry-run`, `env.RELEASE_REVISION` empty and a usable `release.build` label
(the reference job's build-number pattern needs it). Preserve protected npm.token,
`env.NPM_TOKEN=%npm.token%` and inherited protected `env.GITHUB_TOKEN` without resolving them.
Do not change shared VCS roots, unrelated jobs or token permissions.

Prove roots, lock, script, checkout and configuration validity before unpausing. Enable the
main-only trigger only after entrypoint merge and exact-head manual Verify. Bootstrap never
configures TeamCity. TeamCity is CI; no GitHub Actions or PowerShell infrastructure is added.
The wrapper admits named system/tool variables; Cake isolates ordinary children and private npm
configs. Only stage receives NPM_TOKEN; GitHub Release creation uses a private temporary header.
No secret appears in command args or artifact output. Temporary auth files are removed on exit.

After Core adoption, reviewed merge and CI setup, select exact main `<sha>`:

```text
teamcity-cli jobs run EyeAuras_TeamCityCli_Verify --wait --timeout 30m
teamcity-cli jobs run EyeAuras_TeamCityCli_NpmStage --param env.RELEASE_MODE=--dry-run --param env.RELEASE_REVISION=<sha> --param release.build=0.7.1-dry-run
teamcity-cli jobs run EyeAuras_TeamCityCli_NpmStage --param env.RELEASE_MODE=--stage --param env.RELEASE_REVISION=<sha> --param release.build=0.7.1-stage
# Only after owner npm approval:
teamcity-cli jobs run EyeAuras_TeamCityCli_NpmStage --param env.RELEASE_MODE=--verify-registry --param env.RELEASE_REVISION=<sha> --param release.build=0.7.1-verify
```

Omit --branch. RELEASE_REVISION guards the checkout; it does not select it. If main advances,
choose the original checkout revision in TeamCity custom settings for registry verification.

## Approval and recovery

DryRun writes `dry-run-verified`. Stage refuses an existing stage of this version, saves
`staged-unverified` with its stage ID **before** metadata/download verification, downloads that
stage and compares SHA-512, then writes `awaiting-2fa-approval`. Retain
`output/release/* => npm-release.zip`, including on failure. No stage exists until an authorized
successful run produces its durable receipt.

Only the owner approves that exact verified stage in npm Staged Packages with 2FA. Never approve
`staged-unverified`, `0.0.0-stage` or a different ID. VerifyRegistry first checks registry
version/latest/integrity and installed behavior, then creates GitHub Release `v0.7.1` at the packed
source commit with archive/manifest. Mismatching existing tags/assets fail; matching assets can be
retained and missing ones resumed. These are provenance records, not npm OIDC attestations.

After a lost response, inspect `npm stage list @eyeauras/teamcity-cli --json` before retrying.
On E403/E404 stop for owner access diagnosis; do not widen a token, disable 2FA, approve/reject a
stage or switch to direct publication. [Official npm staged-publishing reference](https://docs.npmjs.com/staged-publishing/).
