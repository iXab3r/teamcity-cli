# Agent setup index

[AGENTS.md](../AGENTS.md) is the router; the [local role index](roles/README.md),
[universal laws](universal-laws.md) and [runtime contract](DESIGN.md) are locally owned policy.
All required reading is in this repository and works offline. The owner authorizes duplicated
instruction text. This does not permit framework implementation forks. [Provenance](policy-provenance.md)
records the MIT source snapshot; external links are optional history/API references only.

## Owning domains

- **Service integration author** owns product source, DTOs, auth, command trees, tests and proof.
  Follow the explicit domain/authoring/testing links in the router, [product contract](product-contract.md)
  and [command guide](../README.md).
- **Repository tooling/docs owner** owns product build/scripts/docs/agent setup under the local router
  and relevant shared practice. Factory workspace/build examples are not local commands.
- **Factory-core maintainer** is external escalation for shared mechanisms; the router links its guide.
  Core implementation/test ownership stays in Factory. The local Core-escalation guide defines this boundary; no Core implementation is vendored.

## Function adapter coverage

Every local function is explicitly adopted by the router and has one thin local Claude adapter:

| Canonical function | Local adapter |
|---|---|
| GH issue dev | [gh-issue-dev](../.claude/agents/gh-issue-dev.md) |
| Reviewer | [reviewer](../.claude/agents/reviewer.md) |
| CLI writer | [cli-writer](../.claude/agents/cli-writer.md) |
| Reconciliation Lead | [reconciliation-lead](../.claude/agents/reconciliation-lead.md) |
| Story Delivery Lead | [story-delivery-lead](../.claude/agents/story-delivery-lead.md) |

The router links each role/practice directly: GitHub lifecycle, independent review, workstreams,
story-driven delivery and integration-authoring reviews (law 13). CLI writer has a role, not a
separate practice. Adapters select guides and harness tools; policy bodies live in local documents. Reviewer
stays read-only. Other harnesses use the same Markdown router/guides without duplicate settings.
Adopting a role is distinct from spawning an agent; task authority governs delegation.

## Issue intake

The local [bug report](../.github/ISSUE_TEMPLATE/bug-report.md),
[feature/design form](../.github/ISSUE_TEMPLATE/feature-design.md) and
[chooser configuration](../.github/ISSUE_TEMPLATE/config.yml) preserve safe evidence, ownership,
acceptance and verification prompts from Factory. They route local product policies. Story increments still follow Story Delivery Lead, including Given/When/Then scenarios,
API dependencies, owner-approved milestones and milestone closure. Installing these forms creates
no issues, labels or milestones; existing `bug` and `enhancement` labels are used.

## Story prerequisites

This setup does not supply or claim a generated complete service API inventory, pinned official
inventory source/generator, or an owner-approved story/dependency/milestone plan. Existing commands,
README and product contract are the shipped baseline, not a coverage census or new service-version
support policy. Before an authorized story-based increment, establish the real service's official
source/version/edition evidence, reproducible inventory mechanism, fixture rules and supported
scope in its owning issue, then satisfy the linked local planning/approval gates. Record gaps
honestly; do not invent a generator, compatibility promise or retroactive bootstrap quota.
Publishing an inventory/story backlog, live proof, CI changes and releases each need task authority.

## Keep discovery complete

Run the [offline completeness check](../scripts/check-agent-setup.mjs) with
`node scripts/check-agent-setup.mjs` from any working directory. The local-only check verifies
an expected set, not just existing links: five function roles, five practices, five adapters,
three issue-template files, local domain/runtime/test/authoring contracts and product routes.
It rejects missing or extra entries, unreachable required policies, broken local file/heading links,
mandatory external policy links, unclassified bare external URLs and obsolete remote-policy instructions. Code-fence examples and
provenance paths are not claimed to be additional local source files.

When changing this setup, intentionally review the router, local policy/adapter/template inventories,
source-to-local scope decisions in policy-provenance.md and all transitive links. Keep Reviewer
read-only and owner/review/privacy/story gates intact. Update the expected set and local role index
in the same reviewed change if roles really change; never make the validator pass by deleting an
expected role or excluding a broken required link. Re-run negative omission/link checks when changing
the validator. No cross-repository auto-sync or required upstream comparison runs here.

Local policy updates and runtime dependency upgrades are separate deliberate tasks. Record any policy
exception with its scope, owner decision and verification. Keep the original source/version/license
attribution, but do not silently replace local policy with a newer remote document. Core defects
use the local escalation guide; runtime source remains outside this product.
