// Synthetic baseline captured before implementation.
type Request = {method: string; path: string; query: Record<string,string>; body: string};
type Case = Request & {name: string; argv: string[]; baselineResponse: Record<string, unknown>; baselineResult: unknown; human: string; stderr: string; collection: string; permission: string; preflight: Request | null};
export const cases: Case[] = [
  {
    "name": "deployments list --limit",
    "argv": [
      "deployments",
      "list",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/deploymentDashboards",
    "query": {
      "locator": "start:3,count:3",
      "fields": "nextHref,deploymentDashboard(id,name,project(id))"
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
    "collection": "deploymentDashboard",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "deployments show dashboard",
    "argv": [
      "deployments",
      "show",
      "dashboard"
    ],
    "method": "GET",
    "path": "/app/rest/deploymentDashboards/id:dashboard",
    "query": {
      "fields": "id,name,project(id)"
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
    "name": "deployments instances list",
    "argv": [
      "deployments",
      "instances",
      "list",
      "dashboard",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/deploymentDashboards/id:dashboard/instances",
    "query": {
      "locator": "start:3,count:3",
      "fields": "nextHref,deploymentInstance(id,currentState,deploymentDashboard(id))"
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
    "collection": "deploymentInstance",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "deployments instances show",
    "argv": [
      "deployments",
      "instances",
      "show",
      "dashboard",
      "instance"
    ],
    "method": "GET",
    "path": "/app/rest/deploymentDashboards/id:dashboard/instances/id:instance",
    "query": {
      "fields": "id,currentState,deploymentDashboard(id)"
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
    "name": "server rest-plugin",
    "argv": [
      "server",
      "rest-plugin"
    ],
    "method": "GET",
    "path": "/app/rest/info",
    "query": {
      "fields": "name,displayName,version,loaded,disabled"
    },
    "body": "",
    "baselineResponse": {},
    "baselineResult": {
      "name": "rest"
    },
    "human": "name: rest\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  }
];
