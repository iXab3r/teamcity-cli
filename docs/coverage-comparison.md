# REST coverage comparison

How much of the published TeamCity REST API each tool can call. Measured 2026-11-10.

| Tool | Reachable operations | GET (235) | POST, PUT, DELETE (214) |
|---|---:|---:|---:|
| `teamcity-cli` 0.7.1 (this package) | 449 of 449 (100%) | 235 | 214 |
| `teamcity` 1.6.3 (JetBrains TeamCity CLI), dedicated commands | 75 of 449 (17%) | 41 | 34 |
| `bbox` 1.1.0 (similarweb) | 9 of 449 (2%) | 6 | 3 |
| `tctest` 1.3.5 (katbyte) | 6 of 449 (1%) | 4 | 2 |

## Tools considered

Every candidate found on 2026-11-10 by searching for TeamCity command-line clients on npm, PyPI, crates.io,
Go modules, Homebrew, NuGet tools and GitHub. Popularity is what the registry or GitHub showed
that day.

| Tool | Published where | Version and date | Popularity | In the matrix |
|---|---|---|---|---|
| `teamcity` (JetBrains/teamcity-cli), the vendor's CLI | GitHub releases, Go module, JetBrains Homebrew tap, npm `@jetbrains/teamcity-cli` (npm latest is 1.3.0, 2026-07-17) | 1.6.3, 2026-11-04 | 131 GitHub stars; 15,130 npm downloads a week | Measured |
| `tiulpin/teamcity-cli` | Go module path | 1.6.3, 2026-11-04 | same repository | No separate column: the repository moved to JetBrains/teamcity-cli; the old path redirects and resolves to the same release commit |
| `bbox` (similarweb/bbox) | GitHub releases, Docker image | 1.1.0, 2025-09-21 | 6 GitHub stars | Measured |
| `tctest` (katbyte/tctest) | GitHub releases, Go module | 1.3.5, 2026-10-20 | 16 GitHub stars | Measured |
| `teamcity-board` (dimorinny/teamcity-board), full-screen terminal dashboard of builds and agents | GitHub release | 0.1, 2016-11-27 | 2 GitHub stars | Not measured: below the top three |
| `tc` (MolotovTv/tc), runs and inspects deploy builds per environment | GitHub tags | 0.3.1, 2025-01-08 | 1 GitHub star | Not measured: below the top three |
| `teamcity-cli` (XyroG0d/teamcity-cli), build status and move-to-top | GitHub tags | 0.1.1, 2024-10-13 | 1 GitHub star | Not measured: below the top three |
| `teamcity-cli` on PyPI, read-only commands built on `pyteamcity` | PyPI (its source repository no longer exists) | 0.0.0, 2015-02-25 | 24 PyPI downloads in the last month | Not measured: below the top three |
| `furiousassault/tc-cli`, `amoisio/teamcity-cli-net`, `matrixd/teamcity-cli` | GitHub source only, no tag, release or package | none | 0 GitHub stars each | Not measured: no pinned published version |
| `dohq-teamcity`, `pyteamcity`, npm `teamcity-client`, JetBrains `teamcity-rest-client` | PyPI, npm, Maven | 1.0.10 (2025-06-11), 0.1.1 (2016-11-09), 1.0.12 (2018-02-16), Kotlin library | 36, 51, 12 and 79 GitHub stars | Not measured: libraries without a command-line tool |
| `@daghis/teamcity-mcp` | npm | 2.12.15, 2026-11-06 | 3,341 npm downloads a week | Not measured: an MCP server, not a CLI |

Selection rule: a tool is measured when it is a command-line client for the TeamCity REST API
(not a library, MCP server, IDE plugin or raw-request wrapper) that is published and fetchable at
a pinned version; when more than three qualify, the three with the strongest popularity signal
are taken, whatever they score.

## By API area

Percent of operations reachable, with the count in brackets.

| API area | Operations | teamcity-cli 0.7.1 | teamcity 1.6.3 | bbox 1.1.0 | tctest 1.3.5 |
|---|---:|---:|---:|---:|---:|
| Builds | 57 | 100% (57) | 18% (10) | 2% (1) | 7% (4) |
| Build queue | 15 | 100% (15) | 33% (5) | 13% (2) | 13% (2) |
| Build configurations | 109 | 100% (109) | 13% (14) | 1% (1) | 0% (0) |
| Projects | 48 | 100% (48) | 27% (13) | 4% (2) | 0% (0) |
| Versioned settings | 16 | 100% (16) | 19% (3) | 0% (0) | 0% (0) |
| VCS roots and instances | 31 | 100% (31) | 13% (4) | 10% (3) | 0% (0) |
| Changes, tests and problems | 18 | 100% (18) | 17% (3) | 0% (0) | 0% (0) |
| Investigations and mutes | 12 | 100% (12) | 0% (0) | 0% (0) | 0% (0) |
| Agents and agent pools | 30 | 100% (30) | 33% (10) | 0% (0) | 0% (0) |
| Cloud profiles, images, instances | 10 | 100% (10) | 90% (9) | 0% (0) | 0% (0) |
| Users, groups and roles | 56 | 100% (56) | 4% (2) | 0% (0) | 0% (0) |
| Server, nodes, audit and health | 38 | 100% (38) | 5% (2) | 0% (0) | 0% (0) |
| Deployment dashboards | 9 | 100% (9) | 0% (0) | 0% (0) | 0% (0) |
| **All operations** | **449** | **100% (449)** | **17% (75)** | **2% (9)** | **1% (6)** |

## By published resource group

Reachable operation counts. A group is the tag TeamCity gives the operation in its REST description.

| Resource group | Operations | teamcity-cli 0.7.1 | teamcity 1.6.3 | bbox 1.1.0 | tctest 1.3.5 |
|---|---:|---:|---:|---:|---:|
| `Agent` | 15 | 15 | 6 | 0 | 0 |
| `AgentPool` | 14 | 14 | 4 | 0 | 0 |
| `AgentType` | 1 | 1 | 0 | 0 | 0 |
| `Audit` | 2 | 2 | 0 | 0 | 0 |
| `Avatar` | 4 | 4 | 0 | 0 | 0 |
| `Build` | 57 | 57 | 10 | 1 | 4 |
| `BuildQueue` | 15 | 15 | 5 | 2 | 2 |
| `BuildType` | 109 | 109 | 14 | 1 | 0 |
| `Change` | 10 | 10 | 1 | 0 | 0 |
| `CloudInstance` | 10 | 10 | 9 | 0 | 0 |
| `DeploymentDashboard` | 9 | 9 | 0 | 0 | 0 |
| `Global Server Settings` | 2 | 2 | 0 | 0 | 0 |
| `Group` | 16 | 16 | 0 | 0 | 0 |
| `health` | 4 | 4 | 0 | 0 | 0 |
| `Investigation` | 6 | 6 | 0 | 0 | 0 |
| `Mute` | 6 | 6 | 0 | 0 | 0 |
| `Node` | 6 | 6 | 0 | 0 | 0 |
| `Problem` | 2 | 2 | 0 | 0 | 0 |
| `ProblemOccurrence` | 2 | 2 | 1 | 0 | 0 |
| `Project` | 48 | 48 | 13 | 2 | 0 |
| `Role` | 8 | 8 | 0 | 0 | 0 |
| `Root` | 4 | 4 | 0 | 0 | 0 |
| `Server` | 18 | 18 | 2 | 0 | 0 |
| `Server Authentication Settings` | 2 | 2 | 0 | 0 | 0 |
| `Test` | 2 | 2 | 0 | 0 | 0 |
| `TestOccurrence` | 2 | 2 | 1 | 0 | 0 |
| `User` | 28 | 28 | 2 | 0 | 0 |
| `VcsRoot` | 14 | 14 | 4 | 2 | 0 |
| `VcsRootInstance` | 17 | 17 | 0 | 1 | 0 |
| `VersionedSettings` | 16 | 16 | 3 | 0 | 0 |

The areas above combine these groups: changes, tests and problems are `Change`, `Test`,
`TestOccurrence`, `Problem` and `ProblemOccurrence`; agents and agent pools are `Agent`, `AgentPool`
and `AgentType`; users, groups and roles are `User`, `Group`, `Role` and `Avatar`; server, nodes,
audit and health are `Server`, `Root`, `Node`, `Audit`, `health`, `Server Authentication Settings`
and `Global Server Settings`; VCS roots and instances are `VcsRoot` and `VcsRootInstance`;
investigations and mutes are `Investigation` and `Mute`. Every other area is one group.

## Method

- **Denominator.** The 449 operations (HTTP method + path template, 268 paths, 30 resource groups)
  of the REST description TeamCity serves at `/app/rest/swagger.json`, version `2026.1 (current)`,
  read on 2026-11-10 from the public server JetBrains runs
  ([optional API reference: published REST description](https://teamcity.jetbrains.com/app/rest/swagger.json)).
  Its method and path set is identical to the inventory frozen on 2026-08-30 for the audit that
  drove the expansion ([optional provenance: Factory audit commit](https://github.com/iXab3r/EyeAuras.CliFactory/commit/1b59539d315d4207baef38c1e8af9376fcb35c32)).
  This repository does not track the per-operation list or a generator for it yet; the numbers
  here are a dated measurement, not a maintained census.
- **Reachable** means a shipped command issues that exact method and path. It does not measure
  every query parameter, locator dimension, payload field, server version or remote permission.
  Placeholder names are ignored when matching; literal path segments are not.
- **teamcity-cli 0.7.1** was observed, not counted from the command tree. The offline suite ran
  with a recorder at the product's transport that logged each method, path and executing command:
  445 operations were issued by a command there. `projects show`, `agents show` and
  `builds changes` were then invoked against a stubbed transport and issued three more.
  The last one, `GET /app/rest/users/{userLocator}`, is issued only by the sign-in check of
  `auth status`, `auth login` and `profile configure`, always for the current user; no command
  reads another user through it (`users list` and `users fields` use other operations).
  The command tree has 456 service commands: 234 `ReadOnly`, 171 `Update`, 37 `Admin`, 14 `Credentials`.
- **teamcity 1.6.3** was measured by reading the source of the release tag `v1.6.3`
  ([optional source reference: JetBrains/teamcity-cli v1.6.3](https://github.com/JetBrains/teamcity-cli/tree/v1.6.3),
  published 2026-11-04) without building or running it. Every HTTP call in its `api` package and
  command packages was listed, traced to a caller in a registered command, normalized and matched
  to the same 449 identities. An operation is credited only on an exact match.
- **bbox 1.1.0** and **tctest 1.3.5** were measured the same way, from the release tags
  ([optional source reference: similarweb/bbox v1.1.0](https://github.com/similarweb/bbox/tree/v1.1.0),
  published 2025-09-21, and
  [optional source reference: katbyte/tctest v1.3.5](https://github.com/katbyte/tctest/tree/v1.3.5),
  published 2026-10-20), without building or running them. Two request prefixes that address the
  same operations were removed before matching: the API version segment `tctest` puts in every
  path (`/app/rest/2026.1/...`) and the `httpAuth/` prefix `bbox` uses for one call.

## Caveats for the teamcity column

- It is a static reading of one version, not a statement about later releases.
- **It has a raw request command.** `teamcity api <endpoint>` sends any method and path the user
  types, so every operation of the server is callable by hand. The column counts dedicated
  commands only, because that is what this comparison measures. `teamcity-cli` deliberately has
  no raw request command: every call goes through a typed command and its permission category.
- Calls made only as a step inside another command (reading tags before removing one, VCS root
  entries before a pinned-revision run, the current user and server version during sign-in) are
  counted as reachable. So is `DELETE /app/rest/projects/{projectLocator}`, which it issues to
  delete a pipeline.
- Generic field operations are credited where it sends a documented field:
  `PUT /app/rest/agents/{agentLocator}/{field}` for `enabled` and `authorized`,
  `PUT /app/rest/buildTypes/{btLocator}/{field}` for `paused`, and
  `GET /app/rest/server/{field}` for `version`.
- 3 more operations exist in its client with no command calling them (queued-build approval info,
  user creation, token deletion); counting them would give 78 of 449 (17%).
- It issues 31 calls outside this denominator. 13 are `/app/rest` paths absent from the published
  description: artifact `children` and `content`, build configuration `settings` (list, read,
  write), queued-build `compatibilities`, `vcs-root-instances` of a build configuration, pipelines
  (list, read) and project SSH keys (list, upload, generate, delete). 18 are other server
  endpoints: build log download, build messages, pipeline YAML and schema, personal-build patch
  upload, settings export, agent reboot and terminal, plugin upload, VCS connection tests and
  browser sign-in.
- Its artifact listing and download use the `children` and `content` paths, so the three
  published artifact operations they correspond to (`artifacts`, `artifacts/{path}`,
  `artifacts/files{path}`) are not credited. Counting them would give 78 of 449 through commands.
- Coverage is one axis. `teamcity` offers things this CLI does not: build log reading and live
  watching, pipelines as YAML, personal builds from local changes, SSH key management, an agent
  terminal, plugin upload, migration from other CI systems, browser sign-in, aliases and a
  terminal UI.

## Caveats for the bbox column

- It is a static reading of one version, not a statement about later releases.
- `bbox` is a small tool with three jobs: trigger one build or many and optionally wait and
  download artifacts, clear the build queue, and find and delete unused VCS roots. All 9 credited
  operations come from those commands; several are steps inside the VCS root clean-up (projects,
  project templates, VCS root entries of a template, VCS root instances).
- `POST /app/rest/buildQueue` is sent as `httpAuth/app/rest/buildQueue`. It is credited; matching
  literally, without removing that prefix, gives 8 of 449.
- It issues 2 calls outside this denominator: the artifact `children` path, which the published
  description does not contain, and the `downloadArtifacts.html` archive download.
- 1 client function, a read of artifact content by a caller-supplied path, has no command calling
  it and corresponds to no single operation.
- `bbox` offers things this CLI does not: triggering many builds in parallel with a live progress
  view, waiting for a build and unpacking its artifacts in one command, a one-step clean-up of
  unused VCS roots, and a Docker image.

## Caveats for the tctest column

- It is a static reading of one version, not a statement about later releases.
- `tctest` is not a general TeamCity client. It triggers acceptance-test builds for Terraform
  providers from a branch or a GitHub pull request and shows their results. It qualifies under the
  selection rule because it is a published command-line tool that calls the TeamCity REST API; its
  low number reflects its purpose.
- Every path it sends carries an API version segment (`/app/rest/2026.1/...`, configurable). The
  6 operations are credited after removing it; matching literally gives 0 of 449.
- `GET /app/rest/builds/{buildLocator}/{field}` is credited for the `state` field, by the same
  rule as the generic field operations in the `teamcity` column.
- It issues 1 call outside this denominator: the `downloadBuildLog.html` build log download.
  Nothing in its TeamCity client is unwired.
- `tctest` offers things this CLI does not: discovering which tests a pull request touches,
  triggering builds for many pull requests filtered by author or label, waiting for the result
  and printing the test log.

## Updating

The README overview, this document and the pictures follow the
[product-readme skill](https://github.com/iXab3r/EyeAuras.CliFactory/tree/main/.claude/skills/product-readme) in Factory; it holds the format, the measuring method and the
picture generator.

- Refresh when the version in a column title changes or the operation inventory changes.
- Edit the numbers in `docs/images/readme-images.json`, then regenerate the four SVGs with the
  skill's script from a Factory checkout:
  `node <factory>/.claude/skills/product-readme/scripts/readme-images.mjs docs/images/readme-images.json docs/images`.
  It prints the area table for this document and rejects columns that do not add up.
- A column for another tool is a dated measurement of one version. Re-measure it deliberately,
  with the skill's method, and update the version, the caveats and the credited list together.

<details>
<summary>The 75 operations reachable from teamcity 1.6.3 commands</summary>

- `DELETE /app/rest/agentPools/{p1}/projects/{p2}`
- `DELETE /app/rest/buildTypes/{p1}/parameters/{p2}`
- `DELETE /app/rest/buildTypes/{p1}/steps/{p2}`
- `DELETE /app/rest/builds/{p1}/comment`
- `DELETE /app/rest/projects/{p1}`
- `DELETE /app/rest/projects/{p1}/parameters/{p2}`
- `DELETE /app/rest/projects/{p1}/projectFeatures/{p2}`
- `DELETE /app/rest/vcs-roots/{p1}`
- `GET /app/rest/agentPools`
- `GET /app/rest/agentPools/{p1}`
- `GET /app/rest/agents`
- `GET /app/rest/agents/{p1}`
- `GET /app/rest/agents/{p1}/compatibleBuildTypes`
- `GET /app/rest/agents/{p1}/incompatibleBuildTypes`
- `GET /app/rest/buildQueue`
- `GET /app/rest/buildTypes`
- `GET /app/rest/buildTypes/{p1}`
- `GET /app/rest/buildTypes/{p1}/parameters`
- `GET /app/rest/buildTypes/{p1}/parameters/{p2}`
- `GET /app/rest/buildTypes/{p1}/snapshot-dependencies`
- `GET /app/rest/buildTypes/{p1}/steps`
- `GET /app/rest/buildTypes/{p1}/steps/{p2}`
- `GET /app/rest/buildTypes/{p1}/vcs-root-entries`
- `GET /app/rest/builds`
- `GET /app/rest/builds/{p1}`
- `GET /app/rest/builds/{p1}/resulting-properties`
- `GET /app/rest/builds/{p1}/tags`
- `GET /app/rest/changes`
- `GET /app/rest/cloud/images`
- `GET /app/rest/cloud/images/{p1}`
- `GET /app/rest/cloud/instances`
- `GET /app/rest/cloud/instances/{p1}`
- `GET /app/rest/cloud/profiles`
- `GET /app/rest/cloud/profiles/{p1}`
- `GET /app/rest/problemOccurrences`
- `GET /app/rest/projects`
- `GET /app/rest/projects/{p1}`
- `GET /app/rest/projects/{p1}/parameters`
- `GET /app/rest/projects/{p1}/parameters/{p2}`
- `GET /app/rest/projects/{p1}/projectFeatures`
- `GET /app/rest/projects/{p1}/secure/values/{p2}`
- `GET /app/rest/projects/{p1}/versionedSettings/config`
- `GET /app/rest/projects/{p1}/versionedSettings/status`
- `GET /app/rest/server`
- `GET /app/rest/server/{p1}`
- `GET /app/rest/testOccurrences`
- `GET /app/rest/users/{p1}`
- `GET /app/rest/vcs-roots`
- `GET /app/rest/vcs-roots/{p1}`
- `POST /app/rest/agentPools/{p1}/projects`
- `POST /app/rest/buildQueue`
- `POST /app/rest/buildQueue/{p1}`
- `POST /app/rest/buildQueue/{p1}/approve`
- `POST /app/rest/buildTypes`
- `POST /app/rest/buildTypes/{p1}/steps`
- `POST /app/rest/builds/{p1}`
- `POST /app/rest/builds/{p1}/tags`
- `POST /app/rest/cloud/instances`
- `POST /app/rest/cloud/instances/{p1}/actions/forceStop`
- `POST /app/rest/cloud/instances/{p1}/actions/stop`
- `POST /app/rest/projects`
- `POST /app/rest/projects/{p1}/projectFeatures`
- `POST /app/rest/projects/{p1}/secure/tokens`
- `POST /app/rest/users/{p1}/tokens`
- `POST /app/rest/vcs-roots`
- `PUT /app/rest/agents/{p1}/pool`
- `PUT /app/rest/agents/{p1}/{p2}`
- `PUT /app/rest/buildQueue/order/{p1}`
- `PUT /app/rest/buildTypes/{p1}/parameters/{p2}`
- `PUT /app/rest/buildTypes/{p1}/{p2}`
- `PUT /app/rest/builds/{p1}/comment`
- `PUT /app/rest/builds/{p1}/pinInfo`
- `PUT /app/rest/builds/{p1}/tags`
- `PUT /app/rest/projects/{p1}/parameters/{p2}`
- `PUT /app/rest/projects/{p1}/versionedSettings/config`

</details>

<details>
<summary>The 9 operations reachable from bbox 1.1.0 commands</summary>

- `DELETE /app/rest/buildQueue`
- `DELETE /app/rest/vcs-roots/{p1}`
- `GET /app/rest/buildTypes/{p1}/vcs-root-entries`
- `GET /app/rest/builds/{p1}`
- `GET /app/rest/projects`
- `GET /app/rest/projects/{p1}/templates`
- `GET /app/rest/vcs-root-instances`
- `GET /app/rest/vcs-roots`
- `POST /app/rest/buildQueue`

</details>

<details>
<summary>The 6 operations reachable from tctest 1.3.5 commands</summary>

- `GET /app/rest/buildQueue/{p1}`
- `GET /app/rest/builds`
- `GET /app/rest/builds/{p1}`
- `GET /app/rest/builds/{p1}/{p2}`
- `POST /app/rest/buildQueue`
- `POST /app/rest/builds/{p1}/tags`

</details>
