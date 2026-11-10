// Synthetic baseline captured before implementation.
type Request = {method: string; path: string; query: Record<string,string>; body: string};
type Case = Request & {name: string; argv: string[]; baselineResponse: Record<string, unknown>; baselineResult: unknown; human: string; stderr: string; collection: string; permission: string; preflight: Request | null};
export const cases: Case[] = [
  {
    "name": "pools list --limit",
    "argv": [
      "pools",
      "list",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/agentPools",
    "query": {
      "locator": "start:3,count:3",
      "fields": "nextHref,agentPool(id,name)"
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
    "collection": "agentPool",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "pools show 1",
    "argv": [
      "pools",
      "show",
      "1"
    ],
    "method": "GET",
    "path": "/app/rest/agentPools/id:1",
    "query": {
      "fields": "id,name"
    },
    "body": "",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "id: \n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "pools agents list",
    "argv": [
      "pools",
      "agents",
      "list",
      "1",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/agentPools/id:1/agents",
    "query": {
      "locator": "start:3,count:3",
      "fields": "nextHref,agent(id,name)"
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
    "collection": "agent",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "pools projects list",
    "argv": [
      "pools",
      "projects",
      "list",
      "1"
    ],
    "method": "GET",
    "path": "/app/rest/agentPools/id:1/projects",
    "query": {
      "fields": "project(id,name)"
    },
    "body": "",
    "baselineResponse": {
      "project": [
        {
          "id": "Example",
          "name": "Example",
          "href": "/app/rest/projects/id:Example",
          "webUrl": "https://teamcity.test/project/Example"
        }
      ]
    },
    "baselineResult": [
      {
        "id": "Example",
        "name": "Example"
      }
    ],
    "human": "id       name\n-------  -------\nExample  Example\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "pools agents assign",
    "argv": [
      "pools",
      "agents",
      "assign",
      "1",
      "7"
    ],
    "method": "POST",
    "path": "/app/rest/agentPools/id:1/agents",
    "query": {
      "fields": "id,name"
    },
    "body": "{\"id\":7}",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "id: \n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  }
];
