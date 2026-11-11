# Writing an integration

> Locally owned instruction policy, adapted from the Core0.7.1 source snapshot.
> [Attribution, scope and manual updates](policy-provenance.md). External citations are optional provenance/API references.
> Public-API code excerpts are illustrative source examples, not additional repository files or build steps.

This is the practical path from an API to an AI-friendly CLI. The canonical runtime contract
remains [`DESIGN.md`](DESIGN.md); fixture and real-service rules remain [`testing.md`](testing.md).

Every integration inherits the [cross-tool redirect and diagnostic policy](DESIGN.md#cross-tool-redirect-and-diagnostic-policy).
English is the standard tool language. Normal redirects work by default, and contextual error
wrappers retain causes and stacks for Core's shared presentation. HTTP clients use Core's
`fetchWithRedirects(fetch, url, init)` with the injected fetch. It owns redirect traversal and
credential scoping, without selecting service endpoints, bodies, decoding or retry policy.
Use `new CliError(message, { code, cause })` to add context; `diagnosticCause` supports other
Error subclasses and explicit secret values at lower-level boundaries. Do not copy redirect
loops, error printers or redaction glue into new integrations.

Profile URL normalization follows the [shared preservation contract](DESIGN.md#profiles-own-non-secret-configuration).
Use `parseServerUrl(value, message).href` for normalized HTTP(S) configuration; it retains explicit
default ports. Require primary evidence for additional service scheme/path restrictions. Never save a redirect destination or
a native URL serialization that loses the user's explicit port.

## Start with one definition and a standalone entry point

A normal CLI only needs Core. Define commands once; Core supplies help, profiles, human/JSON
output and JSON-RPC. Authentication, permission gates, IPC and a browser are explicit additions,
not prerequisites. A complete small example:

```ts
// src/cli.ts
import { command, type CliDefinition } from "@eyeauras/cli-factory";

export function createDefinition(): CliDefinition {
  return {
    name: "acme-cli",
    description: "Small example CLI",
    commands: [
      command("echo <text>", "Return the supplied text", ({ args }) => ({
        text: args.text,
      })),
    ],
  };
}
```

The standalone `src/bin.ts`:

```ts
#!/usr/bin/env node
import { createCli } from "@eyeauras/cli-factory";
import { createDefinition } from "./cli.js";

const app = createCli(createDefinition());
try {
  process.exitCode = await app.run();
} finally {
  await app.dispose();
}
```

The source-only example describes a hypothetical acme-cli echo/help/RPC surface, not commands
to add or run in this product. Use the real product README. Handlers return data; they do not
print JSON or select output formats.
Tests can use `createCli(createDefinition()).execute(argv)` and dispose their application afterward.

Use a factory so the same definition can run standalone, embedded, or in an optional IPC server.
Construction must be cheap: create lazy resource owners, not browser processes or network requests.
If your app owns long-lived resources, list them in `resources`; Core handles disposal and profile
invalidation. Do not write forwarding wrappers or use process-global current-profile state.
Add profile/auth/permission settings only when the service needs them; the sections below explain
each. This product uses the existing standalone entry point; optional upstream runners are not local setup.

## Product repository layout

This existing product already owns its standalone source, tests, fixtures and fixed proof runner.
Use [the command reference](reference.md), [shipped product contract](product-contract.md),
[local test/proof workflow](testing.md#product-workflow) and [release guide](release.md).
Install declared dependencies with npm ci; use the actual local npm build/test/package scripts.
Keep the exact Core dependency unchanged unless a task explicitly authorizes an upgrade.
Factory workspaces, bootstrap/submodule instructions and unpublished file dependencies are not
this product's build procedure. Examples below illustrate public API usage, not missing local files.

## Start with a vertical slice

Do not begin by mapping the entire REST API. Begin with the smallest path that proves access and
one useful read:

1. Sketch the command tree in user vocabulary, including the permission category of every leaf.
2. Define profile fields for connection identity and mark service prerequisites `required`:
   usually URL plus tenant, organization, or project when those values select a different realm.
3. Implement authentication and validate it with the cheapest identity/status endpoint.
4. Build the CLI, configure a real current-user profile, and call one high-value read-only endpoint
   through the packaged CLI process.
5. Add or extend the integration's explicit local profile-backed proof inventory.
6. Sanitize the response or derive a minimal fixture from official documentation.
7. Write a failing MSW test at the native `fetch` boundary.
8. Implement the client and command until the mocked test passes.
9. Re-run the local proof while debugging; add the next command by value, not API order.

Authentication is discovery infrastructure, not a reason to postpone tests. Its purpose in the
first slice is to reveal the real contract so deterministic mocks can take over the daily loop.

## Keep a local real-profile proof

Once the authentication skeleton works, an integration owns a separate development proof that
invokes its compiled executable with a required profile name. The profile comes from the current
user's normal AppData and the credential comes from the platform secret store; do not add test-only URL/token
inputs. This catches packaging, profile, authentication, command-tree, and rendering failures that a
direct client smoke cannot see.

The proof is not part of `npm test` and must refuse CI before it spawns the CLI. Its command inventory
is fixed in source, bounded, and exclusively `ReadOnly`; it never forwards arbitrary user argv or
trusts an enabled profile permission as its only safety boundary. It prints compact pass/count/skip
evidence instead of service payloads and never records fixtures automatically. See
[`testing.md`](testing.md) for the binding safety and evidence contract.

Reuse the existing public Core proof helpers. Any new shared proof mechanism needs separately
authorized Core work and evidence from another real integration; product policy copies are not runtime forks.

## Profiles: more than one connection

Use profiles whenever one CLI may talk to more than one URL, tenant, account, or environment. A
profile owns non-secret connection values; its credentials and permission choices are isolated by
the same profile name.

Do not compile a private, organization-specific, or merely convenient live endpoint into a public
integration. Declare prerequisites and let the common configurator own onboarding:

```ts
profile: {
  fields: [{
    name: "url",
    flags: "--url <url>",
    description: "Acme server URL",
    required: true,
  }],
},
```

The virtual `default` profile always exists, but may initially be incomplete. In a normal terminal,
running the CLI root or a service command prompts for missing required fields and authentication.
Automation configures the same state explicitly without prompts:

```text
acme-cli profile configure uat --url https://uat.example.com --token-stdin
acme-cli profile configure production --url https://example.com --token-stdin

acme-cli resources list --profile uat --json
acme-cli resources list --profile production --json
```

A field may supply an idempotent `normalize(value)` callback for new input. Core uses it for both
prompted values and profile create/set/configure flags, including execute/RPC. Use static errors;
do not interpolate the rejected value. `parseServerUrl(value, safeMessage)` handles basic base-URL
parsing and trailing slashes. Preserve deployment contexts instead of guessing forbidden API/page
segments. Any additional scheme/path rule needs primary contract evidence. The field description supplies prompt/help examples. For bearer authentication,
`tokenAuth({ tokenSource: "Account settings > Access Tokens", ... })` adds the token source to
Core's shared raw-token guidance and normalization. Arbitrary secrets do not use this helper.

`profile configure [name]` derives its options from the same profile-field declaration and reuses
the integration's auth validation before secure storage. `--token-stdin` is preferred for scripts.
JSON, JSON-RPC, non-TTY, and programmatic calls never ask questions: an incomplete service command
fails before its handler and reports the flags needed to configure the selected profile.

`profile create <name>` remains available for deliberately creating an incomplete or pre-seeded
profile. `profile set <name>` updates an existing profile and `profile set-default <name>` changes
the default. `profile delete <name>` removes a non-default profile and its stored authentication
credential; the default and final remaining profile cannot be deleted. `--profile <name>` selects
one connection for only that invocation—or for one `cli.execute` request inside a persistent
JSON-RPC session. This lets one long-lived process interleave UAT and Production commands without
sharing config or credentials.

If the service can host multiple logical resources behind one login, do not automatically make
each resource a profile. A profile represents a connection/security realm; ordinary command
arguments represent resources inside that realm.

## Profile-owned files through AppArguments

Every handler receives the familiar PoeShared-style `AppArguments` view for the selected profile:

```ts
import { join } from "node:path";

const snapshotPath = join(
  context.appArguments.AppDataDirectory,
  "snapshots",
  "latest.json",
);
const logDirectory = context.appArguments.LogDirectory();
```

Use these paths for integration-owned configuration, logs, caches, downloaded metadata, session
state, and other non-secret local files. `AppDataDirectory` already includes `AppName` and the
profile name; do not append the profile again. A command executed with `--profile production`
receives a different `AppDataDirectory` from the same command executed with `--profile uat`, even
inside one JSON-RPC process.

Do not derive application state from `process.cwd()`, the source checkout, the executable directory,
or a custom `--data-folder`. CliFactory CLIs are bound to the current OS user and are not portable.
For standalone credentials use `context.secrets` so the platform secret store and profile
namespace remain authoritative. Explicit browser auth snapshots and user-requested sensitive
videos are the narrow protected-AppData exceptions described in [DESIGN](DESIGN.md). Sanitized fixtures intended for Git remain in the existing product test sources; a dedicated fixture directory is not assumed.
runtime captures and unsanitized service data do not.

## Permission gates

Enable the gate on an agent-facing integration and classify every service leaf:

```ts
import { command, createCli, Permission, tokenAuth } from "@eyeauras/cli-factory";

const cli = createCli({
  name: "acme-cli",
  description: "Acme CLI",
  permissions: {},
  profile: {
    fields: [{
      name: "url",
      flags: "--url <url>",
      description: "API URL",
      required: true,
    }],
  },
  auth: tokenAuth({ env: "ACME_TOKEN", validate: validateToken }),
  commands: [
    command("resources", "Work with resources", [
      command("list", "List resources", listResources, {
        permission: Permission.ReadOnly,
      }),
      command("create <name>", "Create a resource", createResource, {
        permission: Permission.Update,
      }),
    ]),
  ],
});
```

The standard categories are:

| Category | Default | Use for |
|---|---:|---|
| `ReadOnly` | Enabled | list, get, status, search, download, inspect |
| `Update` | Disabled | create, trigger, cancel, comment, upload, edit, delete |

Add a custom category only when it communicates a materially useful boundary such as
`DeployProduction` or `ManageUsers`. Custom categories default to disabled unless the integration
explicitly says otherwise:

```ts
permissions: {
  categories: [{
    name: "DeployProduction",
    description: "Deploy releases to Production",
  }],
},
```

Users inspect and change the active profile's gate through the standard tree:

```text
acme-cli permissions list
acme-cli permissions grant Update
acme-cli permissions revoke Update
acme-cli permissions grant DeployProduction --profile production
```

Permission state is profile-specific. Granting `Update` in UAT does not grant it in Production.

When the input can require another category, retain the static permission and add
`additionalPermissions(input, {cwd, signal})`. Inspect the complete input locally and return the
extra declared category names, or `[]`. Core admits their conjunction before onboarding/authentication.
Keep the prepared snapshot in a command-local `WeakMap<CommandInput, PreparedInput>` and consume
that same snapshot in the handler. Core passes the same input object to both and prepares once even
when onboarding rechecks grants. Do not reread the input after admission. The resolver must not
contact services; it receives only the working directory and cancellation signal.
The gate is a deliberate fail-safe against accidental AI actions; it is not an authentication or
authorization system. The remote service must still enforce the user's real rights. An AI that is
explicitly instructed to grant a category can do so, so operator policy and review still matter.

When the gate is enabled, startup fails if any service leaf lacks a permission or names an unknown
category. Built-in `profile`, `auth`, and `permissions` commands remain available so a user can
recover configuration.

### Bind the profile-scoped client once

Most authenticated integrations should not repeat profile/secret-to-client plumbing in every
leaf. Bind that invocation-owned target once with Core, then keep each declaration focused on its
service operation:

```ts
import { targetCommands } from "@eyeauras/cli-factory";

const targets = targetCommands(async (context) => new AcmeClient({
  baseUrl: String(context.profile.values.url),
  token: await context.secrets.require("token"),
  fetch: context.fetch,
  signal: context.signal,
}));

const commands = [
  targets.read("list", "List resources", (client) => client.list()),
  targets.update("create <name>", "Create a resource", (client, { args }) =>
    client.create(args.name)),
  targets.gated("DeployProduction")(
    "deploy <id>", "Deploy a release", (client, { args }) => client.deploy(args.id),
  ),
];
```

Core resolves the target only after selecting and validating the profile and admitting the leaf's
permission. A denied command therefore never reads credentials or creates a client. Resolution is
fresh for every ordinary invocation and every request in a persistent JSON-RPC session; the binder
is not a client cache. Literal positional argument inference remains the same as with `command`.

Keep connection construction in the integration. If many operations later prove an identical
service dialect, add the smallest local declaration helper around these bound leaves. Do not move
paths, projections, paging, request bodies, response policy or service validation into Core.

### Present everyday commands well

Most leaves need nothing: the generic renderer prints any returned value. Give the few everyday
commands a declared view, help group and examples in the same declaration. Core renders them;
`--json` and JSON-RPC still return the unchanged value.

```ts
import { command, tableView } from "@eyeauras/cli-factory";

const releases = tableView<Release>({
  columns: [
    { header: "ID", value: (release) => release.id },
    { header: "TITLE", value: (release) => release.title, shrink: true },
    { header: "AGE", value: (release) => new Date(release.created), format: "age" },
  ],
  empty: "No releases found.",
});

command("releases", "Work with releases", [
  command("list", "List releases", listReleases, { view: releases, group: "Everyday" }),
], { examples: ["releases list"] });
```

Mark only descriptive text `shrink`, never an ID or a name that a command takes as an argument.
Use `recordView` for one object and its
`next` suggestions, which Core prints with the CLI name and selected profile, and `listView` for
names and identifiers one per line. Use `treeView` for a flat selection with `id`, `parent` and
`line` accessors; missing parents become roots without extra requests. Tables can also declare
`next` for follow-up commands. A view's title, footer and `next` callbacks receive the
context with the command's `input`, so a `null` result can still say `Removed tag 7 from DEMO-12`
and an offset adapter can express its service evidence in a footer. Each integration owns its end-evidence wording and continuation metadata.
A view's `when`
guard declines an invocation, for example one with an explicit field projection, and Core then
prints the generic shape. Service date formats stay in the integration: convert them to `Date`
in the accessor. Group a branch's children for help with `helpLayout`. See
[DESIGN.md](DESIGN.md#human-output-formats) for the formats.

### Report failed outcomes without losing data

When the point of a command is an outcome, throw a `CliError` on failure instead of returning
data that callers must inspect. Examples are waiting for a job or applying a batch.

```ts
throw new CliError("Release 42 failed.", {
  code: "release.failed", result: { release, outcome: "failed" }, next: [["releases", "logs", "42"]],
});
```

Core writes the `result` to stdout with the command's view and the message to stderr, and exits
with `exitCode` (default 1). JSON-RPC returns the result in `error.data`, and `execute` rejects
with the error. Use safe English context and preserve an underlying failure through `cause`;
the shared diagnostic policy defines rendering and redaction: a person sees the message, one
`Cause:` line and the `Next:` commands, and frames only with `--verbose`. Put the next step in
`next`, not in the sentence. A plain read of a failed object is not a failure.
Use `context.progress(message)` for occasional human-only status lines during long work.

The same `CliError`, or a subclass, gives any other failure a stable machine code. Throw Core's
`HttpError(status, message)` for an error status: it maps statuses to shared codes such as
`http.notFound` and suggests `auth login` for `401`. Core prints every failure as one JSON line on
stderr under `--json` and in JSON-RPC `error.data`. An untyped error still works: it gets the code
`error` and the person is told to re-run with `--verbose`. Write every sentence under the
[CLI writer](roles/cli-writer.md) role.

## Grow by useful phases

Use the **Reconciliation Lead** function role when an API expansion must close a declared
inventory. First make the GitHub feature Issue implementation-ready with its user outcome,
selected REST inventory, CLI mapping, permission category per leaf, explicit exclusions, and
acceptance criteria. Then open or reconcile a local Git-ignored workstream before broad implementation; each
phase needs a user outcome and an evidence gate. The Issue owns scope while the workstream owns
execution status. Do not use endpoint count as the ordering principle. See
[`practices/github-issues.md`](practices/github-issues.md).

A typical REST sequence is:

1. profiles + authentication + one identity call;
2. highest-value read-only resource tree;
3. operational reads, pagination, logs, or artifacts;
4. narrowly selected `Update` operations with explicit tests;
5. streaming, bulk work, or administrative surfaces only when consumers need them.

Product command guides document their shipped surface and permission boundaries.
Keep acceptance and checkpoint evidence in the owning product Issue/PR.

## Test the declaration, not a parallel implementation

Use `required: true` for HTTP-path selectors, confirmations and local-machine safety, not payload fields:

```ts
command("create <id>", "Create a resource", createResource, {
  permission: Permission.Update,
  options: [{ flags: "--confirm", description: "Confirm the operation", required: true }],
});
```

The parser owns missing-option validation and the generated `(required)` help hint; the same
behavior applies in JSON-RPC. A declared default satisfies the requirement. Primitive parsing and transport checks remain in the integration; TeamCity owns request semantics.
Use `targetCommands` for profile-scoped target binding and small local functions for proven service
repetition, such as a repeated resource-property tree. Do not promote HTTP or property
semantics into Core.
For expansion work, follow the [50-operation authoring review practice](practices/integration-authoring-reviews.md).

Use the small Core parser factories when an option needs decimal integer bounds or JSON syntax:

```ts
import { integerParser, jsonParser } from "@eyeauras/cli-factory";

const options = [
  {
    flags: "--count <number>", description: "Maximum results", defaultValue: 50,
    parse: integerParser({
      min: 1, max: 100, signed: false,
      errorMessage: "Count must be a decimal integer between 1 and 100.",
    }),
  },
  {
    flags: "--body <json>", description: "Supported service fields", required: true,
    parse: jsonParser("Body must be valid JSON."),
  },
];
```

Pass these options through the existing command settings. Keep defaults, bounds and signed syntax
service-owned; `signed: true` permits a minus, never a plus. Neither parser trims input, and numeric
parsing rejects decimals, exponents and unsafe values. Choose valid defaults: Commander does not
parse them. Use literal, non-secret error messages rather than interpolated input. JSON values are
`unknown`, so the service still validates objects, fields and null/omitted semantics. Repeat handling also remains local. Keep validation in directly callable clients.
The JSON parser returns `null` for the JSON literal `null`, but Commander's existing required-value
option handling converts a null callback result to `""`. Nested null fields and array items survive;
do not treat a top-level option value as proof of a validated JSON body.

For each command, prefer a test that runs the real client and, when useful, the real CLI command
tree against MSW. Assert:

- request method, path, locator/query, and required headers;
- the minimal parsed domain result;
- `--json` validity for an important CLI path;
- permission denial before the HTTP boundary for side-effecting commands;
- profile isolation when connection, secret, or permission behavior changes;
- absence of credentials and private data from errors and fixtures.

The default suite never calls the real service. Local proof is opt-in, uses the packaged CLI and
an explicit real current-user profile/secret store, and executes only a fixed bounded ReadOnly inventory.
It refuses CI. New sensitive/expensive reads do not automatically join that inventory.

### A shared offline fixture

Use the separate testing entry point for synthetic state and application ownership:

```ts
import { createCliFixture } from "@eyeauras/cli-factory/testing";

const fixture = await createCliFixture(t, {
  applicationId: "acme-cli",
  profiles: [{
    name: "default",
    values: { url: "https://acme.example.com" },
    secrets: { token: "synthetic-test-token" },
  }],
});
const app = fixture.createApplication(runtime =>
  createCli({ ...createDefinition(), runtime }),
);
const value = await fixture.json(app, ["resources", "list"]);
```

The test installs its own MSW handlers before invoking the app and independently asserts the
request and result. Omit `profiles` to test unconfigured onboarding, and declare permission changes
explicitly. The fixture does not assume token authentication; credential names belong to the
integration. Every created app is disposed before the fixture deletes its temporary AppData.
See [the testing guide](testing.md#shared-offline-cli-fixture) for invocation and cleanup details.
## Finite page traversal

Keep the endpoint, query encoding, DTOs and proof of completion in the integration.
Use one local collection adapter so each command author declares only its path, projection and
service options. Use the service's own wire continuation contract.
For a finite multi-request operation, use an ordinary service loop and Core's checked offset addition:

```ts
const items: Release[] = [];
let offset = start;
while (true) {
  connection.signal?.throwIfAborted();
  advanceOffset(offset, pageSize); // Validate each request window before dispatch.
  const rows = await readReleasePage(connection, { start: offset, pageSize });
  connection.signal?.throwIfAborted();
  if (rows.length === 0) return items; // Only if this service documents empty-page termination.
  for (const row of rows) items.push(row);
  if (items.length > maxResults) throw new Error("The selection exceeds --max-results.");
  offset = advanceOffset(offset, rows.length);
}
```

Import `advanceOffset` from Core. Validate caller options before acquiring a connection where
possible, and inside direct-library clients too. Keep the service position and loop local; check
cancellation before and after every awaited page step, including the final one, and pass the same
signal to each request. A continued step must advance its service position. Put these rules in
one local collection adapter so endpoint authors reuse its defaults and checks. For link/cursor
services prove progress using their actual continuation contract; never dispatch an arbitrary
credential-bearing link or split opaque cursor pages.
Do not infer end from a short page without evidence, add default ceilings/retries, or make list
commands discover write targets. Give complete selection an explicit caller result budget and
fail without partial success on overflow, unknown end or page failure. Keep native cursor commands
specialized when no finite traversal consumer exists.

Prove one page, two pages, exact budget plus end probe, server caps, empty continuation,
duplicate/no-ID policy, malformed/no-progress continuation, safe arithmetic, cancellation and later
failure through the HTTP boundary. Exercise human/JSON/execute/RPC, two profiles and denial before
credentials/network. Report source totals across Core and integrations separately from tests;
shared safety code is not automatically an endpoint-authoring reduction.

## Response consumption

Use Core's owning byte reader after service status handling:

```ts
import { readResponseBody } from "@eyeauras/cli-factory";

const bytes = await readResponseBody(response, { signal: context.signal });
const text = new TextDecoder().decode(bytes);
```

No fixed response ceiling is imposed. An optional `maxBytes` is reserved for explicit caller
budgets; do not copy arbitrary integration caps. Keep status, media, mutation semantics and
service validation local. The reader checks Content-Length syntax/identity completeness, owns
chunks, supports cancellation and releases its lock. Compressed wire length is not decoded size.
Decoding remains explicit: Buffer retains an initial BOM; TextDecoder removes it. No retry occurs.

### API-faithful validation

teamcity-cli forwards caller input for TeamCity to validate, including closed values, numeric
ranges and incomplete payloads. Omitted options are not sent. Native DTOs are accepted alongside
compact conveniences, preserving supplied fields. Remove refusal-only preflight reads; if metadata
is needed to build a body, preserve it when available and fall back to caller input on failure.

Validate JSON value types and representable numbers, encode identifiers and locator dimensions without
changing their values, and retain explicit permissions, profile isolation, read-side secret protection
and safe errors. Service writes forward caller input, including bearer text; aliases are optional.
Give each separate transport/security check its concrete reason: for example, dot segments
would change URL routing, and a download destination
must preserve existing local files. Local controls such as polling
duration and caller byte budgets are CLI behavior, not claims about service limits. Compact CLI forms
may translate flags or selectors into service DTOs; document that translation and preserve additional
native fields rather than silently discarding them. Output projections may omit private fields without
claiming that those fields are unsupported by the service. Exercise newly admitted values at the
offline HTTP boundary, including unchanged requests and safe remote rejection without retries.

## Native wire formats and private results

CLI output format is independent of REST media. A text/XML/multipart/binary service contract does
not require another help/JSON/RPC implementation: validate and project domain data in the integration,
then return it through the existing tree. A native void action can return acknowledgement only after
actual success; do not invent completion, atomicity or verified postconditions.

For files, keep filename, URL/auth, status/media, compressed wire-length, format and result policy in
the integration, then give Core ownership of the raw response and local publication:

```ts
const saved = await publishFile({
  cwd: context.cwd,
  name,
  maxBytes,
  signal: context.signal,
  openResponse: () => fetch(url, { signal: context.signal }),
  inspectResponse(response) {
    if (!response.ok || response.status === 206) {
      throw new FilePublicationError("Download failed or was partial.");
    }
  },
  validateFile: ({ path, prefix }) => validateNativeFile(path, prefix),
});
return { ...saved, contentType };
```

Both callbacks may be asynchronous and are awaited before Core continues past their gate. Callers
must use static, non-sensitive `FilePublicationError` messages in the two callbacks. Errors
from response acquisition, streaming, filesystem operations and abort reasons are sanitized.
Core computes `published` and `cleanupFailed`; do not construct those flags in callbacks.
Successful publication returns the real path, byte count and SHA-256 only after complete writes,
sync, exclusive no-overwrite linking, identity verification and safe staging cleanup. Do not open,
execute, extract or retry the result. Staged validation is read-only; Core rejects detected size,
modification-time or change-time mutations instead of publishing transformed bytes with stale metadata.
Core retains its exclusive staging handle through validation and publication, then closes it before
identity-checked path cleanup; a close failure retains staging for inspection.

The integration still validates its own basename convention. Optional byte budgets are caller-selected. Core also rejects path,
device and unsafe cross-platform basename forms. Staging is in a private fresh directory beside the output file. The parent must exist. Never call `privateDirectory` on
user-selected or AppData ancestor directories. Integrations retain their own format signatures, signed-URL, bearer-scoping and sanitized metadata rules. Credentials remain in Core's platform secret store; Windows stores only DPAPI ciphertext files.
Measure helper/security costs at every authoring checkpoint.

For text your command generates (an export, a result manifest), call
`saveFile({ cwd: context.cwd, name, output, content, signal })` instead of writing files yourself.
It uses the same staging and no-overwrite publisher. Downloads and exports default to the captured
invocation directory; optional `--output <path>` resolves relative paths against that directory.
Do not register arbitrary user outputs for profile cleanup. Existing profile downloads are untouched.

## Ready-for-review checklist

- The command tree reads naturally at every help level.
- Every handler returns domain data and contains no output-format branch.
- Profiles represent real connection realms and contain no secrets.
- Profile-owned files derive from `context.appArguments.AppDataDirectory`.
- Authentication validates before storing a credential.
- Every service leaf has the correct permission category.
- Side-effect tests prove the permission check happens before `fetch`.
- MSW covers the actual network boundary; fixtures are minimal and sanitized.
- Public docs name shipped behavior honestly; planned behavior is marked planned.
- Focused tests and `npm test` are green.
