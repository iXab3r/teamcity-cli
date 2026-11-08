# teamcity-cli — agent router

A standalone TeamCity CLI built on AI CLI Factory. Keep this entry point compact;
product behavior belongs in README/docs and scope in GitHub Issues.

## Framework baseline

This migration targets Core **0.7.1**, whose required runtime behavior is present at
`6b226682ef762dd49bd1c9d7eb8e7bf18e80acc8`. The source contract is pinned below; [release.md](docs/release.md)
records the pending registry adoption gate. Update these links to the verified Core release
revision at adoption. Do not claim the candidate published before registry verification.

Read the relevant pinned contracts before changing their surfaces:

- [Universal laws](https://github.com/iXab3r/EyeAuras.CliFactory/blob/6b226682ef762dd49bd1c9d7eb8e7bf18e80acc8/AGENTS.md)
- [Runtime and public API](https://github.com/iXab3r/EyeAuras.CliFactory/blob/6b226682ef762dd49bd1c9d7eb8e7bf18e80acc8/docs/DESIGN.md)
- [Integration authoring](https://github.com/iXab3r/EyeAuras.CliFactory/blob/6b226682ef762dd49bd1c9d7eb8e7bf18e80acc8/docs/integrations.md)
- [Offline tests and sanitization](https://github.com/iXab3r/EyeAuras.CliFactory/blob/6b226682ef762dd49bd1c9d7eb8e7bf18e80acc8/docs/testing.md)
- [CLI writer](https://github.com/iXab3r/EyeAuras.CliFactory/blob/6b226682ef762dd49bd1c9d7eb8e7bf18e80acc8/docs/roles/cli-writer.md) for every terminal-facing string

Framework laws apply here. Framework paths describe its ownership; this repository owns this
product's service client, DTOs, commands, authentication protocol, pagination and proof inventory.
Do not copy framework implementations. Use an exact npm Core pin and lock; no final workspace,
file or floating Git dependencies.

## Product rules

- Preserve `@eyeauras/teamcity-cli`, executable/application ID `teamcity-cli`, command names,
  profile paths, credential identity, permission categories and 0.7 pagination contracts.
- One declaration tree supplies human/JSON/persistent RPC. Handlers return data. Shared output,
  EPIPE handling, AppData, permissions and secret-store behavior belong to Core.
- All service tests are offline at native fetch/MSW with synthetic profiles and memory secrets.
  Local profile-backed proof is separate, fixed, bounded ReadOnly and refuses CI.
- No deployment addresses, private identities, credentials or unsanitized responses in source,
  tests, notes, issues, logs or release evidence. Inspect the full tracked tree and staged diff
  before every commit. Never force-push or rewrite pushed history.
- TeamCity owns CI: main-only Verify, Cake Frosting and `build/teamcity.sh`; no GitHub Actions.
  Manual release stages the tested tarball; only the owner approves the exact verified stage on npm
  with 2FA. Read [release.md](docs/release.md) before CI or release changes.
- IPC/Playwright are not product dependencies. Keep service semantics local and propose any common
  mechanism separately in Factory within the user's authorized scope.

## Delivery roles

GitHub Issues is the primary tracker. Use the owning integration role plus the relevant function:

- [GH issue dev](https://github.com/iXab3r/EyeAuras.CliFactory/blob/6b226682ef762dd49bd1c9d7eb8e7bf18e80acc8/docs/roles/gh-issue-dev.md) and [lifecycle](https://github.com/iXab3r/EyeAuras.CliFactory/blob/6b226682ef762dd49bd1c9d7eb8e7bf18e80acc8/docs/practices/github-issues.md)
- [Reconciliation Lead](https://github.com/iXab3r/EyeAuras.CliFactory/blob/6b226682ef762dd49bd1c9d7eb8e7bf18e80acc8/docs/roles/reconciliation-lead.md) and [workstreams](https://github.com/iXab3r/EyeAuras.CliFactory/blob/6b226682ef762dd49bd1c9d7eb8e7bf18e80acc8/docs/practices/workstreams.md) for bounded migrations/audits
- [Reviewer](https://github.com/iXab3r/EyeAuras.CliFactory/blob/6b226682ef762dd49bd1c9d7eb8e7bf18e80acc8/docs/roles/reviewer.md) and [independent review](https://github.com/iXab3r/EyeAuras.CliFactory/blob/6b226682ef762dd49bd1c9d7eb8e7bf18e80acc8/docs/practices/independent-review.md) for completed changes

New branches default to `bugfix/`. Transient coordination stays Git-ignored under
`.workspace/workstreams/<id>/` of this repository's verified absolute root. Partial PRs have no
closing keywords. Preserve deferred backlog; migration does not implement deferred operations.
Framework-wide official skill policy remains [Factory #29](https://github.com/iXab3r/EyeAuras.CliFactory/issues/29).
