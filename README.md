# teamcity-cli

**The whole TeamCity REST API as one command-line tool that is safe to hand to an AI agent.**

```sh
npm install --global @eyeauras/teamcity-cli
teamcity-cli profile configure        # server URL + access token, asked once
teamcity-cli builds list --job Demo_Tests --branch main --limit 20
```

## Why

| | |
|---|---|
| **Complete** | All 449 operations in the REST description TeamCity 2026.1 publishes are reachable: builds, queue, build configurations, projects, VCS, agents, cloud, users, server administration. |
| **Read-only by default** | A fresh profile can only read. Writes need `permissions grant Update` for that profile; account and server administration need `Admin`, token and secret workflows need `Credentials`, each granted separately. |
| **Made for build triage** | `builds diagnose` answers "why did it fail" in one call: up to 10 problems and 20 failed tests. `jobs run --wait` and `builds wait` exit 0 on success, 1 on failure, 124 on timeout, 130 on Ctrl+C. |
| **Cheap for agents** | `--json` on every command, paged lists (`--limit`, `--start`) that return `hasMore` and `nextStart`, stable error codes, and a persistent `--json-rpc` session without restarting Node. |
| **No leaked secrets** | Tokens live in the platform secret store, never in profile JSON or command arguments. Password parameters come back as `redacted: true`, and errors carry the HTTP status, never the response body. |
| **Predictable** | No write is retried or replayed. When the answer to a queue request is lost, `jobs run` reports `run.unknownOutcome` and the command to check with, instead of posting again. |

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/images/how-it-works-dark.svg">
  <img src="docs/images/how-it-works-light.svg" alt="People, AI agents and Node.js code use one teamcity-cli command tree, which applies profiles, the secret store, a permission gate and redaction before calling the TeamCity REST API">
</picture>

## Coverage

Share of the 449 published REST operations each tool can call through its own commands, by API area.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/images/coverage-matrix-dark.svg">
  <img src="docs/images/coverage-matrix-light.svg" alt="Coverage matrix: teamcity-cli 0.7.1 reaches 449 of 449 operations (100%); the JetBrains teamcity 1.6.3 reaches 75 (17%) through dedicated commands">
</picture>

The JetBrains CLI also has a raw `teamcity api` request command and features outside this API
(build logs, pipelines, agent terminals) that this tool does not have.
Numbers, method and caveats: [coverage comparison](docs/coverage-comparison.md).

## Use it

```sh
# read: why did build 101 fail, as JSON
teamcity-cli builds diagnose 101 --json

# write: allow it for this profile once, then queue a build and wait for the result
teamcity-cli permissions grant Update --profile uat
teamcity-cli jobs run Demo_Tests --profile uat --branch main --wait --timeout 10m

# discover: every level has help
teamcity-cli --help
teamcity-cli builds --help
```

Needs Node.js 22+. Your server's version and your account's rights still decide what a call is
allowed to do; the local permission gate does not replace TeamCity's own authorization.

## More

- [Command reference](docs/reference.md): every command family, paging, running and waiting, files, sign-in, error codes.
- [Coverage comparison](docs/coverage-comparison.md): the numbers behind the matrix and how they were measured.
- [Design](docs/DESIGN.md) of the shared runtime and the [release guide](docs/release.md).
- Built on AI CLI Factory (`@eyeauras/cli-factory`). [MIT licensed](LICENSE).
