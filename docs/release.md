# Build and staged npm releases

This product independently releases **@eyeauras/teamcity-cli**, executable `teamcity-cli`.
It consumes an exact published Core pin and never publishes Factory packages. .NET 10,
Node 22+ and pinned `packageManager` npm are required; TeamCity uses `node:24-bookworm`.
The Cake driver is adapted from pinned nexus-cli/opensearch-cli; see [build/NOTICE](../build/NOTICE).

## Core dependency and product approval

Published product **0.8.0** and the **0.9.0** candidate pin published Core **0.7.1** at
[optional provenance: release revision bf79b80636bcdd790bbd6c25648842ae5213f267](https://github.com/iXab3r/EyeAuras.CliFactory/commit/bf79b80636bcdd790bbd6c25648842ae5213f267).
The owner approved Core's exact npm stage. Core VerifyRegistry build **33314** completed with a
`published-verified` receipt; npm's version/latest and SHA-512, installed Core behavior, and
[optional provenance: GitHub Release v0.7.1](https://github.com/iXab3r/EyeAuras.CliFactory/releases/tag/v0.7.1) were verified.
The independently downloaded npm, stage, CI and GitHub archives are byte-identical (SHA-1
`b075dc6eeef9a778d3d5317b24d7a36b50ea7632`). This product's exact dependency and lock integrity
already match; no local file/workspace reference or lock substitution is needed.

Each product release still requires clean registry-based `npm ci`/Verify/Pack/DryRun at its
reviewed revision, platform checks and its own verified npm stage. **Core approval does not
approve this product's publication.** Stage only from reviewed, clean current main; the owner
approves that exact verified product stage with 2FA. Pre-merge branch checks use Verify or DryRun.

## Next product version

The #156 change prepares product **0.9.0**, still pinned to Core **0.7.1**.
This version bump does not stage or publish a release. After merge, use 0.9.0 for all version
arguments and release labels below; the 0.7.1 approval record above remains historical evidence.

## Local driver

```sh
npm ci
npm test
npm run test:package
dotnet run --project build -- --target Verify
dotnet run --project build -- --target SetVersion --release-version 0.9.0
RELEASE_REVISION=$(git rev-parse HEAD) dotnet run --project build -- --target DryRun --release-version 0.9.0 --dry-run
```

Verify runs clean dependency installation, the offline mocked suite once through the
[REST coverage freshness gate](rest-api-coverage/README.md) (`npm run test:coverage`),
installed-package smoke and release-safety tests. The gate needs Node 24+ and a Git checkout;
the installed CLI keeps its Node 22+ engine. Pack also performs Verify, packs this product, records source/SHA-1/SHA-512
in `output/release/release-manifest.json` and tests those exact archive bytes. `npm run
test:package -- --tarball /absolute/archive.tgz` checks an existing archive; `npm run test:registry
-- 0.9.0` checks the registry version. Installs use disposable prefixes/config/cache and synthetic
AppData/fetch/secrets, never real profiles. Core must resolve inside that prefix at the exact pin.
Tests, source, local proof and build tools are excluded from the product archive.

Every release target requires the full 40-character RELEASE_REVISION to match the checkout.
Live modes require a clean tree; Stage additionally requires current remote main. DryRun calls
only `npm publish --dry-run`. Stage and Release call only `npm stage publish`; Release with
`--dry-run` follows DryRun. `Stage --dry-run` rejects before staging. Cake `--dryrun` only prints
the task plan. `--exclusive` is a reviewed recovery mechanism, not fresh Verify/Pack evidence.

## TeamCity configuration

| Object | Identity |
|---|---|
| Project under EyeAuras | `EyeAuras_TeamCityCli` (configured) |
| Public anonymous main root | `EyeAuras_TeamCityCli_Repo` (configured) |
| Verify | `EyeAuras_TeamCityCli_Verify` (configured) |
| Manual stage/registry verification | `EyeAuras_TeamCityCli_NpmStage` (configured) |
| Exclusive shared resource | `teamcity-cli-release writeLock` (quota one) |

The jobs were provisioned with installed teamcity-cli through native server-side copies of
`EyeAuras_OpenSearchCli_Verify` / `EyeAuras_OpenSearchCli_NpmStage`, preserving protected bindings
inside TeamCity. Copies were paused while the project was archived. Each job uses only
`EyeAuras_TeamCityCli_Repo`, one `RUNNER_1` executing `bash build/teamcity.sh` in
`node:24-bookworm` on Linux, and this product's exclusive staging lock.

The root defaults to `refs/heads/main`; its branch specification allows manual PR checks.
Verify's enabled VCS trigger uses `+:<default>` after successful verification of the merged main.
Staging has no triggers or upstream dependencies. Its default is
`env.RELEASE_MODE=--dry-run`, `env.RELEASE_REVISION` empty and `release.build=0.7.1`
(the copied number pattern needs a label). Native copy retains protected `npm.token`, the
`env.NPM_TOKEN=%npm.token%` reference and inherited protected `env.GITHUB_TOKEN` without reading
or resolving their values. The local Credentials gate is restored disabled after copying.
Both jobs and their project are active. Do not change shared VCS roots, unrelated jobs or token
permissions. Publication still requires owner approval of each verified npm stage.

When provisioning a replacement job, verify its root, lock, script, checkout and configuration
before activation. Enable its main-only trigger after exact-head manual Verify. Bootstrap never
configures TeamCity. TeamCity is CI; no GitHub Actions or PowerShell infrastructure is added.
The wrapper admits named system/tool variables; Cake isolates ordinary children and private npm
configs. Only stage receives NPM_TOKEN; GitHub Release creation uses a private temporary header.
No secret appears in command args or artifact output. Temporary auth files are removed on exit.

After reviewed merge and exact-head CI, select exact main `<sha>`:

```text
teamcity-cli jobs run EyeAuras_TeamCityCli_Verify --wait --timeout 30m
teamcity-cli jobs run EyeAuras_TeamCityCli_NpmStage --param env.RELEASE_MODE=--dry-run --param env.RELEASE_REVISION=<sha> --param release.build=0.9.0-dry-run
teamcity-cli jobs run EyeAuras_TeamCityCli_NpmStage --param env.RELEASE_MODE=--stage --param env.RELEASE_REVISION=<sha> --param release.build=0.9.0-stage
# Only after owner npm approval:
teamcity-cli jobs run EyeAuras_TeamCityCli_NpmStage --param env.RELEASE_MODE=--verify-registry --param env.RELEASE_REVISION=<sha> --param release.build=0.9.0-verify
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
version/latest/integrity and installed behavior, then creates GitHub Release `v0.9.0` at the packed
source commit with archive/manifest. Mismatching existing tags/assets fail; matching assets can be
retained and missing ones resumed. These are provenance records, not npm OIDC attestations.

After a lost response, inspect `npm stage list @eyeauras/teamcity-cli --json` before retrying.
On E403/E404 stop for owner access diagnosis; do not widen a token, disable 2FA, approve/reject a
stage or switch to direct publication. [optional API reference: Official npm staged-publishing reference](https://docs.npmjs.com/staged-publishing/).
