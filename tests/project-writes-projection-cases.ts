import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "projects move Demo --parent Root",
    "argv": [
      "projects",
      "move",
      "Demo",
      "--parent",
      "Root"
    ],
    "method": "PUT",
    "path": "/app/rest/projects/id:Demo/parentProject",
    "query": {},
    "body": "{\"id\":\"Root\"}",
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
      "parentProjectId": "Root",
      "moved": true
    },
    "human": "id: Demo\nparentProjectId: Root\nmoved: true\n",
    "stderr": "",
    "collection": "",
    "field": false,
    "acknowledgement": true,
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "projects pools replace-all Demo --pool 7",
    "argv": [
      "projects",
      "pools",
      "replace-all",
      "Demo",
      "--pool",
      "7"
    ],
    "method": "PUT",
    "path": "/app/rest/projects/id:Demo/agentPools",
    "query": {
      "fields": "agentPool(id,name)"
    },
    "body": "{\"agentPool\":[{\"id\":7}]}",
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
    "field": false,
    "acknowledgement": false,
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "projects templates default set Demo --template Template",
    "argv": [
      "projects",
      "templates",
      "default",
      "set",
      "Demo",
      "--template",
      "Template"
    ],
    "method": "PUT",
    "path": "/app/rest/projects/id:Demo/defaultTemplate",
    "query": {
      "fields": "id,name,projectId"
    },
    "body": "{\"id\":\"Template\"}",
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
    "field": false,
    "acknowledgement": false,
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "projects templates default clear Demo",
    "argv": [
      "projects",
      "templates",
      "default",
      "clear",
      "Demo"
    ],
    "method": "DELETE",
    "path": "/app/rest/projects/id:Demo/defaultTemplate",
    "query": {},
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
      "projectId": "Demo",
      "cleared": true
    },
    "human": "projectId: Demo\ncleared: true\n",
    "stderr": "",
    "collection": "",
    "field": false,
    "acknowledgement": true,
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "projects templates create Demo Template --name Template",
    "argv": [
      "projects",
      "templates",
      "create",
      "Demo",
      "Template",
      "--name",
      "Template"
    ],
    "method": "POST",
    "path": "/app/rest/projects/id:Demo/templates",
    "query": {
      "fields": "id,name,projectId"
    },
    "body": "{\"id\":\"Template\",\"name\":\"Template\"}",
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
    "field": false,
    "acknowledgement": false,
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "projects jobs create Demo Job --name Job",
    "argv": [
      "projects",
      "jobs",
      "create",
      "Demo",
      "Job",
      "--name",
      "Job"
    ],
    "method": "POST",
    "path": "/app/rest/projects/id:Demo/buildTypes",
    "query": {
      "fields": "id,name,projectId"
    },
    "body": "{\"id\":\"Job\",\"name\":\"Job\"}",
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
    "field": false,
    "acknowledgement": false,
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "projects order jobs show Demo",
    "argv": [
      "projects",
      "order",
      "jobs",
      "show",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/order/buildTypes",
    "query": {
      "field": "buildType(id,name,projectId)"
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
    "field": true,
    "acknowledgement": false,
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "projects order jobs set Demo --id Job",
    "argv": [
      "projects",
      "order",
      "jobs",
      "set",
      "Demo",
      "--id",
      "Job"
    ],
    "method": "PUT",
    "path": "/app/rest/projects/id:Demo/order/buildTypes",
    "query": {
      "field": "buildType(id,name,projectId)"
    },
    "body": "{\"buildType\":[{\"id\":\"Job\"}]}",
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
    "field": true,
    "acknowledgement": false,
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "projects order projects show Demo",
    "argv": [
      "projects",
      "order",
      "projects",
      "show",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/order/projects",
    "query": {
      "field": "project(id,name)"
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
    "field": true,
    "acknowledgement": false,
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "projects order projects set Demo --id Child",
    "argv": [
      "projects",
      "order",
      "projects",
      "set",
      "Demo",
      "--id",
      "Child"
    ],
    "method": "PUT",
    "path": "/app/rest/projects/id:Demo/order/projects",
    "query": {
      "field": "project(id,name)"
    },
    "body": "{\"project\":[{\"id\":\"Child\"}]}",
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
    "field": true,
    "acknowledgement": false,
    "permission": "Update",
    "preflight": null
  }
];
