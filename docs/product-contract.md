# Preserved product contract

The [command reference](reference.md) is the full shipped command guide; [README](../README.md) is the short overview. This extraction preserves
the 0.7 paging contract and Core output guarantees under
[the pinned Core 0.7.1 contract](DESIGN.md).
Historical extraction provenance remains in [migration](migration.md).

## Reading configuration values

Read commands return plain values supplied by TeamCity, including scripts and unknown plugin,
requirement, trigger, dependency, VCS and agent properties. Password-type parameters, `secure:`
properties and values withheld by the server remain redacted. Read policy does not use
credential-name or value heuristics. Writes forward caller input without secrecy heuristics or
protected-metadata refusals; TeamCity validates it. Input-secret aliases are optional alongside direct values.
Literal `*` and `*****` values are readable unless TeamCity marks their property as protected.
`jobs configuration show` and `projects templates show` preserve native configuration/type metadata,
including build settings, while `agents parameters list` reads system/env/config parameters.
Explicit native projections also remove values when returned property metadata marks them secret.

## Field projections

Every response-returning leaf accepts `--fields`, except native-file downloads and secret-only
`--store-as` workflows. Local credential leaves have no server response. Explicit projections are sent
unchanged as `fields` where the endpoint accepts that query parameter; elsewhere the option only
selects the native body. Native JSON or text uses the generic human view. Paged lists project one item and retain their existing envelope,
locator and paging; single reads and unpaged scoped lists project the whole response.
Omitted options preserve default projections, shaping and views. Everything an option does not
control retains default-path parity: validation, permissions, confirmations, errors, exit status,
empty or malformed bodies and unknown mutation outcomes. Lost mutation responses are never retried
automatically. Empty and blank text controls pass through unchanged; boolean controls accept only literal `true` or `false`.

Build lists compose `nextHref,build(<projection>)`; latest-build lookup keeps `build(<projection>)`.
Artifact list/children compose `count,file(<projection>)` and retain `{count,items,hasMore}`,
count+1 lookahead and hasMore rules; offset lists retain `nextStart`. Job, server and VCS-instance
file lists retain `{count,items}` without lookahead. Explicit items gain no default-view or
follow-up-hint fields. Project lists retain their tree view by default.
Client projections return opaque `NativeJson` (`unknown`), including list items; callers must
validate before accessing shaped properties. Default calls retain their result types.

Credential masking covers literal, percent-encoded (either hex case) and JSON-escaped credentials
through three nested decoding rounds, in keys and string values on success and partial errors.
Literal matches are replaced in place; decoded matches redact the whole original string.
Base64, hexadecimal dumps, hashes and credentials split across fields are outside this scope.
Partial-failure detection runs before masking and retains existing error codes and native results:
include `errorCount` for `batch.partial`, `errors(item)` for build set-status, and
`vcsLabel(status)` for VCS labels. Without these fields the native body returns exit 0 without a
partial-failure claim; native `null` passes through.

`jobs run` returns the native queue response with fields; projections need not include an ID.
`jobs run --wait` and `builds wait` keep fixed observation fields, then fetch the requested native
build after completion. `builds diagnose` projects its build and each problem/test item within the
same limits (10 problems, 20 failed tests), retaining section status and partial-failure handling.
Password metadata reads and secret-storage workflows retain their fixed projections. Other options
affect only their direct request leaves.

Successful empty bodies keep acknowledgements. Without fields, acknowledgement setters/deletes/actions
retain their summaries even when a body arrives; with fields they return native JSON or nonempty text.
Build cancel, set-status, problem-occurrences add, vcs-labels add, pin set, start-agentless,
queue approval approve/reorder/position set, and role mutations retain JSON-decoding errors on
empty success. Batch empty/malformed handling remains unchanged.

Token creation retains Credentials permission and stores a returned value under the requested alias;
if fields omit it, nothing is stored. `users show <id>` defaults to `id,username,name`, matching a
safe list item, and missing users return `http.notFound`. License keys accept direct values or local aliases.
Default parameter, VCS and feature property projections return the values TeamCity returns; only
password-typed, `secure:` and server-withheld values are hidden.
REST plugin info retains its XML summary by default and falls back to the original text when the
attribute subset cannot be projected, without evaluating XML entities. Explicit fields request JSON.
SVG content is saved as returned, without regex validation or rendering. Resolved parameter text,
including an unchanged `%name%` expression or an empty value, is stored unchanged. Server paths and
metric values are returned without absolute-path or numeric-only response checks.
Download bounds, output paths and no-overwrite publication remain unchanged. Template optimization/inline flags and other service defaults are sent only when supplied.
Request DTOs preserve caller fields, including native property envelopes; compact forms are optional.
TeamCity validates service enums, ranges, mandatory payload fields and combinations. Empty collections
are forwarded. Refusal-only preflights are absent; password metadata reads preserve type when available
and fall back to caller input on failure. Primitive parsing, HTTP-path operands, unambiguous selectors,
permissions, confirmations, dot-segment rejection and local-machine safety remain enforced.
`--latest` retains finished, non-personal, all-branch selection; artifact lists retain archive recognition;
page limits/lookahead and avatar size 64 retain their paging and HTTP-target semantics.

HTTP failures include the first 4 KiB of the server response, decoded without a split UTF-8
character at the bound and with the profile credential masked. Diagnostic reading failures retain
the known HTTP status. Request bodies are not appended. Error codes, exit codes, mutation uncertainty
and Core 0.7.1 diagnostics remain unchanged. Malformed JSON still fails.

The [command reference](reference.md#native-projections-and-controls) lists projection families
and native controls from the shipped declaration tree.

## Paging

TeamCity retains `--limit 100 --start 0`: limit bounds retained rows across wire requests.
Its adapter requests one lookahead row, retains `lookupLimit` across sparse continuations, and
reads only numeric dimensions from `nextHref`; it never dispatches that URL. Missing continuation
after a short wire page proves the end. Malformed/nonprogressing continuation means unknown.
A later read failure throws `list.incomplete` with the previously read page and preserved cause;
cancellation remains cancellation. File lists, native scoped collections, diagnosis and scoped
page mutations retain their specialized contracts. No unpaged response implies a complete target set.


Each invocation keeps profile, endpoint, credentials and cancellation isolated. All continued
reads must progress; cancellation remains cancellation. No automatic read-to-write target expansion
is introduced. The 0.7.1 release requires published Core output-boundary handling: observed stdout
EPIPE returns quiet exit 141, while original command and cleanup failures remain failures.
