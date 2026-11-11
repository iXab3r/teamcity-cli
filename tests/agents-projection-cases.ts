// Default requests and empty-response outputs captured before this story.
export const cases = [
  {
    "name": "agents list",
    "argv": [
      "agents",
      "list",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "path": "/app/rest/agents",
    "defaultQuery": {
      "locator": "start:3,count:3",
      "fields": "nextHref,agent(id,name,connected,enabled,authorized,uptodate,webUrl,build(id,buildTypeId,number,state,status))"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {
      "id": 7,
      "name": "fixture-agent",
      "status": false,
      "policy": "any"
    },
    "baselineResult": {
      "count": 0,
      "items": [],
      "hasMore": false,
      "nextStart": null
    },
    "human": "No agents found.\n",
    "stderr": "",
    "collection": "agent",
    "permission": "ReadOnly"
  },
  {
    "name": "agents show 7",
    "argv": [
      "agents",
      "show",
      "7"
    ],
    "path": "/app/rest/agents/id:7",
    "defaultQuery": {
      "fields": "id,name,connected,enabled,authorized,uptodate,webUrl,build(id,buildTypeId,number,state,status)"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {
      "id": 7,
      "name": "fixture-agent",
      "status": false,
      "policy": "any"
    },
    "baselineResult": {
      "id": 7,
      "name": "fixture-agent",
      "status": false,
      "policy": "any"
    },
    "human": "id: 7\nname: fixture-agent\nstatus: false\npolicy: any\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "agents authorized show 7",
    "argv": [
      "agents",
      "authorized",
      "show",
      "7"
    ],
    "path": "/app/rest/agents/id:7/authorizedInfo",
    "defaultQuery": {
      "fields": "status,comment(text,timestamp)"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {
      "id": 7,
      "name": "fixture-agent",
      "status": false,
      "policy": "any"
    },
    "baselineResult": {
      "status": false
    },
    "human": "status: false\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "agents policy show 7",
    "argv": [
      "agents",
      "policy",
      "show",
      "7"
    ],
    "path": "/app/rest/agents/id:7/compatibilityPolicy",
    "defaultQuery": {
      "fields": "policy,buildTypes(buildType(id,name,projectId))"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {
      "id": 7,
      "name": "fixture-agent",
      "status": false,
      "policy": "any"
    },
    "baselineResult": {
      "policy": "any",
      "jobs": []
    },
    "human": "policy: any\njobs: (empty list)\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "agents compatible-jobs 7",
    "argv": [
      "agents",
      "compatible-jobs",
      "7"
    ],
    "path": "/app/rest/agents/id:7/compatibleBuildTypes",
    "defaultQuery": {
      "fields": "buildType(id,name,projectId)"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {
      "id": 7,
      "name": "fixture-agent",
      "status": false,
      "policy": "any"
    },
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "agents enabled show 7",
    "argv": [
      "agents",
      "enabled",
      "show",
      "7"
    ],
    "path": "/app/rest/agents/id:7/enabledInfo",
    "defaultQuery": {
      "fields": "status,comment(text,timestamp)"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {
      "id": 7,
      "name": "fixture-agent",
      "status": false,
      "policy": "any"
    },
    "baselineResult": {
      "status": false
    },
    "human": "status: false\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "agents incompatible-jobs 7",
    "argv": [
      "agents",
      "incompatible-jobs",
      "7"
    ],
    "path": "/app/rest/agents/id:7/incompatibleBuildTypes",
    "defaultQuery": {
      "fields": "compatibility(compatible,buildType(id,name,projectId))"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {
      "id": 7,
      "name": "fixture-agent",
      "status": false,
      "policy": "any"
    },
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "agents pool show 7",
    "argv": [
      "agents",
      "pool",
      "show",
      "7"
    ],
    "path": "/app/rest/agents/id:7/pool",
    "defaultQuery": {
      "fields": "id,name"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {
      "id": 7,
      "name": "fixture-agent",
      "status": false,
      "policy": "any"
    },
    "baselineResult": {
      "id": 7,
      "name": "fixture-agent"
    },
    "human": "id: 7\nname: fixture-agent\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "agents types show 7",
    "argv": [
      "agents",
      "types",
      "show",
      "7"
    ],
    "path": "/app/rest/agentTypes/id:7",
    "defaultQuery": {
      "fields": "id,name,isCloud"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {
      "id": 7,
      "name": "fixture-agent",
      "status": false,
      "policy": "any"
    },
    "baselineResult": {
      "id": 7,
      "name": "fixture-agent"
    },
    "human": "id: 7\nname: fixture-agent\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "agents authorized set 7 false",
    "argv": [
      "agents",
      "authorized",
      "set",
      "7",
      "false"
    ],
    "path": "/app/rest/agents/id:7/authorizedInfo",
    "defaultQuery": {
      "fields": "status,comment(text,timestamp)"
    },
    "method": "PUT",
    "body": "{\"status\":false}",
    "baselineResponse": {
      "id": 7,
      "name": "fixture-agent",
      "status": false,
      "policy": "any"
    },
    "baselineResult": {
      "status": false
    },
    "human": "status: false\n",
    "stderr": "",
    "collection": "",
    "permission": "Update"
  },
  {
    "name": "agents policy set 7 any",
    "argv": [
      "agents",
      "policy",
      "set",
      "7",
      "any"
    ],
    "path": "/app/rest/agents/id:7/compatibilityPolicy",
    "defaultQuery": {
      "fields": "policy,buildTypes(buildType(id,name,projectId))"
    },
    "method": "PUT",
    "body": "{\"policy\":\"any\"}",
    "baselineResponse": {
      "id": 7,
      "name": "fixture-agent",
      "status": false,
      "policy": "any"
    },
    "baselineResult": {
      "policy": "any",
      "jobs": []
    },
    "human": "policy: any\njobs: (empty list)\n",
    "stderr": "",
    "collection": "",
    "permission": "Update"
  },
  {
    "name": "agents enabled set 7 false",
    "argv": [
      "agents",
      "enabled",
      "set",
      "7",
      "false"
    ],
    "path": "/app/rest/agents/id:7/enabledInfo",
    "defaultQuery": {
      "fields": "status,comment(text,timestamp)"
    },
    "method": "PUT",
    "body": "{\"status\":false}",
    "baselineResponse": {
      "id": 7,
      "name": "fixture-agent",
      "status": false,
      "policy": "any"
    },
    "baselineResult": {
      "status": false
    },
    "human": "status: false\n",
    "stderr": "",
    "collection": "",
    "permission": "Update"
  },
  {
    "name": "agents pool set 7 2",
    "argv": [
      "agents",
      "pool",
      "set",
      "7",
      "2"
    ],
    "path": "/app/rest/agents/id:7/pool",
    "defaultQuery": {
      "fields": "id,name"
    },
    "method": "PUT",
    "body": "{\"id\":2}",
    "baselineResponse": {
      "id": 7,
      "name": "fixture-agent",
      "status": false,
      "policy": "any"
    },
    "baselineResult": {
      "id": 7,
      "name": "fixture-agent"
    },
    "human": "id: 7\nname: fixture-agent\n",
    "stderr": "",
    "collection": "",
    "permission": "Update"
  }
];
