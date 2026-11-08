# Shared Core escalation boundary

> Locally owned instruction policy, adapted from the Core0.7.1 source snapshot.
> [Attribution, scope and manual updates](../policy-provenance.md). External citations are optional provenance/API references.
> Public-API code excerpts are illustrative source examples, not additional repository files or build steps.

This product owns service behavior and local instruction policy, not shared Core implementation.
Use this guide to identify a shared-runtime defect and prepare a separately authorized escalation.
All instructions needed for product work are local: [router](../../AGENTS.md),
[runtime contract](../DESIGN.md) and [testing](../testing.md). Opening external work is subject to
task authority; policy duplication does not authorize a runtime fork or dependency change.

External owning role: **factory-core maintainer**. These invariants bound escalation; they do not assign Core source paths to this product.

Use the local documents linked above for assessment.

- Keep this package unaware of any service domain.
- Preserve the recursive command model and automatic output formatting. A handler returns domain
  data; it must not branch on `--json`.
- Treat stdout as a protocol surface. In JSON-RPC mode only JSON-RPC frames may reach stdout.
- Own the shared error wrapping/presentation contract in
  [DESIGN](../DESIGN.md#cross-tool-redirect-and-diagnostic-policy): English context,
  preserved causes and stacks, and equivalent redacted human/JSON/RPC diagnostics.
- Keep profile files non-secret and versioned. Make writes atomic.
- Preserve the PoeShared-style `AppArguments` storage API and PascalCase public names. All
  profile-owned paths derive from `AppDataDirectory`; portable and executable-relative storage are
  forbidden. Resolve a fresh profile view per command so JSON-RPC requests cannot leak paths.
- Permission state is profile-specific safety configuration. Standard `ReadOnly` is enabled by
  default; `Update` is disabled. A gated CLI fails at startup when a service leaf has no category.
- Permission gates are defense-in-depth, not remote authorization. Never imply that enabling a
  local category grants rights on the service.
- Use the `SecretStore` interface in tests; the production default must fail rather than downgrade
  to plaintext storage.
- Public API changes require focused tests and an update to the local design when semantics
  change.
- Prefer a direct implementation over a new layer. Core earns abstractions through use by real
  integrations.

External Core implementation, tests and shared API/design updates belong to a separately authorized Factory task. That task owns its Core-plus-consumer verification; this product retains affected mocked tests and npm test. Do not run nonexistent Factory workspace commands here.
