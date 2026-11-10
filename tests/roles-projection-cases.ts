import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "roles list",
    "argv": [
      "roles",
      "list"
    ],
    "method": "GET",
    "path": "/app/rest/roles",
    "query": {
      "fields": "count,role(id,name,permissions(permission(id)),included(role(id)))"
    },
    "body": "",
    "baselineResponse": {
      "count": 1,
      "role": [
        {
          "id": "FIXTURE_ROLE",
          "name": "Fixture role",
          "description": "Synthetic role",
          "permissions": {
            "permission": [
              {
                "id": "VIEW_PROJECT"
              }
            ]
          },
          "included": {
            "role": [
              {
                "id": "FIXTURE_CHILD"
              }
            ]
          }
        }
      ]
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "id": "FIXTURE_ROLE",
          "name": "Fixture role",
          "permissions": {
            "permission": [
              {
                "id": "VIEW_PROJECT"
              }
            ]
          },
          "included": {
            "role": [
              {
                "id": "FIXTURE_CHILD"
              }
            ]
          }
        }
      ]
    },
    "human": "id: FIXTURE_ROLE\nname: Fixture role\npermissions:\n  permission:\n    -\n      id: VIEW_PROJECT\nincluded:\n  role:\n    -\n      id: FIXTURE_CHILD\n\ncount: 1\n",
    "stderr": ""
  },
  {
    "name": "roles show FIXTURE_ROLE",
    "argv": [
      "roles",
      "show",
      "FIXTURE_ROLE"
    ],
    "method": "GET",
    "path": "/app/rest/roles/id:FIXTURE_ROLE",
    "query": {
      "fields": "id,name,permissions(permission(id)),included(role(id))"
    },
    "body": "",
    "baselineResponse": {
      "id": "FIXTURE_ROLE",
      "name": "Fixture role",
      "description": "Synthetic role",
      "permissions": {
        "permission": [
          {
            "id": "VIEW_PROJECT"
          }
        ]
      },
      "included": {
        "role": [
          {
            "id": "FIXTURE_CHILD"
          }
        ]
      }
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "baselineResult": {
      "id": "FIXTURE_ROLE",
      "name": "Fixture role",
      "permissions": {
        "permission": [
          {
            "id": "VIEW_PROJECT"
          }
        ]
      },
      "included": {
        "role": [
          {
            "id": "FIXTURE_CHILD"
          }
        ]
      }
    },
    "human": "id: FIXTURE_ROLE\nname: Fixture role\npermissions:\n  permission:\n    -\n      id: VIEW_PROJECT\nincluded:\n  role:\n    -\n      id: FIXTURE_CHILD\n",
    "stderr": ""
  },
  {
    "name": "roles create --name Fixture role --permission VIEW_PROJECT --include FIXTURE_CHILD",
    "argv": [
      "roles",
      "create",
      "--name",
      "Fixture role",
      "--permission",
      "VIEW_PROJECT",
      "--include",
      "FIXTURE_CHILD"
    ],
    "method": "POST",
    "path": "/app/rest/roles",
    "query": {
      "fields": "id,name,permissions(permission(id)),included(role(id))"
    },
    "body": "{\"name\":\"Fixture role\",\"permissions\":{\"permission\":[{\"id\":\"VIEW_PROJECT\"}]},\"included\":{\"role\":[{\"id\":\"FIXTURE_CHILD\"}]}}",
    "baselineResponse": {
      "id": "FIXTURE_ROLE",
      "name": "Fixture role",
      "description": "Synthetic role",
      "permissions": {
        "permission": [
          {
            "id": "VIEW_PROJECT"
          }
        ]
      },
      "included": {
        "role": [
          {
            "id": "FIXTURE_CHILD"
          }
        ]
      }
    },
    "collection": "",
    "permission": "Admin",
    "preflight": null,
    "baselineResult": {
      "id": "FIXTURE_ROLE",
      "name": "Fixture role",
      "permissions": {
        "permission": [
          {
            "id": "VIEW_PROJECT"
          }
        ]
      },
      "included": {
        "role": [
          {
            "id": "FIXTURE_CHILD"
          }
        ]
      }
    },
    "human": "id: FIXTURE_ROLE\nname: Fixture role\npermissions:\n  permission:\n    -\n      id: VIEW_PROJECT\nincluded:\n  role:\n    -\n      id: FIXTURE_CHILD\n",
    "stderr": ""
  },
  {
    "name": "roles included add FIXTURE_ROLE FIXTURE_CHILD",
    "argv": [
      "roles",
      "included",
      "add",
      "FIXTURE_ROLE",
      "FIXTURE_CHILD"
    ],
    "method": "PUT",
    "path": "/app/rest/roles/id:FIXTURE_ROLE/included/FIXTURE_CHILD",
    "query": {
      "fields": "id,name,permissions(permission(id)),included(role(id))"
    },
    "body": "",
    "baselineResponse": {
      "id": "FIXTURE_ROLE",
      "name": "Fixture role",
      "description": "Synthetic role",
      "permissions": {
        "permission": [
          {
            "id": "VIEW_PROJECT"
          }
        ]
      },
      "included": {
        "role": [
          {
            "id": "FIXTURE_CHILD"
          }
        ]
      }
    },
    "collection": "",
    "permission": "Admin",
    "preflight": null,
    "baselineResult": {
      "id": "FIXTURE_ROLE",
      "name": "Fixture role",
      "permissions": {
        "permission": [
          {
            "id": "VIEW_PROJECT"
          }
        ]
      },
      "included": {
        "role": [
          {
            "id": "FIXTURE_CHILD"
          }
        ]
      }
    },
    "human": "id: FIXTURE_ROLE\nname: Fixture role\npermissions:\n  permission:\n    -\n      id: VIEW_PROJECT\nincluded:\n  role:\n    -\n      id: FIXTURE_CHILD\n",
    "stderr": ""
  },
  {
    "name": "roles included remove FIXTURE_ROLE FIXTURE_CHILD",
    "argv": [
      "roles",
      "included",
      "remove",
      "FIXTURE_ROLE",
      "FIXTURE_CHILD"
    ],
    "method": "DELETE",
    "path": "/app/rest/roles/id:FIXTURE_ROLE/included/FIXTURE_CHILD",
    "query": {
      "fields": "id,name,permissions(permission(id)),included(role(id))"
    },
    "body": "",
    "baselineResponse": {
      "id": "FIXTURE_ROLE",
      "name": "Fixture role",
      "description": "Synthetic role",
      "permissions": {
        "permission": [
          {
            "id": "VIEW_PROJECT"
          }
        ]
      },
      "included": {
        "role": [
          {
            "id": "FIXTURE_CHILD"
          }
        ]
      }
    },
    "collection": "",
    "permission": "Admin",
    "preflight": null,
    "baselineResult": {
      "id": "FIXTURE_ROLE",
      "name": "Fixture role",
      "permissions": {
        "permission": [
          {
            "id": "VIEW_PROJECT"
          }
        ]
      },
      "included": {
        "role": [
          {
            "id": "FIXTURE_CHILD"
          }
        ]
      }
    },
    "human": "id: FIXTURE_ROLE\nname: Fixture role\npermissions:\n  permission:\n    -\n      id: VIEW_PROJECT\nincluded:\n  role:\n    -\n      id: FIXTURE_CHILD\n",
    "stderr": ""
  },
  {
    "name": "roles permissions add FIXTURE_ROLE FIXTURE_CHILD",
    "argv": [
      "roles",
      "permissions",
      "add",
      "FIXTURE_ROLE",
      "FIXTURE_CHILD"
    ],
    "method": "PUT",
    "path": "/app/rest/roles/id:FIXTURE_ROLE/permissions/FIXTURE_CHILD",
    "query": {
      "fields": "id,name,permissions(permission(id)),included(role(id))"
    },
    "body": "",
    "baselineResponse": {
      "id": "FIXTURE_ROLE",
      "name": "Fixture role",
      "description": "Synthetic role",
      "permissions": {
        "permission": [
          {
            "id": "VIEW_PROJECT"
          }
        ]
      },
      "included": {
        "role": [
          {
            "id": "FIXTURE_CHILD"
          }
        ]
      }
    },
    "collection": "",
    "permission": "Admin",
    "preflight": null,
    "baselineResult": {
      "id": "FIXTURE_ROLE",
      "name": "Fixture role",
      "permissions": {
        "permission": [
          {
            "id": "VIEW_PROJECT"
          }
        ]
      },
      "included": {
        "role": [
          {
            "id": "FIXTURE_CHILD"
          }
        ]
      }
    },
    "human": "id: FIXTURE_ROLE\nname: Fixture role\npermissions:\n  permission:\n    -\n      id: VIEW_PROJECT\nincluded:\n  role:\n    -\n      id: FIXTURE_CHILD\n",
    "stderr": ""
  },
  {
    "name": "roles permissions remove FIXTURE_ROLE FIXTURE_CHILD",
    "argv": [
      "roles",
      "permissions",
      "remove",
      "FIXTURE_ROLE",
      "FIXTURE_CHILD"
    ],
    "method": "DELETE",
    "path": "/app/rest/roles/id:FIXTURE_ROLE/permissions/FIXTURE_CHILD",
    "query": {
      "fields": "id,name,permissions(permission(id)),included(role(id))"
    },
    "body": "",
    "baselineResponse": {
      "id": "FIXTURE_ROLE",
      "name": "Fixture role",
      "description": "Synthetic role",
      "permissions": {
        "permission": [
          {
            "id": "VIEW_PROJECT"
          }
        ]
      },
      "included": {
        "role": [
          {
            "id": "FIXTURE_CHILD"
          }
        ]
      }
    },
    "collection": "",
    "permission": "Admin",
    "preflight": null,
    "baselineResult": {
      "id": "FIXTURE_ROLE",
      "name": "Fixture role",
      "permissions": {
        "permission": [
          {
            "id": "VIEW_PROJECT"
          }
        ]
      },
      "included": {
        "role": [
          {
            "id": "FIXTURE_CHILD"
          }
        ]
      }
    },
    "human": "id: FIXTURE_ROLE\nname: Fixture role\npermissions:\n  permission:\n    -\n      id: VIEW_PROJECT\nincluded:\n  role:\n    -\n      id: FIXTURE_CHILD\n",
    "stderr": ""
  }
];
