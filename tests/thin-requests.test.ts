import assert from "node:assert/strict";
import test from "node:test";
import { writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { assertHttpRequest, trackRequests, assertPermissionDenied } from "@eyeauras/cli-factory/testing";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { TeamCityClient } from "../src/client.js";
import { createTestRuntime } from "./support.js";

const base = "https://teamcity.test/app/rest";
const server = setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());
const json = JSON.stringify;
type Case = { name: string; argv: string[]; path: string; method?: string; permission?: string;
  query?: Record<string, string>; body?: unknown; response?: unknown; text?: string };
const cases: Case[] = [
  {"name": "r2 repeated items mutes", "argv": ["mutes", "create-many", "--fields", "id", "--item", "{\"id\": 7, \"future\": true}", "--item", "{\"id\": 8, \"future\": null}"], "method": "POST", "path": "/mutes/multiple", "body": {"mute": [{"id": 7, "future": true}, {"id": 8, "future": null}]}, "query": {"fields": "id"}},
  {"name": "r2 repeated items investigations", "argv": ["investigations", "create-many", "--fields", "id", "--item", "{\"id\": 7, \"future\": true}", "--item", "{\"id\": 8, \"future\": null}"], "method": "POST", "path": "/investigations/multiple", "body": {"investigation": [{"id": 7, "future": true}, {"id": 8, "future": null}]}, "query": {"fields": "id"}},
  {"name": "r2 repeated items users", "argv": ["users", "roles", "replace", "7", "--item", "{\"roleId\": \"R\", \"global\": true, \"future\": true}", "--item", "{\"roleId\": \"S\", \"scope\": \"g\", \"future\": null}"], "method": "PUT", "path": "/users/id:7/roles", "body": {"role": [{"roleId": "R", "scope": "g", "future": true}, {"roleId": "S", "scope": "g", "future": null}]}, "permission": "Admin"},
  {"name": "r2 repeated items groups", "argv": ["groups", "roles", "replace", "7", "--item", "{\"roleId\": \"R\", \"global\": true, \"future\": true}", "--item", "{\"roleId\": \"S\", \"scope\": \"g\", \"future\": null}"], "method": "PUT", "path": "/userGroups/key:7/roles", "body": {"role": [{"roleId": "R", "scope": "g", "future": true}, {"roleId": "S", "scope": "g", "future": null}]}, "permission": "Admin"},

  {"name": "r2 native builds cancellation", "argv": ["builds", "cancel", "7", "--comment", "compact", "--requeue", "false", "--item", "{\"comment\": null, \"readdIntoQueue\": true, \"future\": true}", "--fields", "id"], "method": "POST", "path": "/builds/id:7", "body": {"comment": null, "readdIntoQueue": true, "future": true}, "query": {"fields": "id"}},
  {"name": "r2 native queue cancellation", "argv": ["queue", "cancel", "7", "--comment", "compact", "--requeue", "false", "--item", "{\"comment\": null, \"readdIntoQueue\": true, \"future\": true}"], "method": "POST", "path": "/buildQueue/id:7", "body": {"comment": null, "readdIntoQueue": true, "future": true}, "query": {"fields": "id,buildTypeId,number,state,status,statusText,branchName,defaultBranch,personal,failedToStart,canceledInfo(timestamp),queuedDate,startDate,finishDate,percentageComplete,queuePosition,waitReason,webUrl,agent(id,name)"}},
  {"name": "r2 envelope mutesTrue", "argv": ["mutes", "create-many", "--fields", "id", "--item", "{\"mute\": [], \"count\": 0, \"future\": null}"], "method": "POST", "path": "/mutes/multiple", "body": {"mute": [], "count": 0, "future": null}, "query": {"fields": "id"}},
  {"name": "r2 envelope mutesFalse", "argv": ["mutes", "create-many", "--fields", "id", "--item", "{\"mute\": [{\"id\": 7, \"future\": true}], \"count\": 1, \"future\": null}"], "method": "POST", "path": "/mutes/multiple", "body": {"mute": [{"id": 7, "future": true}], "count": 1, "future": null}, "query": {"fields": "id"}},
  {"name": "r2 envelope investigationsTrue", "argv": ["investigations", "create-many", "--fields", "id", "--item", "{\"investigation\": [], \"count\": 0, \"future\": null}"], "method": "POST", "path": "/investigations/multiple", "body": {"investigation": [], "count": 0, "future": null}, "query": {"fields": "id"}},
  {"name": "r2 envelope investigationsFalse", "argv": ["investigations", "create-many", "--fields", "id", "--item", "{\"investigation\": [{\"id\": 7, \"future\": true}], \"count\": 1, \"future\": null}"], "method": "POST", "path": "/investigations/multiple", "body": {"investigation": [{"id": 7, "future": true}], "count": 1, "future": null}, "query": {"fields": "id"}},
  {"name": "r2 envelope usersTrue", "argv": ["users", "roles", "replace", "7", "--item", "{\"role\": [], \"count\": 0, \"future\": null}"], "method": "PUT", "path": "/users/id:7/roles", "body": {"role": [], "count": 0, "future": null}, "permission": "Admin"},
  {"name": "r2 envelope usersFalse", "argv": ["users", "roles", "replace", "7", "--item", "{\"role\": [{\"id\": 7, \"future\": true}], \"count\": 1, \"future\": null}"], "method": "PUT", "path": "/users/id:7/roles", "body": {"role": [{"id": 7, "future": true}], "count": 1, "future": null}, "permission": "Admin"},
  {"name": "r2 envelope groupsTrue", "argv": ["groups", "roles", "replace", "7", "--item", "{\"role\": [], \"count\": 0, \"future\": null}"], "method": "PUT", "path": "/userGroups/key:7/roles", "body": {"role": [], "count": 0, "future": null}, "permission": "Admin"},
  {"name": "r2 envelope groupsFalse", "argv": ["groups", "roles", "replace", "7", "--item", "{\"role\": [{\"id\": 7, \"future\": true}], \"count\": 1, \"future\": null}"], "method": "PUT", "path": "/userGroups/key:7/roles", "body": {"role": [{"id": 7, "future": true}], "count": 1, "future": null}, "permission": "Admin"},

  { name: "1 open agent policy", argv: ["agents", "policy", "set", "7", "future", "--fields", "id"], path: "/agents/id:7/compatibilityPolicy", query: { fields: "id" }, body: { policy: "future" } },
  { name: "1 authentication mode", argv: ["server", "authentication", "replace", "--item", json({ buildAuthenticationMode: "future" }), "--confirm"], permission: "Admin", path: "/server/authSettings", body: { buildAuthenticationMode: "future" } },
  { name: "1 cleanup ranges", argv: ["server", "cleanup", "configure", "--item", json({ daily: { hour: -1, minute: 99 }, maxCleanupDuration: 2147483648 })], permission: "Admin", path: "/server/cleanup", body: { daily: { hour: -1, minute: 99 }, maxCleanupDuration: 2147483648 } },
  { name: "1 global int32", argv: ["server", "settings", "set", "--item", json({ defaultQuietPeriod: 2147483648 })], permission: "Admin", path: "/server/globalSettings", body: { defaultQuietPeriod: 2147483648 } },
  { name: "1 versioned values", argv: ["projects", "versioned-settings", "config", "replace", "Example", "--fields", "id", "--item", json({ synchronizationMode: "future", buildSettingsMode: "future", importDecision: "future" })], path: "/projects/id:Example/versionedSettings/config", query: { fields: "id" }, body: { synchronizationMode: "future", buildSettingsMode: "future", importDecision: "future" } },
  { name: "2 omitted status comment", argv: ["builds", "set-status", "7", "future", "--fields", "id"], method: "POST", path: "/builds/id:7/status", query: { fields: "id" }, body: { status: "future" } },
  { name: "2 omitted queue reason", argv: ["queue", "paused", "set", "true"], path: "/buildQueue/pausedState", body: { paused: true } },
  { name: "2 omitted requestor", argv: ["builds", "start-agentless", "7", "--fields", "id"], path: "/builds/id:7/runningData", query: { fields: "id" } },
  { name: "2 empty account update", argv: ["users", "update", "7", "--fields", "id"], permission: "Admin", path: "/users/id:7", query: { fields: "id" }, body: {} },
  { name: "2 native account update", argv: ["users", "update", "7", "--fields", "id", "--item", json({ email: "fixture@example.test", enabled: false })], permission: "Admin", path: "/users/id:7", query: { fields: "id" }, body: { email: "fixture@example.test", enabled: false } },
  { name: "2 empty mute collection", argv: ["mutes", "create-many", "--fields", "id"], method: "POST", path: "/mutes/multiple", query: { fields: "id" }, body: { mute: [] } },
  { name: "2 empty investigation collection", argv: ["investigations", "create-many", "--fields", "id"], method: "POST", path: "/investigations/multiple", query: { fields: "id" }, body: { investigation: [] } },
  { name: "2 empty queue reorder", argv: ["queue", "reorder", "--fields", "id"], path: "/buildQueue/order", query: { fields: "id" }, body: { build: [] } },
  { name: "3 native investigation", argv: ["investigations", "create", "--fields", "id", "--item", json({ scope: { project: { id: "Example" } }, target: { anyProblem: true }, assignment: { text: "caller", timestamp: "fixture" } })], method: "POST", path: "/investigations", query: { fields: "id" }, body: { scope: { project: { id: "Example" } }, target: { anyProblem: true }, assignment: { text: "caller", timestamp: "fixture" } } },
  { name: "3 compact mute with native fields", argv: ["mutes", "create", "--fields", "id", "--item", json({ jobs: [], tests: [], resolution: "future", assignment: { text: "caller" } })], method: "POST", path: "/mutes", query: { fields: "id" }, body: { scope: { buildTypes: { buildType: [] } }, target: { tests: { test: [] } }, resolution: { type: "future" }, assignment: { text: "caller" } } },
  { name: "3 native bulk properties", argv: ["jobs", "steps", "replace-all", "Example", "--fields", "id", "--item", json({ properties: { count: 0, property: [] }, plugin: { text: "native" } })], path: "/buildTypes/id:Example/steps", query: { fields: "id" }, body: { step: [{ properties: { count: 0, property: [] }, plugin: { text: "native" } }] } },
  { name: "3 authentication property metadata", argv: ["server", "authentication", "replace", "--confirm", "--item", json({ modules: { count: 1, module: [{ name: "Fixture", properties: { count: 0, href: "fixture", property: [] } }] } })], permission: "Admin", path: "/server/authSettings", body: { modules: { count: 1, module: [{ name: "Fixture", properties: { count: 0, href: "fixture", property: [] } }] } } },
  { name: "4 project list", argv: ["projects", "list", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/projects", query: { locator: "start:0,count:101", fields: "nextHref,project(id)" } },
  { name: "4 job list", argv: ["jobs", "list", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/buildTypes", query: { locator: "start:0,count:101", fields: "nextHref,buildType(id)" } },
  { name: "4 build list", argv: ["builds", "list", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/builds", query: { locator: "start:0,count:101", fields: "nextHref,build(id)" } },
  { name: "4 agent list", argv: ["agents", "list", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/agents", query: { locator: "start:0,count:101", fields: "nextHref,agent(id)" } },
  { name: "4 file controls", argv: ["jobs", "files", "list", "Example", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/buildTypes/id:Example/vcs/files/latest", query: { locator: "count:100", fields: "count,file(id)" } },
  { name: "4 cancellation", argv: ["builds", "cancel", "7", "--fields", "id"], method: "POST", path: "/builds/id:7", query: { fields: "id" }, body: {} },
  { name: "4 approval", argv: ["queue", "approval", "approve", "7", "--fields", "id"], method: "POST", path: "/buildQueue/id:7/approve", query: { fields: "id" } },
  { name: "4 backup", argv: ["server", "backup", "start", "fixture", "--confirm"], permission: "Admin", method: "POST", path: "/server/backup", query: { fileName: "fixture" }, text: "fixture" },
  { name: "5 bulk unmute has no GET", argv: ["mutes", "delete-many", "--id", "7", "--confirm", "--fields", "id"], method: "DELETE", path: "/mutes/multiple", query: { fields: "id" }, body: { mute: [{ id: 7 }] } },
  { name: "6 leading and empty path segments", argv: ["jobs", "files", "metadata", "Example", "/a//b", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/buildTypes/id:Example/vcs/files/latest/metadata//a//b", query: { fields: "id" } },
  { name: "6 JSON Unicode", argv: ["users", "update", "7", "--fields", "id", "--item", json({ name: "\ud800", extra: "\ud800" })], permission: "Admin", path: "/users/id:7", query: { fields: "id" }, body: { name: "\ud800", extra: "\ud800" } },
  { name: "6 cloud profile filter", argv: ["cloud", "profiles", "list", "--cloud-profile", "Example", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/cloud/profiles", query: { locator: "profile:(id:Example),start:0,count:101", fields: "nextHref,cloudProfile(id)" } },
  { name: "6 queue deletion without job", argv: ["queue", "delete-page", "--confirm", "--fields", "id"], method: "DELETE", path: "/buildQueue", query: { locator: "start:0,count:100", fields: "id" } },
  { name: "1 open deployment state", argv: ["deployments", "instances", "append-state", "Example", "Fixture", "--state", "future", "--date", "caller"], method: "POST", path: "/deploymentDashboards/id:Example/instances/id:Fixture", body: { state: "future", deploymentDate: "caller" } },
  { name: "2 token without expiry or restrictions", argv: ["users", "tokens", "create", "Fixture", "--alias", "fixture", "--fields", "id"], permission: "Credentials", method: "POST", path: "/users/current/tokens", query: { fields: "id" }, body: { name: "Fixture" } },
  { name: "2 absent project payload", argv: ["projects", "create", "Example"], method: "POST", path: "/projects", query: { fields: "id,name,parentProjectId,archived,description,webUrl" }, body: { id: "Example" } },
  { name: "2 absent job payload", argv: ["jobs", "create", "Example", "--fields", "id"], method: "POST", path: "/buildTypes", query: { fields: "id" }, body: { id: "Example" } },
  { name: "2 absent parameter value", argv: ["jobs", "parameters", "set", "Example", "env.MODE", "--fields", "id"], path: "/buildTypes/id:Example/parameters/env.MODE", query: { fields: "id" }, body: { name: "env.MODE" } },
  { name: "2 absent pool payload", argv: ["pools", "create"], method: "POST", path: "/agentPools", body: {} },
  { name: "2 absent role payload", argv: ["roles", "create", "--fields", "id"], permission: "Admin", method: "POST", path: "/roles", query: { fields: "id" }, body: {} },
  { name: "2 absent rule payload", argv: ["jobs", "agent-requirements", "create", "Example", "--fields", "id"], method: "POST", path: "/buildTypes/id:Example/agent-requirements", query: { fields: "id" }, body: {} },
  { name: "2 empty tags", argv: ["builds", "tags", "add", "7"], method: "POST", path: "/builds/id:7/tags", body: { tag: [] }, text: "accepted" },
  { name: "2 empty unmute collection", argv: ["mutes", "delete-many", "--confirm", "--fields", "id"], method: "DELETE", path: "/mutes/multiple", query: { fields: "id" }, body: { mute: [] } },
  { name: "3 native run DTO", argv: ["jobs", "run", "Example", "--item", json({ buildType: { id: "Native", extra: true }, comment: { text: "caller", extra: true }, triggeringOptions: { cleanSources: false, future: true }, properties: { count: 0, property: [] }, future: true })], method: "POST", path: "/buildQueue", query: { fields: "id,buildTypeId,number,state,status,statusText,branchName,defaultBranch,personal,failedToStart,canceledInfo(timestamp),queuedDate,startDate,finishDate,percentageComplete,queuePosition,waitReason,webUrl,agent(id,name)" }, body: { buildType: { id: "Native", extra: true }, comment: { text: "caller", extra: true }, triggeringOptions: { cleanSources: false, future: true }, properties: { count: 0, property: [] }, future: true }, response: { id: 7, state: "queued" } },
  { name: "3 native copy DTO", argv: ["jobs", "copy", "Source", "Copy", "--project", "Example", "--item", json({ sourceBuildType: { id: "Native", extra: true }, copyAllAssociatedSettings: false, future: true })], permission: "Credentials", method: "POST", path: "/projects/id:Example/buildTypes", query: { fields: "id,name,projectId" }, body: { id: "Copy", sourceBuildType: { id: "Native", extra: true }, copyAllAssociatedSettings: false, future: true } },
  { name: "3 native deployment DTO", argv: ["deployments", "instances", "upsert", "Example", "Fixture", "--confirm", "--item", json({ attributes: { caller: true }, deploymentStateEntries: { count: 0, deploymentStateEntry: [] }, future: true })], method: "POST", path: "/deploymentDashboards/id:Example/instances", body: { id: "Fixture", attributes: { caller: true }, deploymentStateEntries: { count: 0, deploymentStateEntry: [] }, future: true } },
  { name: "3 native role DTO", argv: ["roles", "create", "--fields", "id", "--item", json({ id: "Caller", permissions: { count: 0, permission: [] }, future: true })], permission: "Admin", method: "POST", path: "/roles", query: { fields: "id" }, body: { id: "Caller", permissions: { count: 0, permission: [] }, future: true } },
  { name: "3 native assignment DTO", argv: ["users", "roles", "replace", "7", "--item", json({ roleId: "Caller", scope: "future", future: true })], permission: "Admin", path: "/users/id:7/roles", body: { role: [{ roleId: "Caller", scope: "future", future: true }] } },
  { name: "3 native rule overrides conveniences", argv: ["jobs", "artifact-dependencies", "create", "Example", "--source", "Compact", "--item", json({ type: "future", kind: "caller", "source-buildType": { id: "Native", extra: true }, properties: { count: 0, property: [] }, disabled: false }) , "--fields", "id"], method: "POST", path: "/buildTypes/id:Example/artifact-dependencies", query: { fields: "id" }, body: { type: "future", kind: "caller", "source-buildType": { id: "Native", extra: true }, properties: { count: 0, property: [] }, disabled: false } },
  { name: "3 native investigation replacement", argv: ["investigations", "replace", "--fields", "id", "--item", json({ scope: { project: { id: "Example", extra: true } }, target: { tests: { test: [{ id: "Fixture" }] } }, assignment: { text: "caller" } })], path: "/investigations/assignmentProject:(id:Example),test:(id:Fixture)", query: { fields: "id" }, body: { scope: { project: { id: "Example", extra: true } }, target: { tests: { test: [{ id: "Fixture" }] } }, assignment: { text: "caller" } } },
  { name: "4 absent template optimization", argv: ["jobs", "templates", "attach", "Example", "--template", "Fixture", "--fields", "id"], method: "POST", path: "/buildTypes/id:Example/templates", query: { fields: "id" }, body: { id: "Fixture" } },
  { name: "4 absent template inline", argv: ["jobs", "templates", "detach", "Example", "Fixture"], method: "DELETE", path: "/buildTypes/id:Example/templates/id:Fixture", text: "accepted" },
  { name: "4 explicit requeue false", argv: ["builds", "cancel", "7", "--requeue", "false", "--fields", "id"], method: "POST", path: "/builds/id:7", query: { fields: "id" }, body: { readdIntoQueue: false } },
  { name: "4 explicit approval false", argv: ["queue", "approval", "approve", "7", "--approve-all", "false", "--fields", "id"], method: "POST", path: "/buildQueue/id:7/approve", query: { fields: "id", approveAll: "false" } },
  { name: "4 explicit default filter", argv: ["builds", "list", "--default-filter", "false", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/builds", query: { locator: "defaultFilter:false,start:0,count:101", fields: "nextHref,build(id)" } },
  { name: "4 explicit archived filter", argv: ["projects", "list", "--archived", "false", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/projects", query: { locator: "archived:false,start:0,count:101", fields: "nextHref,project(id)" } },
  { name: "4 explicit template filter", argv: ["jobs", "list", "--template-flag", "false", "--fields", "id"], permission: "ReadOnly", method: "GET", path: "/buildTypes", query: { locator: "templateFlag:false,start:0,count:101", fields: "nextHref,buildType(id)" } },

  { name: "3 native nullable properties", argv: ["jobs", "steps", "create", "Example", "--fields", "id", "--item", json({ properties: null, future: null })], method: "POST", path: "/buildTypes/id:Example/steps", query: { fields: "id" }, body: { properties: null, future: null } },
  { name: "3 native nullable assignment", argv: ["investigations", "create", "--fields", "id", "--item", json({ scope: null, target: null, assignee: null, assignment: null })], method: "POST", path: "/investigations", query: { fields: "id" }, body: { scope: null, target: null, assignee: null, assignment: null } },
  { name: "3 native nullable authentication properties", argv: ["server", "authentication", "replace", "--confirm", "--item", json({ modules: { module: [{ properties: null }] } })], permission: "Admin", path: "/server/authSettings", body: { modules: { module: [{ properties: null }] } } },

  { name: "3 native extension keeps convenience-named extra fields", argv: ["jobs", "features", "create", "Example", "--fields", "id", "--item", json({ enabled: true, disabled: true, native: { future: true } })], method: "POST", path: "/buildTypes/id:Example/features", query: { fields: "id" }, body: { enabled: true, disabled: true, native: { future: true } } },
  { name: "2 empty parameter payload name", argv: ["jobs", "parameters", "create", "Example", "", "--fields", "id"], method: "POST", path: "/buildTypes/id:Example/parameters", query: { fields: "id" }, body: { name: "" } },

  { name: "3 native account fields take precedence", argv: ["users", "update", "7", "--name", "Compact", "--fields", "id", "--item", json({ name: "Native", future: true })], permission: "Admin", path: "/users/id:7", query: { fields: "id" }, body: { name: "Native", future: true } },

  {"name":"review omitted VCS attach rules","argv":["jobs","vcs","attach","Example","--root","Root","--fields","id"],"method":"POST","path":"/buildTypes/id:Example/vcs-root-entries","query":{"fields":"id"},"body":{"vcs-root":{"id":"Root"}}},
  {"name":"review omitted VCS replacement rules","argv":["jobs","vcs","replace","Example","Root","--fields","id"],"path":"/buildTypes/id:Example/vcs-root-entries/id:Root","query":{"fields":"id"},"body":{"vcs-root":{"id":"Root"}}},
  {"name":"review empty versioned token deletion","argv":["projects","versioned-settings","tokens","delete","Example"],"permission":"Credentials","method":"DELETE","path":"/projects/id:Example/versionedSettings/tokens","body":{"versionedSettingsToken":[]}},
  {"name":"review bulk extension fields","argv":["jobs","features","replace-all","Example","--fields","id","--item","{\"enabled\": true, \"disabled\": true, \"future\": true}"],"path":"/buildTypes/id:Example/features","query":{"fields":"id"},"body":{"feature":[{"enabled":true,"disabled":true,"future":true}]}},
  {"name":"review native collection envelope","argv":["jobs","steps","replace-all","Example","--fields","id","--item","{\"step\": [{\"enabled\": true, \"future\": true}], \"count\": 1, \"future\": null}"],"path":"/buildTypes/id:Example/steps","query":{"fields":"id"},"body":{"step":[{"enabled":true,"future":true}],"count":1,"future":null}},
  {"name":"review optional compact property values","argv":["jobs","steps","replace-all","Example","--fields","id","--item","{\"properties\": [{\"name\": \"env.X\", \"type\": {\"rawValue\": \"password\"}}, {\"value\": \"fixture\"}, {}]}"],"path":"/buildTypes/id:Example/steps","query":{"fields":"id"},"body":{"step":[{"properties":{"property":[{"name":"env.X","type":{"rawValue":"password"}},{"value":"fixture"},{}]}}]}},
  {"name":"review role body conflicting compact scopes","argv":["users","roles","add","7","ROLE","--global","--project","Example"],"permission":"Admin","method":"POST","path":"/users/id:7/roles","body":{"roleId":"ROLE","global":true,"project":"Example"}},
  {"name":"review combined investigation dimensions","argv":["investigations","show","--target","{\"kind\": \"test\", \"jobId\": \"Build\", \"projectId\": \"Example\", \"testId\": \"Test\"}","--fields","id"],"permission":"ReadOnly","method":"GET","path":"/investigations/assignmentProject:(id:Example),buildType:(id:Build),test:(id:Test)","query":{"fields":"id"}},
  {"name":"review omitted license body","argv":["server","licenses","add","--fields","id"],"permission":"Admin","method":"POST","path":"/server/licensingData/licenseKeys","query":{"fields":"id"}},
  {"name":"review blank requestor ''","argv":["vcs","instances","check-changes","8","--requestor","","--fields","id"],"method":"POST","path":"/vcs-root-instances/checkingForChangesQueue","query":{"locator":"id:8","fields":"id","requestor":""}},
  {"name":"review blank requestor '  '","argv":["vcs","instances","check-changes","8","--requestor","  ","--fields","id"],"method":"POST","path":"/vcs-root-instances/checkingForChangesQueue","query":{"locator":"id:8","fields":"id","requestor":"  "}},
  {"name":"review native parameter type","argv":["jobs","parameters","type","set","Example","env.X","compact","--item","{\"rawValue\": null, \"future\": true}"],"path":"/buildTypes/id:Example/parameters/env.X/type","body":{"rawValue":null,"future":true}},
  {"name":"review native cloud start","argv":["cloud","instances","start","--item","{\"image\": {\"id\": \"native\", \"future\": true}, \"future\": null}","--fields","id"],"method":"POST","path":"/cloud/instances","query":{"fields":"id"},"body":{"image":{"id":"native","future":true},"future":null}},
];
for (const c of cases) test(`#381 category ${c.name}`, async t => {
  const runtime = await createTestRuntime(t, { profiles: [{ name: "default", url: "https://teamcity.test", permissions: [] }] });
  const cli = runtime.createCli();
  const requests = trackRequests(t, 1, async request => {
    await assertHttpRequest(request, { method: c.method ?? "PUT", url: base + c.path, query: c.query ?? {},
      ...(c.body === undefined ? {} : { body: { json: c.body } }) });
    return c.text === undefined ? HttpResponse.json(c.response ?? {}) : HttpResponse.text(c.text);
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  await assertPermissionDenied(cli, c.argv, c.permission ?? "Update", requests);
  await cli.execute(["permissions", "grant", c.permission ?? "Update"]);
  await cli.execute(c.argv);
});

for (const status of [403, 404, 500, "network", "invalid-json", "missing-type", "null-type"]) test(`#381 category 5 password metadata ${status} falls back to caller input`, async t => {
  const runtime = await createTestRuntime(t);
  const cli = runtime.createCli();
  await cli.execute(["permissions", "grant", "Credentials"]);
  const path = base + "/buildTypes/id:Example/parameters/env.MODE";
  const requests = trackRequests(t, 2, async (request, index) => {
    await assertHttpRequest(request, index === 0 ? { method: "GET", url: path, query: { fields: "name,inherited,type(rawValue)" } }
      : { method: "PUT", url: path, query: {}, body: { json: { name: "env.MODE", value: "synthetic-value", type: { rawValue: "password" } } } });
    return index !== 0 ? new HttpResponse(null, { status: 204 })
      : typeof status === "number" ? new HttpResponse(null, { status })
      : status === "network" ? HttpResponse.error()
      : status === "invalid-json" ? HttpResponse.text("invalid JSON")
      : HttpResponse.json(status === "null-type" ? { type: null } : {});
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  assert.deepEqual(await cli.execute(["jobs", "parameters", "set-password", "Example", "env.MODE", "--value", "synthetic-value"]), { jobId: "Example", name: "env.MODE", stored: true });
});

const sdkCases: { name: string; path: string; body: unknown; call: (c: TeamCityClient) => Promise<unknown>; query?: Record<string, string> }[] = [
  { name: "3 native step", path: "/buildTypes/id:Example/steps", body: { plugin: true, properties: { count: 0, property: [] } }, call: c => c.createStep("Example", { plugin: true, properties: { count: 0, property: [] } } as never, "id") },
  { name: "3 native extension", path: "/buildTypes/id:Example/features", body: { disabled: false, plugin: true }, call: c => c.createExtension("features", "Example", { disabled: false, plugin: true } as never, "id") },
  { name: "3 native snapshot", path: "/buildTypes/id:Example/snapshot-dependencies", body: { "source-buildType": { id: "Source", extra: true }, plugin: true }, call: c => c.createSnapshotDependency("Example", { "source-buildType": { id: "Source", extra: true }, plugin: true } as never, "id") },
];
for (const c of sdkCases) test(`#381 category ${c.name}`, async t => {
  const requests = trackRequests(t, 1, async request => {
    await assertHttpRequest(request, { method: "POST", url: base + c.path, query: c.query ?? { fields: "id" }, body: { json: c.body } });
    return HttpResponse.json({});
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  await c.call(new TeamCityClient({ baseUrl: "https://teamcity.test", token: "fixture-token" }));
});


test("#381 category 6 profile queries stay behind the REST path", async t => {
  const runtime = await createTestRuntime(t, { profiles: [{ name: "default", url: "https://teamcity.test:443/context/?route=fixture" }] });
  const requests = trackRequests(t, 1, async request => {
    await assertHttpRequest(request, { method: "GET", url: "https://teamcity.test/context/app/rest/server", query: { route: "fixture", fields: "id" } });
    return HttpResponse.json({});
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  await runtime.createCli().execute(["server", "status", "--fields", "id"]);
});

for (const ttl of [undefined, 2147483648, -2147483649]) test(`#381 categories 1/2 token TTL ${ttl}`, async t => {
  const runtime = await createTestRuntime(t);
  const cli = runtime.createCli();
  await cli.execute(["permissions", "grant", "Credentials"]);
  const requests = trackRequests(t, 1, async request => {
    await assertHttpRequest(request, { method: "POST", url: base + "/agentPools/id:2/authorizationTokens", query: {},
      body: { json: { ...(ttl === undefined ? {} : { timeToLiveSeconds: ttl }), count: 1 } } });
    return HttpResponse.json({ item: ["synthetic-registration"] });
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  await cli.execute(["pools", "tokens", "create", "2", ...(ttl === undefined ? [] : ["--ttl", String(ttl)]), "--store-as", "fixture"]);
  assert.equal(await runtime.secretStore.get("ai-cli-factory:teamcity-cli", "default:input-secret:fixture"), "synthetic-registration");
});

test("#381 categories 1/6 avatar size and upload filename reach TeamCity", async t => {
  const runtime = await createTestRuntime(t);
  const cli = runtime.createCli();
  await cli.execute(["permissions", "grant", "Admin"]);
  await cli.execute(["permissions", "grant", "Update"]);
  const name = "portrait.fixture.png", path = join(runtime.root, name);
  const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 0]);
  await writeFile(path, png);
  const requests = trackRequests(t, 2, async (request, index) => {
    if (index === 0) {
      assert.equal(request.method, "PUT");
      assert.equal(request.url, base + "/avatars/id:7");
      const form = await request.formData(), file = form.get("avatar") as File;
      assert.equal(file.name, name);
      assert.equal(file.type, "image/png");
      assert.deepEqual(new Uint8Array(await file.arrayBuffer()), png);
      return new HttpResponse(null, { status: 204 });
    }
    await assertHttpRequest(request, { method: "GET", url: base + "/avatars/id:7/2147483648/avatar.png", query: {} });
    return new HttpResponse(png, { headers: { "Content-Type": "image/png" } });
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  await cli.execute(["users", "avatar", "replace", "7", "--file", path]);
  const output = join(runtime.root, "download.png");
  await cli.execute(["users", "avatar", "download", "7", "--size", "2147483648", "--output", output]);
  assert.deepEqual(new Uint8Array(await readFile(output)), png);
});

test("#381 category 6 percent-bearing parameter names keep resolution storage", async t => {
  const runtime = await createTestRuntime(t);
  const cli = runtime.createCli();
  await cli.execute(["permissions", "grant", "Credentials"]);
  const requests = trackRequests(t, 1, async request => {
    await assertHttpRequest(request, { method: "GET", url: base + "/builds/id:7/resolved/%25%25caller%25%25", query: {} });
    return HttpResponse.text("synthetic-resolved");
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  await cli.execute(["builds", "resolve-parameter", "7", "%caller%", "--store-as", "fixture"]);
  assert.equal(await runtime.secretStore.get("ai-cli-factory:teamcity-cli", "default:input-secret:fixture"), "synthetic-resolved");
});

for (const native of [undefined, { entry: [], count: 0, future: true }]) test("#381 r2 optional SDK revision " + JSON.stringify(native), async t => {
  const requests = trackRequests(t, 1, async request => {
    await assertHttpRequest(request, { method: "PUT", url: base + "/vcs-root-instances/id:8/repositoryState", query: { fields: "id" },
      body: { json: native ?? { entry: [{ name: "main" }] } } });
    return HttpResponse.json({});
  });
  server.use(http.all("*", ({ request }) => requests.handle(request)));
  await new TeamCityClient({ baseUrl: "https://teamcity.test", token: "fixture-token" })
    .replaceVcsRepositoryState("8", [{ name: "main" }] as never, "id", native);
});
test("#381 r2 supplied SDK revision primitive validation", async () => {
  await assert.rejects(new TeamCityClient({ baseUrl: "https://teamcity.test", token: "fixture-token" })
    .replaceVcsRepositoryState("8", [{ name: "main", value: 42 }] as never, "id"), /text|string/);
});
