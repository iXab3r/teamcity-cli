// Synthetic baseline captured before implementation.
type Request = {method: string; path: string; query: Record<string,string>; body: string};
type Case = Request & {name: string; argv: string[]; baselineResponse: Record<string, unknown>; baselineResult: unknown; human: string; stderr: string; collection: string; permission: string; preflight: Request | null};
export const cases: Case[] = [
  {
    "name": "investigations list --limit",
    "argv": [
      "investigations",
      "list",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/investigations",
    "query": {
      "locator": "start:3,count:3",
      "fields": "nextHref,investigation(id,state,assignee(id),assignment(text,timestamp),scope(project(id),buildTypes(buildType(id))),target(anyProblem,tests(test(id)),problems(problem(id))),resolution(type,time))"
    },
    "body": "",
    "baselineResponse": {},
    "baselineResult": {
      "count": 0,
      "items": [],
      "hasMore": false,
      "nextStart": null
    },
    "human": "No results.\n\ncount: 0  hasMore: false  nextStart: null\n",
    "stderr": "",
    "collection": "investigation",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "investigations show --target",
    "argv": [
      "investigations",
      "show",
      "--target",
      "{\"kind\":\"job\",\"jobId\":\"Example_Build\"}"
    ],
    "method": "GET",
    "path": "/app/rest/investigations/buildType:(id:Example_Build)",
    "query": {
      "fields": "id,state,assignee(id),assignment(text,timestamp),scope(project(id),buildTypes(buildType(id))),target(anyProblem,tests(test(id)),problems(problem(id))),resolution(type,time)"
    },
    "body": "",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "investigations create --item",
    "argv": [
      "investigations",
      "create",
      "--item",
      "{\"target\":{\"kind\":\"job\",\"jobId\":\"Example_Build\"},\"state\":\"TAKEN\",\"assignee\":3,\"resolution\":\"whenFixed\"}"
    ],
    "method": "POST",
    "path": "/app/rest/investigations",
    "query": {
      "fields": "id,state,assignee(id),assignment(text,timestamp),scope(project(id),buildTypes(buildType(id))),target(anyProblem,tests(test(id)),problems(problem(id))),resolution(type,time)"
    },
    "body": "{\"target\":{\"anyProblem\":true},\"state\":\"TAKEN\",\"assignee\":{\"id\":3},\"resolution\":{\"type\":\"whenFixed\"},\"scope\":{\"buildTypes\":{\"buildType\":[{\"id\":\"Example_Build\"}]}}}",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "investigations create-many --item",
    "argv": [
      "investigations",
      "create-many",
      "--item",
      "{\"target\":{\"kind\":\"job\",\"jobId\":\"Example_Build\"},\"state\":\"TAKEN\",\"assignee\":3,\"resolution\":\"whenFixed\"}"
    ],
    "method": "POST",
    "path": "/app/rest/investigations/multiple",
    "query": {
      "fields": "count,investigation(id,state,assignee(id),assignment(text,timestamp),scope(project(id),buildTypes(buildType(id))),target(anyProblem,tests(test(id)),problems(problem(id))),resolution(type,time))"
    },
    "body": "{\"investigation\":[{\"target\":{\"anyProblem\":true},\"state\":\"TAKEN\",\"assignee\":{\"id\":3},\"resolution\":{\"type\":\"whenFixed\"},\"scope\":{\"buildTypes\":{\"buildType\":[{\"id\":\"Example_Build\"}]}}}]}",
    "baselineResponse": {},
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "investigations replace --item",
    "argv": [
      "investigations",
      "replace",
      "--item",
      "{\"target\":{\"kind\":\"job\",\"jobId\":\"Example_Build\"},\"state\":\"TAKEN\",\"assignee\":3,\"resolution\":\"whenFixed\"}"
    ],
    "method": "PUT",
    "path": "/app/rest/investigations/buildType:(id:Example_Build)",
    "query": {
      "fields": "id,state,assignee(id),assignment(text,timestamp),scope(project(id),buildTypes(buildType(id))),target(anyProblem,tests(test(id)),problems(problem(id))),resolution(type,time)"
    },
    "body": "{\"target\":{\"anyProblem\":true},\"state\":\"TAKEN\",\"assignee\":{\"id\":3},\"resolution\":{\"type\":\"whenFixed\"},\"scope\":{\"buildTypes\":{\"buildType\":[{\"id\":\"Example_Build\"}]}}}",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "mutes list --limit",
    "argv": [
      "mutes",
      "list",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/mutes",
    "query": {
      "locator": "start:3,count:3",
      "fields": "nextHref,mute(id,assignment(text,timestamp),scope(project(id),buildTypes(buildType(id))),target(anyProblem,tests(test(id)),problems(problem(id))),resolution(type,time))"
    },
    "body": "",
    "baselineResponse": {},
    "baselineResult": {
      "count": 0,
      "items": [],
      "hasMore": false,
      "nextStart": null
    },
    "human": "No results.\n\ncount: 0  hasMore: false  nextStart: null\n",
    "stderr": "",
    "collection": "mute",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "mutes show 9",
    "argv": [
      "mutes",
      "show",
      "9"
    ],
    "method": "GET",
    "path": "/app/rest/mutes/id:9",
    "query": {
      "fields": "id,assignment(text,timestamp),scope(project(id),buildTypes(buildType(id))),target(anyProblem,tests(test(id)),problems(problem(id))),resolution(type,time)"
    },
    "body": "",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "mutes create --item",
    "argv": [
      "mutes",
      "create",
      "--item",
      "{\"project\":\"Example\",\"tests\":[\"7\"],\"resolution\":\"manually\"}"
    ],
    "method": "POST",
    "path": "/app/rest/mutes",
    "query": {
      "fields": "id,assignment(text,timestamp),scope(project(id),buildTypes(buildType(id))),target(anyProblem,tests(test(id)),problems(problem(id))),resolution(type,time)"
    },
    "body": "{\"resolution\":{\"type\":\"manually\"},\"scope\":{\"project\":{\"id\":\"Example\"}},\"target\":{\"tests\":{\"test\":[{\"id\":\"7\"}]}}}",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "mutes create-many --item",
    "argv": [
      "mutes",
      "create-many",
      "--item",
      "{\"project\":\"Example\",\"tests\":[\"7\"],\"resolution\":\"manually\"}"
    ],
    "method": "POST",
    "path": "/app/rest/mutes/multiple",
    "query": {
      "fields": "count,mute(id,assignment(text,timestamp),scope(project(id),buildTypes(buildType(id))),target(anyProblem,tests(test(id)),problems(problem(id))),resolution(type,time))"
    },
    "body": "{\"mute\":[{\"resolution\":{\"type\":\"manually\"},\"scope\":{\"project\":{\"id\":\"Example\"}},\"target\":{\"tests\":{\"test\":[{\"id\":\"7\"}]}}}]}",
    "baselineResponse": {},
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "mutes delete-many --id",
    "argv": [
      "mutes",
      "delete-many",
      "--id",
      "9",
      "--confirm"
    ],
    "method": "DELETE",
    "path": "/app/rest/mutes/multiple",
    "query": {},
    "body": "{\"mute\":[{\"id\":9,\"scope\":{},\"target\":{},\"resolution\":{}}]}",
    "baselineResponse": {
      "id": 9,
      "scope": {},
      "target": {},
      "resolution": {}
    },
    "baselineResult": {
      "requestedIds": [
        9
      ],
      "serverAcknowledged": true,
      "postconditionVerified": false
    },
    "human": "requestedIds:\n  - 9\nserverAcknowledged: true\npostconditionVerified: false\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": {
      "method": "GET",
      "path": "/app/rest/mutes/id:9",
      "query": {
        "fields": "id,scope(project(id),buildTypes(buildType(id))),target(anyProblem,tests(test(id)),problems(problem(id))),resolution(type,time)"
      },
      "body": ""
    }
  }
];
