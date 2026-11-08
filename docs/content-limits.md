# Content and resource policy

> Locally owned instruction policy, adapted from the Core0.7.1 source snapshot.
> [Attribution, scope and manual updates](policy-provenance.md). External citations are optional provenance/API references.
> Public-API code excerpts are illustrative source examples, not additional repository files or build steps.

CLI Factory does not impose fixed local ceilings on user content, page sizes, selected items,
request/response bytes, downloads, browser state or pending work. Large operations may fail in
the operating system, runtime, filesystem or service; the CLI does not replace those real limits
with smaller arbitrary ones. Cancellation, Writable backpressure, explicit targeting, permissions,
profile isolation, path validation and transfer integrity remain part of the contract.

## Arguments and transports

Core's `validateArgv` checks an array of strings; there are no argument count, per-argument byte
or aggregate byte caps. The former `inputLimits` export is removed. JSON-RPC buffers one complete
request line without a byte ceiling and remains cancellable while waiting for EOF/newline.
Requests are executed sequentially and output backpressure delays reading the next request.

Core pending commands have no fixed item ceiling. Declared command concurrency expresses
application synchronization requirements; it is not a content-size limit. Optional upstream
IPC/protobuf/browser queue details are excluded source context, not product setup.

Native command-line launches remain subject to the OS argv limit. JSON-RPC stdin avoids that
particular limit; neither path can promise unlimited physical memory or successful remote execution.

## HTTP, files and browser state

`readResponseBody(response, { signal, maxBytes? })` replaces `readBoundedResponseBody`. Omission
of `maxBytes` means no local byte ceiling. An explicitly selected budget must be a positive safe
integer. Core continues to own response chunks, validate Content-Length syntax and identity-body
completeness, cancel/release readers, and avoid exposing raw failure causes.

`publishFile` likewise accepts an optional caller-selected byte budget without a fixed upper cap.
Identity Content-Length must match completed bytes. Encoded wire length is not decoded size.
No-clobber publication, private staging, hashes, path/device checks and cleanup ownership remain.
Local basename length caps/truncation have been removed; filesystem name/path limits apply.

Explicit caller timeouts/cancellation and startup/shutdown recovery deadlines remain supported;
optional browser/RANDOM procedure details do not apply to this standalone HTTP product.

## Selection, paging and validation

Service paging, complete-selection budgets, cursor semantics and end evidence belong in the
integration. Defaults are convenient defaults, not a cap on explicit requests. Do not add
recursive discovery or automatic list-to-write selection. The service validates native values.
Profile, category and AppData-name length checks are removed while
allowed characters, reserved names, exact profile lookup and case-collision rules remain intact.
The service can still reject requests; its published limits are not automatically copied as new
local ceilings. Product-specific paging/defaults and explicit budgets remain in product-contract.md.

## Constraints that are not content ceilings

- Finite/safe-integer representation, documented service numeric types and calendar values.
- Required values, supported request shapes, explicit-ID/duplicate checks and returned-page
  consistency against the caller's requested page size.
- Authentication, permission gates, origin restrictions, signed-URL handling and secret scrubbing.
- Safe path syntax, no traversal, reserved devices, private file permissions and ownership checks.
- Startup, shutdown and stale-owner recovery deadlines, and caller-selected timeouts/budgets.
- Fixed-size hashes/protocol markers and stream chunk sizes used for transfer efficiency.
- The local-only proof harness's deliberately fixed ReadOnly inventory, capture budgets and timeout.
  Proof limits do not constrain ordinary CLI operations.

## Upgrading

Independent products pin a compatible published Core exactly and own their upgrade/release cadence.
Library consumers replace the removed `readBoundedResponseBody` import with `readResponseBody`;
pass `maxBytes` only when an explicit caller budget is intended. No credentials or profile data
are migrated or deleted.
