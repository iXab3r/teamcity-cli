import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "jobs list --limit 2 --start 3",
    "argv": [
      "jobs",
      "list",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes",
    "query": {
      "locator": "templateFlag:false,start:3,count:3",
      "fields": "nextHref,buildType(id,name,projectId,projectName,paused,description,webUrl)"
    },
    "body": "",
    "baselineResponse": {
      "buildType": [
        {
          "id": "demo",
          "name": "Demo",
          "projectId": "Demo",
          "projectName": "Demo project",
          "paused": false,
          "description": "Synthetic",
          "extra": "dropped",
          "branchName": "main",
          "state": "finished",
          "status": "SUCCESS",
          "default": true,
          "active": true,
          "buildTypeId": "Demo",
          "type": "manual",
          "scope": {
            "project": {
              "id": "Demo"
            }
          },
          "vcsRootId": "Demo",
          "properties": {
            "property": [
              {
                "name": "env.MODE",
                "value": "test"
              }
            ]
          }
        }
      ]
    },
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "id": "demo",
          "name": "Demo",
          "projectId": "Demo",
          "projectName": "Demo project",
          "paused": false,
          "description": "Synthetic",
          "extra": "dropped",
          "branchName": "main",
          "state": "finished",
          "status": "SUCCESS",
          "default": true,
          "active": true,
          "buildTypeId": "Demo",
          "type": "manual",
          "scope": {
            "project": {
              "id": "Demo"
            }
          },
          "vcsRootId": "Demo",
          "properties": {
            "property": [
              {
                "name": "env.MODE",
                "value": "test"
              }
            ]
          }
        }
      ],
      "hasMore": false,
      "nextStart": null
    },
    "human": "JOB   NAME  PROJECT  PAUSED\ndemo  Demo  Demo     false\n",
    "stderr": "",
    "collection": "buildType",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs show Demo",
    "argv": [
      "jobs",
      "show",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Demo",
    "query": {
      "fields": "id,name,projectId,projectName,paused,description,webUrl"
    },
    "body": "",
    "baselineResponse": {
      "id": "demo",
      "name": "Demo",
      "projectId": "Demo",
      "projectName": "Demo project",
      "paused": false,
      "description": "Synthetic",
      "extra": "dropped",
      "branchName": "main",
      "state": "finished",
      "status": "SUCCESS",
      "default": true,
      "active": true,
      "buildTypeId": "Demo",
      "type": "manual",
      "scope": {
        "project": {
          "id": "Demo"
        }
      },
      "vcsRootId": "Demo",
      "properties": {
        "property": [
          {
            "name": "env.MODE",
            "value": "test"
          }
        ]
      }
    },
    "baselineResult": {
      "id": "demo",
      "name": "Demo",
      "projectId": "Demo",
      "projectName": "Demo project",
      "paused": false,
      "description": "Synthetic",
      "extra": "dropped",
      "branchName": "main",
      "state": "finished",
      "status": "SUCCESS",
      "default": true,
      "active": true,
      "buildTypeId": "Demo",
      "type": "manual",
      "scope": {
        "project": {
          "id": "Demo"
        }
      },
      "vcsRootId": "Demo",
      "properties": {
        "property": [
          {
            "name": "env.MODE",
            "value": "test"
          }
        ]
      }
    },
    "human": "id: demo\nname: Demo\nprojectId: Demo\nprojectName: Demo project\npaused: false\ndescription: Synthetic\nextra: dropped\nbranchName: main\nstate: finished\nstatus: SUCCESS\ndefault: true\nactive: true\nbuildTypeId: Demo\ntype: manual\nscope:\n  project:\n    id: Demo\nvcsRootId: Demo\nproperties:\n  property:\n    -\n      name: env.MODE\n      value: test\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs branches Demo --limit 2 --start 3",
    "argv": [
      "jobs",
      "branches",
      "Demo",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Demo/branches",
    "query": {
      "locator": "start:3,count:3",
      "fields": "nextHref,branch(name,default,active)"
    },
    "body": "",
    "baselineResponse": {
      "branch": [
        {
          "id": "demo",
          "name": "Demo",
          "projectId": "Demo",
          "projectName": "Demo project",
          "paused": false,
          "description": "Synthetic",
          "extra": "dropped",
          "branchName": "main",
          "state": "finished",
          "status": "SUCCESS",
          "default": true,
          "active": true,
          "buildTypeId": "Demo",
          "type": "manual",
          "scope": {
            "project": {
              "id": "Demo"
            }
          },
          "vcsRootId": "Demo",
          "properties": {
            "property": [
              {
                "name": "env.MODE",
                "value": "test"
              }
            ]
          }
        }
      ]
    },
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "name": "Demo",
          "default": true,
          "active": true
        }
      ],
      "hasMore": false,
      "nextStart": null
    },
    "human": "name  default  active\n----  -------  ------\nDemo  true     true\n\ncount: 1  hasMore: false  nextStart: null\n",
    "stderr": "",
    "collection": "branch",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs builds Demo",
    "argv": [
      "jobs",
      "builds",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Demo/builds",
    "query": {
      "fields": "build(id,buildTypeId,number,state,status,queuePosition)"
    },
    "body": "",
    "baselineResponse": {
      "build": [
        {
          "id": "demo",
          "name": "Demo",
          "projectId": "Demo",
          "projectName": "Demo project",
          "paused": false,
          "description": "Synthetic",
          "extra": "dropped",
          "branchName": "main",
          "state": "finished",
          "status": "SUCCESS",
          "default": true,
          "active": true,
          "buildTypeId": "Demo",
          "type": "manual",
          "scope": {
            "project": {
              "id": "Demo"
            }
          },
          "vcsRootId": "Demo",
          "properties": {
            "property": [
              {
                "name": "env.MODE",
                "value": "test"
              }
            ]
          }
        }
      ]
    },
    "baselineResult": [
      {
        "id": "demo",
        "buildTypeId": "Demo",
        "state": "finished",
        "status": "SUCCESS"
      }
    ],
    "human": "id    buildTypeId  state     status\n----  -----------  --------  -------\ndemo  Demo         finished  SUCCESS\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs investigations Demo",
    "argv": [
      "jobs",
      "investigations",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Demo/investigations",
    "query": {
      "fields": "count,investigation(id,state,assignee(id),assignment(text,timestamp),scope(project(id),buildTypes(buildType(id))),target(anyProblem,tests(test(id)),problems(problem(id))),resolution(type,time))"
    },
    "body": "",
    "baselineResponse": {
      "investigation": [
        {
          "id": "demo",
          "name": "Demo",
          "projectId": "Demo",
          "projectName": "Demo project",
          "paused": false,
          "description": "Synthetic",
          "extra": "dropped",
          "branchName": "main",
          "state": "finished",
          "status": "SUCCESS",
          "default": true,
          "active": true,
          "buildTypeId": "Demo",
          "type": "manual",
          "scope": {
            "project": {
              "id": "Demo"
            }
          },
          "vcsRootId": "Demo",
          "properties": {
            "property": [
              {
                "name": "env.MODE",
                "value": "test"
              }
            ]
          }
        }
      ]
    },
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "id": "demo",
          "state": "finished",
          "scope": {
            "project": {
              "id": "Demo"
            }
          }
        }
      ]
    },
    "human": "id: demo\nstate: finished\nscope:\n  project:\n    id: Demo\n\ncount: 1\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs vcs-instances Demo",
    "argv": [
      "jobs",
      "vcs-instances",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Demo/vcsRootInstances",
    "query": {
      "fields": "count,vcs-root-instance(id,name,vcs-root-id,vcsName,modificationCheckInterval,commitHookMode)"
    },
    "body": "",
    "baselineResponse": {
      "vcs-root-instance": [
        {
          "id": "demo",
          "name": "Demo",
          "projectId": "Demo",
          "projectName": "Demo project",
          "paused": false,
          "description": "Synthetic",
          "extra": "dropped",
          "branchName": "main",
          "state": "finished",
          "status": "SUCCESS",
          "default": true,
          "active": true,
          "buildTypeId": "Demo",
          "type": "manual",
          "scope": {
            "project": {
              "id": "Demo"
            }
          },
          "vcsRootId": "Demo",
          "properties": {
            "property": [
              {
                "name": "env.MODE",
                "value": "test"
              }
            ]
          }
        }
      ]
    },
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "id": "demo",
          "name": "Demo"
        }
      ]
    },
    "human": "id    name\n----  ----\ndemo  Demo\n\ncount: 1\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs aliases Demo",
    "field": true,
    "argv": [
      "jobs",
      "aliases",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Demo/aliases",
    "query": {},
    "body": "",
    "baselineResponse": {
      "item": [
        "old-demo"
      ]
    },
    "baselineResult": [
      "old-demo"
    ],
    "human": "old-demo\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs tags Demo",
    "field": true,
    "argv": [
      "jobs",
      "tags",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Demo/buildTags",
    "query": {
      "field": "tag(name)"
    },
    "body": "",
    "baselineResponse": {
      "tag": [
        {
          "name": "synthetic",
          "extra": true
        }
      ]
    },
    "baselineResult": [
      "synthetic"
    ],
    "human": "synthetic\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs create Demo --name Demo --project Demo",
    "argv": [
      "jobs",
      "create",
      "Demo",
      "--name",
      "Demo",
      "--project",
      "Demo"
    ],
    "method": "POST",
    "path": "/app/rest/buildTypes",
    "query": {
      "fields": "id,name,projectId,projectName,paused,description,webUrl"
    },
    "body": "{\"id\":\"Demo\",\"name\":\"Demo\",\"project\":{\"id\":\"Demo\"}}",
    "baselineResponse": {
      "id": "demo",
      "name": "Demo",
      "projectId": "Demo",
      "projectName": "Demo project",
      "paused": false,
      "description": "Synthetic",
      "extra": "dropped",
      "branchName": "main",
      "state": "finished",
      "status": "SUCCESS",
      "default": true,
      "active": true,
      "buildTypeId": "Demo",
      "type": "manual",
      "scope": {
        "project": {
          "id": "Demo"
        }
      },
      "vcsRootId": "Demo",
      "properties": {
        "property": [
          {
            "name": "env.MODE",
            "value": "test"
          }
        ]
      }
    },
    "baselineResult": {
      "id": "demo",
      "name": "Demo",
      "projectId": "Demo",
      "projectName": "Demo project",
      "paused": false,
      "description": "Synthetic",
      "extra": "dropped",
      "branchName": "main",
      "state": "finished",
      "status": "SUCCESS",
      "default": true,
      "active": true,
      "buildTypeId": "Demo",
      "type": "manual",
      "scope": {
        "project": {
          "id": "Demo"
        }
      },
      "vcsRootId": "Demo",
      "properties": {
        "property": [
          {
            "name": "env.MODE",
            "value": "test"
          }
        ]
      }
    },
    "human": "id: demo\nname: Demo\nprojectId: Demo\nprojectName: Demo project\npaused: false\ndescription: Synthetic\nextra: dropped\nbranchName: main\nstate: finished\nstatus: SUCCESS\ndefault: true\nactive: true\nbuildTypeId: Demo\ntype: manual\nscope:\n  project:\n    id: Demo\nvcsRootId: Demo\nproperties:\n  property:\n    -\n      name: env.MODE\n      value: test\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  }
];
