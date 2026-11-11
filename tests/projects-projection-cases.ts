import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "projects list --limit 2 --start 3",
    "argv": [
      "projects",
      "list",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/projects",
    "query": {
      "locator": "archived:false,start:3,count:3",
      "fields": "nextHref,project(id,name,parentProjectId,archived,description,webUrl)"
    },
    "body": "",
    "baselineResponse": {
      "project": [
        {
          "id": "Demo",
          "name": "Demo",
          "parentProjectId": "_Root",
          "archived": false,
          "description": "Synthetic",
          "extra": "dropped",
          "default": true,
          "active": true,
          "displayName": "Synthetic",
          "projectId": "Demo",
          "type": "synthetic"
        }
      ]
    },
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "id": "Demo",
          "name": "Demo",
          "parentProjectId": "_Root",
          "archived": false,
          "description": "Synthetic",
          "extra": "dropped",
          "default": true,
          "active": true,
          "displayName": "Synthetic",
          "projectId": "Demo",
          "type": "synthetic"
        }
      ],
      "hasMore": false,
      "nextStart": null
    },
    "human": "Demo · Demo\n",
    "stderr": "",
    "collection": "project",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "projects show Demo",
    "argv": [
      "projects",
      "show",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/projects/id:Demo",
    "query": {
      "fields": "id,name,parentProjectId,archived,description,webUrl"
    },
    "body": "",
    "baselineResponse": {
      "id": "Demo",
      "name": "Demo",
      "parentProjectId": "_Root",
      "archived": false,
      "description": "Synthetic",
      "extra": "dropped",
      "default": true,
      "active": true,
      "displayName": "Synthetic",
      "projectId": "Demo",
      "type": "synthetic"
    },
    "baselineResult": {
      "id": "Demo",
      "name": "Demo",
      "parentProjectId": "_Root",
      "archived": false,
      "description": "Synthetic",
      "extra": "dropped",
      "default": true,
      "active": true,
      "displayName": "Synthetic",
      "projectId": "Demo",
      "type": "synthetic"
    },
    "human": "id: Demo\nname: Demo\nparentProjectId: _Root\narchived: false\ndescription: Synthetic\nextra: dropped\ndefault: true\nactive: true\ndisplayName: Synthetic\nprojectId: Demo\ntype: synthetic\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "projects pools list Demo",
    "argv": [
      "projects",
      "pools",
      "list",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/agentPools",
    "query": {
      "fields": "agentPool(id,name)"
    },
    "body": "",
    "baselineResponse": {
      "agentPool": [
        {
          "id": "Demo",
          "name": "Demo",
          "parentProjectId": "_Root",
          "archived": false,
          "description": "Synthetic",
          "extra": "dropped",
          "default": true,
          "active": true,
          "displayName": "Synthetic",
          "projectId": "Demo",
          "type": "synthetic"
        }
      ]
    },
    "baselineResult": [
      {
        "id": "Demo",
        "name": "Demo"
      }
    ],
    "human": "id    name\n----  ----\nDemo  Demo\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "projects branches Demo --limit 2 --start 3",
    "argv": [
      "projects",
      "branches",
      "Demo",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/branches",
    "query": {
      "locator": "start:3,count:3",
      "fields": "nextHref,branch(name,default)"
    },
    "body": "",
    "baselineResponse": {
      "branch": [
        {
          "id": "Demo",
          "name": "Demo",
          "parentProjectId": "_Root",
          "archived": false,
          "description": "Synthetic",
          "extra": "dropped",
          "default": true,
          "active": true,
          "displayName": "Synthetic",
          "projectId": "Demo",
          "type": "synthetic"
        }
      ]
    },
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "name": "Demo",
          "default": true
        }
      ],
      "hasMore": false,
      "nextStart": null
    },
    "human": "name  default\n----  -------\nDemo  true\n\ncount: 1  hasMore: false  nextStart: null\n",
    "stderr": "",
    "collection": "branch",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "projects default-value-sets Demo",
    "argv": [
      "projects",
      "default-value-sets",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/defaultValueSets",
    "query": {
      "fields": "count,valueSet(name,displayName)"
    },
    "body": "",
    "baselineResponse": {
      "valueSet": [
        {
          "id": "Demo",
          "name": "Demo",
          "parentProjectId": "_Root",
          "archived": false,
          "description": "Synthetic",
          "extra": "dropped",
          "default": true,
          "active": true,
          "displayName": "Synthetic",
          "projectId": "Demo",
          "type": "synthetic"
        }
      ]
    },
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "name": "Demo",
          "displayName": "Synthetic"
        }
      ]
    },
    "human": "name  displayName\n----  -----------\nDemo  Synthetic\n\ncount: 1\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "projects deployments list Demo",
    "argv": [
      "projects",
      "deployments",
      "list",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/deploymentDashboards",
    "query": {
      "fields": "count,deploymentDashboard(id,name,project(id))"
    },
    "body": "",
    "baselineResponse": {
      "deploymentDashboard": [
        {
          "id": "Demo",
          "name": "Demo",
          "parentProjectId": "_Root",
          "archived": false,
          "description": "Synthetic",
          "extra": "dropped",
          "default": true,
          "active": true,
          "displayName": "Synthetic",
          "projectId": "Demo",
          "type": "synthetic"
        }
      ]
    },
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "id": "Demo",
          "name": "Demo"
        }
      ]
    },
    "human": "id    name\n----  ----\nDemo  Demo\n\ncount: 1\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "projects deployments show Demo Dashboard",
    "argv": [
      "projects",
      "deployments",
      "show",
      "Demo",
      "Dashboard"
    ],
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/deploymentDashboards/id:Dashboard",
    "query": {
      "fields": "id,name,project(id)"
    },
    "body": "",
    "baselineResponse": {
      "id": "Demo",
      "name": "Demo",
      "parentProjectId": "_Root",
      "archived": false,
      "description": "Synthetic",
      "extra": "dropped",
      "default": true,
      "active": true,
      "displayName": "Synthetic",
      "projectId": "Demo",
      "type": "synthetic"
    },
    "baselineResult": {
      "id": "Demo",
      "name": "Demo"
    },
    "human": "id: Demo\nname: Demo\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "projects parent Demo",
    "argv": [
      "projects",
      "parent",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/parentProject",
    "query": {
      "fields": "id,name"
    },
    "body": "",
    "baselineResponse": {
      "id": "Demo",
      "name": "Demo",
      "parentProjectId": "_Root",
      "archived": false,
      "description": "Synthetic",
      "extra": "dropped",
      "default": true,
      "active": true,
      "displayName": "Synthetic",
      "projectId": "Demo",
      "type": "synthetic"
    },
    "baselineResult": {
      "id": "Demo",
      "name": "Demo"
    },
    "human": "id: Demo\nname: Demo\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "projects templates list Demo",
    "argv": [
      "projects",
      "templates",
      "list",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/templates",
    "query": {
      "fields": "buildType(id,name,projectId)"
    },
    "body": "",
    "baselineResponse": {
      "buildType": [
        {
          "id": "Demo",
          "name": "Demo",
          "parentProjectId": "_Root",
          "archived": false,
          "description": "Synthetic",
          "extra": "dropped",
          "default": true,
          "active": true,
          "displayName": "Synthetic",
          "projectId": "Demo",
          "type": "synthetic"
        }
      ]
    },
    "baselineResult": [
      {
        "id": "Demo",
        "name": "Demo",
        "projectId": "Demo"
      }
    ],
    "human": "id    name  projectId\n----  ----  ---------\nDemo  Demo  Demo\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "projects templates default show Demo",
    "argv": [
      "projects",
      "templates",
      "default",
      "show",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/defaultTemplate",
    "query": {
      "fields": "id,name,projectId"
    },
    "body": "",
    "baselineResponse": {
      "id": "Demo",
      "name": "Demo",
      "parentProjectId": "_Root",
      "archived": false,
      "description": "Synthetic",
      "extra": "dropped",
      "default": true,
      "active": true,
      "displayName": "Synthetic",
      "projectId": "Demo",
      "type": "synthetic"
    },
    "baselineResult": {
      "id": "Demo",
      "name": "Demo",
      "projectId": "Demo"
    },
    "human": "id: Demo\nname: Demo\nprojectId: Demo\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  }
];
