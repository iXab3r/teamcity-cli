# Preserved product contract

The [command reference](reference.md) is the full shipped command guide; [README](../README.md) is the short overview. This extraction preserves
the 0.7 paging contract and Core output guarantees under
[the pinned Core 0.7.1 contract](DESIGN.md).
Historical extraction provenance remains in [migration](migration.md).

## Field projections

Roles accept whole-response `--fields` on `list/show/create` and
`included add/remove` and `permissions add/remove`. Default shaping, Admin gates,
write bodies and JSON-decoding errors for empty successful mutations are preserved.

Groups accept whole-response `--fields` on `list/show/create`, `parents list/replace`,
and `properties list`. These unpaged lists retain their existing shaped arrays when
fields are omitted; explicit fields return the native response and generic view.

Users support item fields on list and whole-response fields on show/create/update,
groups list/show/replace/remove, permissions list, properties list and tokens list/create.
Explicit fields on account and token operations are unchanged passthrough with the
existing permission categories. Token creation stores a returned value under the
requested alias; a projection omitting it stores nothing. Omission preserves safe
identity/token shaping, existing bodies and acknowledgements. `users show <id>`
returns the same `id,username,name` shape as a default list item.

Project reads accept `--fields` on list/show, pools list, branches, default-value-sets,
deployments list/show, parent, and templates list/default show. Project list and branches
retain their paging envelopes; other scoped reads project the whole response.
Omission preserves the project tree view and all existing requests and shaping.
Project move, pool replacement, default template set/clear, template creation and
project job creation accept whole-response `--fields`. Move and default-template clear
retain their empty/non-JSON acknowledgements. Ordering show/set for jobs/projects accept
unchanged `--field`; omitted selectors keep their existing values. `jobs copy` retains
its fixed workflow projection.
Project parameters accept `--fields` on list/show/create/set/replace-all; project
features accept it on list/show/create/replace/replace-all. Both lists accept unchanged
`--locator`, and scoped projections select the whole response. Parameter write preflight
reads retain fixed fields; value/type/raw-type and delete/clear leaves stay unchanged.
Default parameter and feature shaping is preserved, including feature property names
without values.

Job `steps`, `features`, `triggers`, `agent-requirements`, `artifact-dependencies`
and `snapshot-dependencies` accept whole-response `--fields` on
`list/show/create/replace/replace-all`; steps and features also accept it on
`parameters list/replace`. Explicit projections reach TeamCity unchanged and use
native JSON and the generic human view. Omission preserves default array/object
shaping, requests, permissions and errors. Scalar settings, other sub-resources
and deletes retain their existing options and workflows.

Job `templates list/show/attach/replace-all` and
`vcs list/show/attach/replace/replace-all` accept whole-response `--fields`.
Unpaged lists and replacements return native response objects with explicit
fields; omission keeps their shaped arrays. Template `--optimize-settings`,
`--inline-settings`, confirmations, VCS checkout rules and write bodies retain
existing behavior. Detach, clear and checkout-rule sub-resources are unchanged.

Job `files list/children` accept item `--fields` and keep `{count,items}`, their
existing locator and default shaping, without lookahead. `metadata` projects the
whole response. All five file leaves accept `--resolve-parameters <boolean>`;
`list/children/archive` accept `--base-path`, and `archive` accepts `--archive-name`
(server query `name`). Omitted controls preserve requests and output. Download
bounds and no-overwrite rules remain unchanged; other file families keep their options.

Job `parameters` and `output-parameters` accept whole-response `--fields`
on `list`, `show`, `create`, `set`, and `replace-all`. Lists also accept native
`--locator`. Mutations keep fixed preflight projections; explicit fields select
the write response. Part leaves and `set-password` retain their existing workflows.

Jobs `list` and `branches` accept item `--fields`; `show`, `builds`,
`investigations`, `vcs-instances`, and `create` accept whole-response fields.
`aliases` and `tags` accept native `--field <name>` unchanged; their output
shaping is preserved. Omitting it retains the existing query, including tags’
`field=tag(name)`. Job creation retains its Update permission and body.

Deployment `deployments list` and `deployments instances list` accept item fields;
`deployments show`, `deployments instances show`, and `server rest-plugin` accept
whole-response fields. REST plugin info keeps its XML request/parser by default and
requests native JSON for explicit fields.

Cloud `images/instances/profiles list` accept item fields; their `show` commands
and `cloud instances start` accept whole-response fields. Image/instance selectors use
`--cloud-profile`, `--image`, and (for instance reads) `--instance`. Start retains its
acknowledgement for empty or non-JSON successful responses.

Pool projections are available on `pools list` and `pools agents list` (item fields),
and `pools show`, `pools projects list`, and `pools agents assign` (whole response).

Investigations and mutes accept item `--fields` on `investigations list` and `mutes list`,
and whole-response fields on `investigations show/create/create-many/replace` and
`mutes show/create/create-many/delete-many`. Bulk unmute keeps its fixed preflight reads;
fields select only the DELETE response. Empty or non-JSON delete responses retain the acknowledgement.

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

Versioned settings projections cover affected projects, configuration (including effective
configuration and replacement), status and load results. Scoped responses project the whole
response; omission preserves existing shaping. Credentials workflows remain unchanged.

VCS root projections preserve paged list envelopes and project whole responses for
scoped instance/property reads and writes. Default property projections remain names-only.

VCS instance projections cover list items, identity, properties, repository state and
change-check responses. File list/children projections preserve their existing count/items
envelope and locator; metadata projects the whole response. Base-path and archive-name
controls affect only their declared file operations. Change-check requestor and commit-hook
ok-on-nothing-found controls preserve existing omitted values and acknowledgement behavior.
