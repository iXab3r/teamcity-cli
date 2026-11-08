# Preserved product contract

[README](../README.md) is the full shipped command guide. This extraction preserves
the 0.7 paging contract and Core output guarantees under
[the pinned Core 0.7.1 contract](DESIGN.md).
Historical extraction provenance remains in [migration](migration.md).

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
