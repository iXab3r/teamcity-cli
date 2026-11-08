# teamcity-cli — agent router

A standalone TeamCity CLI built on AI CLI Factory. Keep this entry point compact;
product behavior belongs in README/docs and scope in GitHub Issues.

## Framework baseline

This product pins published Core **0.7.1** and its verified release revision
`bf79b80636bcdd790bbd6c25648842ae5213f267`. The registry archive matches the approved stage and GitHub Release;
[release.md](docs/release.md) describes independent product qualification and publication.
Keep every canonical instruction link aligned with this exact Core dependency.
The pinned [role index](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/roles/README.md) defines domain/function composition;
the local [agent setup index](docs/agent-setup.md) maps all adapters and maintenance obligations.

Read the relevant pinned contracts before changing their surfaces:

- [Universal laws](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/AGENTS.md)
- [Runtime and public API](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/DESIGN.md)
- [Integration authoring path](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/integrations.md)
- [Offline tests and sanitization](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/testing.md)
- [CLI writer](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/roles/cli-writer.md) for every terminal-facing string

Framework laws apply here. Framework paths describe its ownership; this repository owns this
product's service client, DTOs, commands, authentication protocol, pagination and proof inventory.
Do not copy framework implementations. Use an exact npm Core pin and lock; no final workspace,
file or floating Git dependencies.

## Route by owning surface

| Surface | Read and adopt |
|---|---|
| `src/**`, service DTOs, auth and commands | **Service integration author**: [domain guide](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/integrations/AGENTS.md), [authoring path](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/integrations.md), [product contract](docs/product-contract.md) and [README](README.md) |
| `tests/**`, synthetic fixtures, `scripts/*contract*`, packaged checks | Integration domain plus [testing/fixture policy](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/testing.md) and the local tests/proof section below |
| `integration-tests/**` and explicitly authorized local proof | The same testing policy, [fixed proof runner](integration-tests/profile-proof.ts) and local proof instructions below; proof remains separate from offline tests/CI |
| `build/**`, `scripts/**`, docs and agent setup | Local repository tooling/docs owner: this router, [agent setup index](docs/agent-setup.md), relevant shared design/practice and [release guide](docs/release.md) |
| Shared Core runtime/API defect | External escalation: [Factory-core maintainer](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/packages/core/AGENTS.md); propose separately within task authority, never implement/copy Core here |

Use [local test/fixture and proof instructions](README.md#tests-and-local-integration-proof) for this product.

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

## Function roles

GitHub Issues is the primary tracker. Adopt the owning domain above and each applicable function;
reading a role or installing an adapter does not spawn an agent or authorize remote actions.

| Function / trigger | Canonical role and practice |
|---|---|
| Issue intake through verified delivery | [GH issue dev](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/roles/gh-issue-dev.md) + [practice](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/practices/github-issues.md) |
| Read-only completed-change review | [Reviewer](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/roles/reviewer.md) + [practice](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/practices/independent-review.md) |
| Terminal help, errors, prompts, views and examples | [CLI writer](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/roles/cli-writer.md) |
| Migration, expansion or audit of a declared inventory | [Reconciliation Lead](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/roles/reconciliation-lead.md) + [practice](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/practices/workstreams.md) |
| An authorized story-based product increment | [Story Delivery Lead](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/roles/story-delivery-lead.md) + [practice](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/practices/story-driven-delivery.md) |

Broad API expansion also adopts the [integration authoring review practice](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/practices/integration-authoring-reviews.md)
from universal law 13: declare a baseline, normally review each 50 newly accepted operations and
the final shorter batch before continuing. Role composition does not multiply test runs.

Story Delivery Lead and its practice apply to authorized future story-based increments. This existing
product is not an empty-repository bootstrap: setup adoption does not retroactively replan shipped
commands, reopen deferred work, generate an API inventory, publish stories or create milestones.
Read [story prerequisites and current gaps](docs/agent-setup.md#story-prerequisites) before such work;
owner authorization and the practice's planning gates remain required.

New branches default to `bugfix/`. Transient coordination stays Git-ignored under
`.workspace/workstreams/<id>/` of this repository's verified absolute root. Partial PRs have no
closing keywords. Preserve deferred backlog; setup changes do not implement deferred operations.
Framework-wide official skill policy remains [Factory #29](https://github.com/iXab3r/EyeAuras.CliFactory/issues/29).
