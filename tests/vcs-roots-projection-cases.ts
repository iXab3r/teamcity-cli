import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "vcs roots list --limit 2 --start 3 --project Demo",
    "argv": [
      "vcs",
      "roots",
      "list",
      "--limit",
      "2",
      "--start",
      "3",
      "--project",
      "Demo"
    ],
    "baselineResponse": {
      "id": "Demo",
      "name": "Demo",
      "vcsName": "jetbrains.git",
      "project": {
        "id": "Demo"
      },
      "properties": {
        "property": [
          {
            "name": "mode",
            "value": "test"
          }
        ]
      },
      "extra": "drop",
      "vcs-root": [
        {
          "id": "Demo",
          "name": "Demo",
          "vcsName": "jetbrains.git",
          "project": {
            "id": "Demo"
          },
          "properties": {
            "property": [
              {
                "name": "mode",
                "value": "test"
              }
            ]
          },
          "extra": "drop"
        }
      ],
      "vcs-root-instance": [
        {
          "id": "Demo",
          "name": "Demo",
          "vcsName": "jetbrains.git",
          "project": {
            "id": "Demo"
          },
          "properties": {
            "property": [
              {
                "name": "mode",
                "value": "test"
              }
            ]
          },
          "extra": "drop"
        }
      ],
      "property": [
        {
          "name": "mode",
          "value": "test"
        }
      ]
    },
    "collection": "vcs-root",
    "permission": "ReadOnly",
    "preflight": null,
    "method": "GET",
    "path": "/app/rest/vcs-roots",
    "query": {
      "locator": "project:(id:Demo),start:3,count:3",
      "fields": "nextHref,vcs-root(id,name,vcsName,project(id,name))"
    },
    "body": "",
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "id": "Demo",
          "name": "Demo",
          "vcsName": "jetbrains.git",
          "project": {
            "id": "Demo"
          }
        }
      ],
      "hasMore": false,
      "nextStart": null
    },
    "human": "id: Demo\nname: Demo\nvcsName: jetbrains.git\nproject:\n  id: Demo\n\ncount: 1  hasMore: false  nextStart: null\n",
    "stderr": ""
  },
  {
    "name": "vcs roots show Demo",
    "argv": [
      "vcs",
      "roots",
      "show",
      "Demo"
    ],
    "baselineResponse": {
      "id": "Demo",
      "name": "Demo",
      "vcsName": "jetbrains.git",
      "project": {
        "id": "Demo"
      },
      "properties": {
        "property": [
          {
            "name": "mode",
            "value": "test"
          }
        ]
      },
      "extra": "drop",
      "vcs-root": [
        {
          "id": "Demo",
          "name": "Demo",
          "vcsName": "jetbrains.git",
          "project": {
            "id": "Demo"
          },
          "properties": {
            "property": [
              {
                "name": "mode",
                "value": "test"
              }
            ]
          },
          "extra": "drop"
        }
      ],
      "vcs-root-instance": [
        {
          "id": "Demo",
          "name": "Demo",
          "vcsName": "jetbrains.git",
          "project": {
            "id": "Demo"
          },
          "properties": {
            "property": [
              {
                "name": "mode",
                "value": "test"
              }
            ]
          },
          "extra": "drop"
        }
      ],
      "property": [
        {
          "name": "mode",
          "value": "test"
        }
      ]
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "method": "GET",
    "path": "/app/rest/vcs-roots/id:Demo",
    "query": {
      "fields": "id,name,vcsName,project(id,name)"
    },
    "body": "",
    "baselineResult": {
      "id": "Demo",
      "name": "Demo",
      "vcsName": "jetbrains.git",
      "project": {
        "id": "Demo"
      }
    },
    "human": "id: Demo\nname: Demo\nvcsName: jetbrains.git\nproject:\n  id: Demo\n",
    "stderr": ""
  },
  {
    "name": "vcs roots instances Demo",
    "argv": [
      "vcs",
      "roots",
      "instances",
      "Demo"
    ],
    "baselineResponse": {
      "id": "Demo",
      "name": "Demo",
      "vcsName": "jetbrains.git",
      "project": {
        "id": "Demo"
      },
      "properties": {
        "property": [
          {
            "name": "mode",
            "value": "test"
          }
        ]
      },
      "extra": "drop",
      "vcs-root": [
        {
          "id": "Demo",
          "name": "Demo",
          "vcsName": "jetbrains.git",
          "project": {
            "id": "Demo"
          },
          "properties": {
            "property": [
              {
                "name": "mode",
                "value": "test"
              }
            ]
          },
          "extra": "drop"
        }
      ],
      "vcs-root-instance": [
        {
          "id": "Demo",
          "name": "Demo",
          "vcsName": "jetbrains.git",
          "project": {
            "id": "Demo"
          },
          "properties": {
            "property": [
              {
                "name": "mode",
                "value": "test"
              }
            ]
          },
          "extra": "drop"
        }
      ],
      "property": [
        {
          "name": "mode",
          "value": "test"
        }
      ]
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "method": "GET",
    "path": "/app/rest/vcs-roots/id:Demo/instances",
    "query": {
      "fields": "count,vcs-root-instance(id,name,vcs-root-id,vcsName,modificationCheckInterval,commitHookMode)"
    },
    "body": "",
    "baselineResult": [
      {
        "id": "Demo",
        "name": "Demo",
        "vcsName": "jetbrains.git"
      }
    ],
    "human": "id    name  vcsName\n----  ----  -------------\nDemo  Demo  jetbrains.git\n",
    "stderr": ""
  },
  {
    "name": "vcs roots properties list Demo",
    "argv": [
      "vcs",
      "roots",
      "properties",
      "list",
      "Demo"
    ],
    "baselineResponse": {
      "id": "Demo",
      "name": "Demo",
      "vcsName": "jetbrains.git",
      "project": {
        "id": "Demo"
      },
      "properties": {
        "property": [
          {
            "name": "mode",
            "value": "test"
          }
        ]
      },
      "extra": "drop",
      "vcs-root": [
        {
          "id": "Demo",
          "name": "Demo",
          "vcsName": "jetbrains.git",
          "project": {
            "id": "Demo"
          },
          "properties": {
            "property": [
              {
                "name": "mode",
                "value": "test"
              }
            ]
          },
          "extra": "drop"
        }
      ],
      "vcs-root-instance": [
        {
          "id": "Demo",
          "name": "Demo",
          "vcsName": "jetbrains.git",
          "project": {
            "id": "Demo"
          },
          "properties": {
            "property": [
              {
                "name": "mode",
                "value": "test"
              }
            ]
          },
          "extra": "drop"
        }
      ],
      "property": [
        {
          "name": "mode",
          "value": "test"
        }
      ]
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "method": "GET",
    "path": "/app/rest/vcs-roots/id:Demo/properties",
    "query": {
      "fields": "count,property(name)"
    },
    "body": "",
    "baselineResult": [
      "mode"
    ],
    "human": "mode\n",
    "stderr": ""
  },
  {
    "name": "vcs roots create Demo --name Demo --project Demo --url https://example.test/repo.git --branch refs/heads/main",
    "argv": [
      "vcs",
      "roots",
      "create",
      "Demo",
      "--name",
      "Demo",
      "--project",
      "Demo",
      "--url",
      "https://example.test/repo.git",
      "--branch",
      "refs/heads/main"
    ],
    "baselineResponse": {
      "id": "Demo",
      "name": "Demo",
      "vcsName": "jetbrains.git",
      "project": {
        "id": "Demo"
      },
      "properties": {
        "property": [
          {
            "name": "mode",
            "value": "test"
          }
        ]
      },
      "extra": "drop",
      "vcs-root": [
        {
          "id": "Demo",
          "name": "Demo",
          "vcsName": "jetbrains.git",
          "project": {
            "id": "Demo"
          },
          "properties": {
            "property": [
              {
                "name": "mode",
                "value": "test"
              }
            ]
          },
          "extra": "drop"
        }
      ],
      "vcs-root-instance": [
        {
          "id": "Demo",
          "name": "Demo",
          "vcsName": "jetbrains.git",
          "project": {
            "id": "Demo"
          },
          "properties": {
            "property": [
              {
                "name": "mode",
                "value": "test"
              }
            ]
          },
          "extra": "drop"
        }
      ],
      "property": [
        {
          "name": "mode",
          "value": "test"
        }
      ]
    },
    "collection": "",
    "permission": "Update",
    "preflight": null,
    "method": "POST",
    "path": "/app/rest/vcs-roots",
    "query": {
      "fields": "id,name,vcsName,project(id)"
    },
    "body": "{\"id\":\"Demo\",\"name\":\"Demo\",\"vcsName\":\"jetbrains.git\",\"project\":{\"id\":\"Demo\"},\"properties\":{\"property\":[{\"name\":\"authMethod\",\"value\":\"ANONYMOUS\"},{\"name\":\"branch\",\"value\":\"refs/heads/main\"},{\"name\":\"url\",\"value\":\"https://example.test/repo.git\"}]}}",
    "baselineResult": {
      "id": "Demo",
      "name": "Demo",
      "vcsName": "jetbrains.git",
      "project": {
        "id": "Demo"
      }
    },
    "human": "id: Demo\nname: Demo\nvcsName: jetbrains.git\nproject:\n  id: Demo\n",
    "stderr": ""
  },
  {
    "name": "vcs roots properties replace Demo --property mode=test",
    "argv": [
      "vcs",
      "roots",
      "properties",
      "replace",
      "Demo",
      "--property",
      "mode=test"
    ],
    "baselineResponse": {
      "id": "Demo",
      "name": "Demo",
      "vcsName": "jetbrains.git",
      "project": {
        "id": "Demo"
      },
      "properties": {
        "property": [
          {
            "name": "mode",
            "value": "test"
          }
        ]
      },
      "extra": "drop",
      "vcs-root": [
        {
          "id": "Demo",
          "name": "Demo",
          "vcsName": "jetbrains.git",
          "project": {
            "id": "Demo"
          },
          "properties": {
            "property": [
              {
                "name": "mode",
                "value": "test"
              }
            ]
          },
          "extra": "drop"
        }
      ],
      "vcs-root-instance": [
        {
          "id": "Demo",
          "name": "Demo",
          "vcsName": "jetbrains.git",
          "project": {
            "id": "Demo"
          },
          "properties": {
            "property": [
              {
                "name": "mode",
                "value": "test"
              }
            ]
          },
          "extra": "drop"
        }
      ],
      "property": [
        {
          "name": "mode",
          "value": "test"
        }
      ]
    },
    "collection": "",
    "permission": "Update",
    "preflight": null,
    "method": "PUT",
    "path": "/app/rest/vcs-roots/id:Demo/properties",
    "query": {
      "fields": "count,property(name)"
    },
    "body": "{\"property\":[{\"name\":\"mode\",\"value\":\"test\"}]}",
    "baselineResult": [
      "mode"
    ],
    "human": "mode\n",
    "stderr": ""
  }
];
