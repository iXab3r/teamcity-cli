# Agent setup index

[AGENTS.md](../AGENTS.md) is the router. The [canonical role index](https://github.com/iXab3r/EyeAuras.CliFactory/blob/bf79b80636bcdd790bbd6c25648842ae5213f267/docs/roles/README.md)
and its relative links stay at the router's exact Core instruction pin. Canonical guides own policy;
this index owns local discovery and completeness, not a second copy of the rules.

## Owning domains

- **Service integration author** owns product source, DTOs, auth, command trees, tests and proof.
  Follow the explicit domain/authoring/testing links in the router, [product contract](product-contract.md)
  and [command guide](../README.md).
- **Repository tooling/docs owner** owns product build/scripts/docs/agent setup under the local router
  and relevant shared practice. Factory workspace/build examples are not local commands.
- **Factory-core maintainer** is external escalation for shared mechanisms; the router links its guide.
  Core implementation/test ownership stays in Factory. No local domain adapter or copied policy is needed.

## Function adapter coverage

Every canonical function is explicitly adopted by the router and has one thin local Claude adapter:

| Canonical function | Local adapter |
|---|---|
| GH issue dev | [gh-issue-dev](../.claude/agents/gh-issue-dev.md) |
| Reviewer | [reviewer](../.claude/agents/reviewer.md) |
| CLI writer | [cli-writer](../.claude/agents/cli-writer.md) |
| Reconciliation Lead | [reconciliation-lead](../.claude/agents/reconciliation-lead.md) |
| Story Delivery Lead | [story-delivery-lead](../.claude/agents/story-delivery-lead.md) |

The router links each role/practice directly: GitHub lifecycle, independent review, workstreams,
story-driven delivery and integration-authoring reviews (law 13). CLI writer has a role, not a
separate practice. Adapters select guides and harness tools; they do not copy policy. Reviewer
stays read-only. Other harnesses use the same Markdown router/guides without duplicate settings.
Adopting a role is distinct from spawning an agent; task authority governs delegation.

## Issue intake

The local [bug report](../.github/ISSUE_TEMPLATE/bug-report.md),
[feature/design form](../.github/ISSUE_TEMPLATE/feature-design.md) and
[chooser configuration](../.github/ISSUE_TEMPLATE/config.yml) preserve safe evidence, ownership,
acceptance and verification prompts from Factory. They are product intake forms, not copied role
policies. Story increments still follow Story Delivery Lead, including Given/When/Then scenarios,
API dependencies, owner-approved milestones and milestone closure. Installing these forms creates
no issues, labels or milestones; existing `bug` and `enhancement` labels are used.

## Story prerequisites

This setup does not supply or claim a generated complete service API inventory, pinned official
inventory source/generator, or an owner-approved story/dependency/milestone plan. Existing commands,
README and product contract are the shipped baseline, not a coverage census or new service-version
support policy. Before an authorized story-based increment, establish the real service's official
source/version/edition evidence, reproducible inventory mechanism, fixture rules and supported
scope in its owning issue, then satisfy the linked canonical planning/approval gates. Record gaps
honestly; do not invent a generator, compatibility promise or retroactive bootstrap quota.
Publishing an inventory/story backlog, live proof, CI changes and releases each need task authority.

## Keep discovery complete

When changing agent setup or the Core pin, compare the pinned Factory `AGENTS.md`,
`docs/roles/README.md`, `integrations/AGENTS.md`, `packages/core/AGENTS.md`,
`.github/ISSUE_TEMPLATE/` intake forms and chooser configuration,
all five `docs/roles/*.md` function guides and matching `.claude/agents/*.md`, and all five
`docs/practices/*.md` documents against the router and adapter table above. Re-enumerate rather
than assuming the function/practice count stays five. Classify each addition/removal by owning
surface and update this index, router and adapter set together; explain exclusions in the PR.

Follow every applicable instruction link, including relative links inside pinned guides, to its
actual file and heading. Check local README/product-contract/test/proof routes, all five roles,
all five practices, issue templates and adapter-to-router/domain reachability. Verify one exact Factory pin for
all canonical links; historical extraction provenance in migration docs is not a policy baseline.
Review changes to canonical Core guides in Factory, not by patching or copying them here.

Factory's optional IPC/browser/RANDOM setup and reference products' API specifications, inventory
generators, fixtures, story IDs, milestones and version/Depot policies are owned by those surfaces.
They are not prerequisites or entitlements for this standalone HTTP product. Do not transplant
reference-specific planning or floating/mismatched instruction pins. Keep product testing/fixture
and explicit local-proof workflows from the router; live proof remains opt-in and refuses CI.
