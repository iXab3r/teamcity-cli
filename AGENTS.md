# teamcity-cli — agent router

A standalone TeamCity CLI built on AI CLI Factory. Keep this entry point compact;
product behavior belongs in README/docs and scope in GitHub Issues.

## Local instruction ownership and runtime boundary

This repository owns its agent policies. Required reading is entirely local and works offline.
The owner explicitly authorizes duplicated/adapted instruction text; this does not authorize copying
or forking framework runtime implementations. Core remains the exact existing npm dependency0.7.1.
Instruction updates are manual, intentional and reviewed independently of dependency upgrades;
there is no cross-repository auto-sync. Factory links are optional provenance, never required policy.

Read [universal laws](docs/universal-laws.md), [runtime contract](docs/DESIGN.md),
[authoring](docs/integrations.md), [testing](docs/testing.md), the [role index](docs/roles/README.md)
and [local completeness index](docs/agent-setup.md) for the surface you touch.
[Policy provenance and adaptations](docs/policy-provenance.md) record the original MIT source snapshot;
[the local release guide](docs/release.md) owns product release decisions.

## Route by owning surface

| Surface | Read and adopt |
|---|---|
| `src/**`, service DTOs, auth and commands | **Service integration author**: [domain guide](docs/roles/integration-author.md), [authoring path](docs/integrations.md), [product contract](docs/product-contract.md) and [README](README.md) |
| `tests/**`, synthetic fixtures, `scripts/*contract*`, packaged checks | Integration domain plus [testing/fixture policy](docs/testing.md) and the local tests/proof section below |
| `integration-tests/**` and explicitly authorized local proof | The same testing policy, [fixed proof runner](integration-tests/profile-proof.ts) and local proof instructions below; proof remains separate from offline tests/CI |
| `.github/ISSUE_TEMPLATE/**`, issues and PRs | GH issue dev and its lifecycle below; [local issue forms](docs/agent-setup.md#issue-intake) |
| `build/**`, `scripts/**`, docs and agent setup | Local repository tooling/docs owner: this router, [agent setup index](docs/agent-setup.md), relevant shared design/practice and [release guide](docs/release.md) |
| Shared Core runtime/API defect | External escalation: [Factory-core maintainer](docs/roles/core-escalation.md); propose separately within task authority, never implement/copy Core here |

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

| Function / trigger | Local role and practice |
|---|---|
| Issue intake through verified delivery | [GH issue dev](docs/roles/gh-issue-dev.md) + [practice](docs/practices/github-issues.md) |
| Read-only completed-change review | [Reviewer](docs/roles/reviewer.md) + [practice](docs/practices/independent-review.md) |
| Terminal help, errors, prompts, views and examples | [CLI writer](docs/roles/cli-writer.md) |
| Migration, expansion or audit of a declared inventory | [Reconciliation Lead](docs/roles/reconciliation-lead.md) + [practice](docs/practices/workstreams.md) |
| An authorized story-based product increment | [Story Delivery Lead](docs/roles/story-delivery-lead.md) + [practice](docs/practices/story-driven-delivery.md) |

Broad API expansion also adopts the [integration authoring review practice](docs/practices/integration-authoring-reviews.md)
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
Official skill distribution is not implemented by this setup; it requires separately scoped product work.
