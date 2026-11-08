# Product-wide agent laws

> Locally owned instruction policy, adapted from the Core0.7.1 source snapshot.
> [Attribution, scope and manual updates](policy-provenance.md). External citations are optional provenance/API references.
> Public-API code excerpts are illustrative source examples, not additional repository files or build steps.

These laws apply to all product surfaces under [the router](../AGENTS.md).
The owner authorizes local instruction copies; shared runtime implementations remain external.

## Universal laws

1. **Do not overengineer.** Implement the smallest vertical slice demanded by a current consumer.
   No generator, plugin system, DI container, or universal HTTP layer without concrete evidence.
   New integrations describe their service, not factory internals. Reduce required author code
   and knowledge alongside reliability; common safety guarantees must not depend on copied glue.
2. **One command declaration.** Help, human output, JSON output, and JSON-RPC execution derive from
   the same recursive command tree. Handlers return data; they do not render formats.
3. **Credentials stay out of config and output.** Use the injected secret store for standalone
   secrets. Explicit browser auth state may persist in profile AppData per DESIGN.md; never log,
   snapshot or commit credentials. Explicit user-requested videos are sensitive artifacts under
   protected profile AppData per DESIGN.md, never fixtures. There is no silent storage fallback.
4. **Profiles isolate environments.** Endpoint/config and credential identity both include the
   active profile. Tests must cover any change that could cross profiles.
5. **AppData belongs to the current user and profile.** Derive profile-owned files from
   `AppArguments.AppDataDirectory`. Never add portable, executable-relative, or working-directory
   storage. Windows DPAPI encrypted secrets, declared browser auth state and explicitly requested
   sensitive videos are the file exceptions; profile JSON stays non-secret.
6. **Permission-gated means explicit.** When an integration enables permission gates, every
   service leaf declares a category. Read operations use `ReadOnly`; side effects use `Update` or
   a documented custom category. Never weaken a category merely to make a command pass.
7. **Mock the network boundary.** Default tests are offline and deterministic. Real-service proof
   is an explicit local-only packaged-CLI run through a real profile/secret store, uses a fixed bounded
   `ReadOnly` inventory, and never runs in CI. Sanitize evidence before it becomes a fixture.
8. **Keep service concepts in integrations.** Core must not know service terminology. Extract a
   shared mechanism only when another real integration proves it.
9. **Verify in proportion to risk.** Run the narrow affected tests during work and `npm test`
   before declaring a repository-wide change complete.
10. **Commit hygiene.** Never rewrite pushed history or force-push. Inspect staged changes for
   generated noise and run the pre-commit privacy gate before committing.
11. **Break cleanly.** This early-stage project has no backward-compatibility obligation. Do not
   retain legacy branches, compatibility shims, deprecated aliases, or parallel old/new paths.
   Replace the old contract and update all in-repo consumers, tests, and docs together. Document
   required user reconfiguration; never silently delete existing user data.
12. **Pre-commit privacy gate.** Before every commit, check both the full tracked tree and the
   staged diff, including code, docs, fixtures, scripts, and workstream records. Look for passwords,
   tokens, API/access/private keys, cookies, credential-bearing URLs, private/internal server
   addresses, personal data, and unsanitized service responses. Use clearly synthetic test values,
   never real credentials or private service data. Report suspicious locations without echoing
   sensitive values; unresolved findings block commit and push. Only explicit owner approval can
   permit specific non-secret metadata; it never permits credentials or unrelated new disclosures.
13. **Less authoring code, still simple.** API expansion workstreams declare a baseline and honor
   the authoring-review cadence (normally every 50 new operations). Review same-capability examples,
   total Core + integration code, and conceptual complexity—not just endpoint coverage or shorter
   handlers. Close the checkpoint before the next batch. Follow
   [integration authoring reviews](practices/integration-authoring-reviews.md).
14. **English is the standard tool language.** Authored help, prompts, errors, progress, labels
   and examples use English. Multilingual output is future work; service/user data keeps its language.
15. **One cross-tool behavior policy.** Every integration follows
   [redirect and diagnostic policy](DESIGN.md#cross-tool-redirect-and-diagnostic-policy).
   Normal HTTP redirects work by default. Wrap failures with useful context while preserving
   causes and stacks for `--verbose`; by default a person sees one explanation and one cause line.
   Redact secrets at output boundaries instead of erasing diagnostic evidence. Core owns common
   error presentation. New tools inherit these rules without separate approval.
16. **Preserve configured URLs.** Every CLI preserves supported scheme, host, context path and
   explicit port presence/value in saved/displayed profiles, including default ports. Follow
   [the profile URL contract](DESIGN.md#profiles-own-non-secret-configuration); native transport
   canonicalization and redirect destinations must not rewrite saved configuration.
17. **Write for the terminal.** Every tool-authored text — help, errors, hints, progress, prompts,
   views — follows the [CLI writer](roles/cli-writer.md) role: one idea per line, the next
   step as a `next` command, nothing said twice, diagnostics only under `--verbose`.
