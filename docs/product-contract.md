# Preserved product contract

The [command reference](reference.md) is the full shipped command guide; [README](../README.md) is the short overview. This extraction preserves
the 0.7 paging contract and Core output guarantees under
[the pinned Core 0.7.1 contract](DESIGN.md).
Historical extraction provenance remains in [migration](migration.md).

## Field projections

Agent projections are available on `agents list` (item fields) and whole-response
`agents show`, `authorized show/set`, `enabled show/set`, `policy show/set`,
`compatible-jobs`, `incompatible-jobs`, `pool show/set`, and `types show`.
All four setters retain Update permission and their existing request bodies.


Source-change projections are available on `builds changes` (item fields) and
`changes show`, `attributes`, `duplicates`, `first-builds`, `parents`, and
`root-instance` (whole-response fields).


Tests and problems support item `--fields` on `tests list`, `problems list`,
`builds tests`, and `builds problems`; `tests show/occurrence` and
`problems show/occurrence` support whole-response fields. Occurrence reads require
`--build <id>`. `builds diagnose` retains its fixed projections.


`builds list` and both `builds show` selectors accept `--fields <projection>` as native TeamCity
item fields. An explicit projection returns native objects using the generic human view. Lists retain their
paging envelope and compose
`nextHref,build(<projection>)`; the latest selector keeps its single `build(<projection>)` lookup.
Blank projections fail locally. Omission preserves the default request, shaping and views.
`builds wait`, `builds diagnose` and `jobs run` retain their fixed projections.
Client calls with projections return opaque `NativeJson` (unknown) values, including native
list items; callers must validate them before accessing shaped properties. Default calls keep
their existing result types.

Masking covers the literal credential and its percent-encoded (either hex case) and JSON-escaped
forms up to three nested decoding rounds, in keys and string values on success and partial-error results.
Literal matches are replaced in place; a decoded match redacts the whole original string.
Other transformations (for example base64, hexadecimal dumps, hashes, or a credential split across fields)
are not detected.

The build evidence reads also accept whole-response `--fields`: `builds canceled-info`,
`builds pin show`, `builds statistics list`, `builds related-issues`, `builds artifact-changes`,
`builds output-parameters list`, `builds resulting-properties list`,
`builds problem-occurrences list`, `builds test-occurrences`, and `builds vcs-labels list`.
These unpaged reads return the native response object when a projection is supplied;
parameter values can therefore be selected explicitly. Omission keeps existing outputs.

`queue list` accepts item `--fields` and keeps its paging envelope and job/project filters.
`queue show`, `queue position show`, `queue approval show`, and `queue compatible-agents`
accept whole-response `--fields`. Explicit projections use native JSON and the generic view;
omission preserves existing requests and output.

Tag reads and build tag replacement accept unchanged, nonblank `--locator <locator>`.
Build tag add/replace and build/queue tag reads accept whole-response `--fields`; omission
keeps the public-name defaults. Explicit fields return native JSON and the generic view.
Build tag add retains its local acknowledgement for empty or non-JSON successful bodies.

Artifact `list` and `children` accept item `--fields`, composing `count,file(<projection>)`.
They keep `{count,items,hasMore}`, their existing locator, count+1 lookahead and hasMore rules.
Offset lists keep `{count,items,hasMore,nextStart}`. Explicit item projections contain no extra
fields for default views or follow-up hints; native items use the generic view. Unpaged object
reads and scoped lists project the whole response and return that native object.

Only `builds artifacts` enables native artifact controls: `--resolve-parameters <boolean>`
and `--log-build-usage <boolean>` on all five leaves (exact `true` or `false`),
`--base-path <path>` on list/children/archive, `--archive-name <name>` on archive, and
whole-response `--fields` on metadata. Omission preserves each existing request and output.
Archive name sets the server query `name`; output path, byte bounds and no-overwrite publication
retain their existing contracts. Other file families retain their current options and behavior.

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

Build actions (`builds cancel`, `set-status`, `log append`, `problem-occurrences add`,
`vcs-labels add`, `pin set`, `start-agentless`) accept `--fields <projection>` and
return native JSON with the generic view. Omission preserves requests and output.
Empty successful bodies retain each command's default behavior: log append returns its
acknowledgement; these other actions fail JSON decoding. Projections are never extended.
For partial-failure detection include `errors(item)` for set-status or
`vcsLabel(status)` for VCS labels. Present failures retain the existing error code and
native error result. Detection reads the native response before credential masking; the returned
result is masked afterwards. Absent detection fields return the native body with exit 0.

Batch `show`, `cancel`, `delete`, `comment set/clear`, `tags add/remove`, and `pin`
accept `--fields`. The native response retains its envelope. Include `errorCount`
to retain `batch.partial` detection; absent detection fields imply no claim about
partial failure. Empty or malformed responses retain default handling, and omitted
options preserve the default request body, permissions and output.

Queue mutations `approval approve`, `delete-page`, `reorder`, and `position set`
accept `--fields`; native responses retain their envelopes. `delete-page` retains
its acknowledgement for an empty success; the other three retain JSON decoding errors.
`jobs run --move-to-top <boolean>` and `queue approval approve --approve-all <boolean>`
require literal `true` or `false`. Omission preserves the existing query, including
`approveAll=false`; `jobs run` keeps its fixed response projection and wait workflow.
The wait and latest-build resolution workflows keep their required response fields;
projection options apply to their direct request leaves.

All new controls follow parity with the default path: validation, permissions,
confirmations, empty or malformed bodies, errors, exit status and unknown mutation
outcomes retain their existing rules. Build tag add, log append and queue delete-page keep their
acknowledgements for non-JSON success bodies. Native `null` has no partial-detection
fields and passes through. Lost mutation responses are never retried automatically.
