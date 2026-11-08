---
name: Feature or design
about: Specify a bounded, implementation-ready product change
title: "[Feature] "
labels: enhancement
assignees: ""
---

<!-- For a story-based increment, follow Story Delivery Lead from AGENTS.md: include Given/When/Then acceptance, API dependencies and an approved milestone. This generic form does not replace story planning or authorize it. -->

## Outcome

<!-- Describe the completed user or agent behavior, not the implementation activity. -->

## Baseline

<!-- What already exists and must be reused or preserved? -->

## Owning surface

<!-- this product, shared Core, or tooling/docs. Use existing labels/Project fields when suitable;
do not create metadata for this issue. Reassess ownership against the delivered scope before closure. -->

## In scope

<!-- State a bounded feature. For commands, include the exact contract below. -->

### CLI / API / permission contract

| CLI command | TeamCity HTTP method and endpoint | Locator, fields, or body | Permission | Returned domain value |
|---|---|---|---|---|

## Behavior contracts

<!-- Profiles/auth, pagination/limits, errors, JSON/JSON-RPC, and side-effect semantics. -->

## Out of scope

<!-- Name adjacent work that must not silently enter this change. -->

## Implementation shape

<!-- Expected code/test/docs surfaces and the smallest useful vertical-slice order. -->

## Test matrix

<!-- Mocked success/empty/error/pagination, CLI JSON, permission denial before fetch, profile isolation. -->

## Acceptance criteria

- [ ] The observable outcome is complete.
- [ ] Focused deterministic tests and `npm test` pass.
- [ ] Public documentation matches shipped behavior.
- [ ] CI and implementation evidence are linked before closure.
- [ ] Classification matches the delivered scope; any acceptance scope reduction has explicit owner agreement and linked follow-ups.

## References

<!-- Official API documentation, optional local workstream ID, dependencies, and follow-ups. Do not link ignored notes; keep acceptance evidence in this Issue/PR. -->

<!-- Follow AGENTS.md and docs/agent-setup.md. Story/milestone work closes only under the story-driven review and closure rules. -->
