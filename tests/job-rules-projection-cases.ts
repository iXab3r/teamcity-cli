import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "jobs agent-requirements list Example_Build",
    "argv": [
      "jobs",
      "agent-requirements",
      "list",
      "Example_Build"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/agent-requirements",
    "query": {
      "fields": "agent-requirement(id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))))"
    },
    "body": "",
    "baselineResponse": {
      "agent-requirement": [
        {
          "id": "Entity",
          "type": "equals",
          "disabled": false,
          "inherited": false,
          "source-buildType": {
            "id": "Upstream",
            "name": "Fixture"
          },
          "properties": {
            "property": [
              {
                "name": "fixture.setting",
                "value": "fixture"
              }
            ]
          }
        }
      ]
    },
    "baselineResult": [
      {
        "id": "Entity",
        "type": "equals",
        "disabled": false,
        "inherited": false,
        "properties": [
          {
            "name": "fixture.setting",
            "type": "plain",
            "redacted": false,
            "value": "fixture"
          }
        ],
        "source": {
          "id": "Upstream",
          "name": "Fixture"
        }
      }
    ],
    "human": "id: Entity\ntype: equals\ndisabled: false\ninherited: false\nproperties:\n  -\n    name: fixture.setting\n    type: plain\n    redacted: false\n    value: fixture\nsource:\n  id: Upstream\n  name: Fixture\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs agent-requirements show Example_Build Entity",
    "argv": [
      "jobs",
      "agent-requirements",
      "show",
      "Example_Build",
      "Entity"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/agent-requirements/id:Entity",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue)))"
    },
    "body": "",
    "baselineResponse": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "source-buildType": {
        "id": "Upstream",
        "name": "Fixture"
      },
      "properties": {
        "property": [
          {
            "name": "fixture.setting",
            "value": "fixture"
          }
        ]
      }
    },
    "baselineResult": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "properties": [
        {
          "name": "fixture.setting",
          "type": "plain",
          "redacted": false,
          "value": "fixture"
        }
      ],
      "source": {
        "id": "Upstream",
        "name": "Fixture"
      }
    },
    "human": "id: Entity\ntype: equals\ndisabled: false\ninherited: false\nproperties:\n  -\n    name: fixture.setting\n    type: plain\n    redacted: false\n    value: fixture\nsource:\n  id: Upstream\n  name: Fixture\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs agent-requirements create Example_Build --type equals --parameter system.os --value fixture",
    "argv": [
      "jobs",
      "agent-requirements",
      "create",
      "Example_Build",
      "--type",
      "equals",
      "--parameter",
      "system.os",
      "--value",
      "fixture"
    ],
    "method": "POST",
    "path": "/app/rest/buildTypes/id:Example_Build/agent-requirements",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue)))"
    },
    "body": "{\"type\":\"equals\",\"properties\":{\"property\":[{\"name\":\"property-name\",\"value\":\"system.os\"},{\"name\":\"property-value\",\"value\":\"fixture\"}]}}",
    "baselineResponse": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "source-buildType": {
        "id": "Upstream",
        "name": "Fixture"
      },
      "properties": {
        "property": [
          {
            "name": "fixture.setting",
            "value": "fixture"
          }
        ]
      }
    },
    "baselineResult": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "properties": [
        {
          "name": "fixture.setting",
          "type": "plain",
          "redacted": false,
          "value": "fixture"
        }
      ],
      "source": {
        "id": "Upstream",
        "name": "Fixture"
      }
    },
    "human": "id: Entity\ntype: equals\ndisabled: false\ninherited: false\nproperties:\n  -\n    name: fixture.setting\n    type: plain\n    redacted: false\n    value: fixture\nsource:\n  id: Upstream\n  name: Fixture\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs agent-requirements replace Example_Build Entity --type equals --parameter system.os --value fixture",
    "argv": [
      "jobs",
      "agent-requirements",
      "replace",
      "Example_Build",
      "Entity",
      "--type",
      "equals",
      "--parameter",
      "system.os",
      "--value",
      "fixture"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Example_Build/agent-requirements/id:Entity",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue)))"
    },
    "body": "{\"type\":\"equals\",\"properties\":{\"property\":[{\"name\":\"property-name\",\"value\":\"system.os\"},{\"name\":\"property-value\",\"value\":\"fixture\"}]}}",
    "baselineResponse": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "source-buildType": {
        "id": "Upstream",
        "name": "Fixture"
      },
      "properties": {
        "property": [
          {
            "name": "fixture.setting",
            "value": "fixture"
          }
        ]
      }
    },
    "baselineResult": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "properties": [
        {
          "name": "fixture.setting",
          "type": "plain",
          "redacted": false,
          "value": "fixture"
        }
      ],
      "source": {
        "id": "Upstream",
        "name": "Fixture"
      }
    },
    "human": "id: Entity\ntype: equals\ndisabled: false\ninherited: false\nproperties:\n  -\n    name: fixture.setting\n    type: plain\n    redacted: false\n    value: fixture\nsource:\n  id: Upstream\n  name: Fixture\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs agent-requirements replace-all Example_Build --item {\"type\":\"equals\",\"parameter\":\"system.os\",\"value\":\"fixture\"}",
    "argv": [
      "jobs",
      "agent-requirements",
      "replace-all",
      "Example_Build",
      "--item",
      "{\"type\":\"equals\",\"parameter\":\"system.os\",\"value\":\"fixture\"}"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Example_Build/agent-requirements",
    "query": {
      "fields": "agent-requirement(id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))))"
    },
    "body": "{\"agent-requirement\":[{\"type\":\"equals\",\"properties\":{\"property\":[{\"name\":\"property-name\",\"value\":\"system.os\"},{\"name\":\"property-value\",\"value\":\"fixture\"}]}}]}",
    "baselineResponse": {
      "agent-requirement": [
        {
          "id": "Entity",
          "type": "equals",
          "disabled": false,
          "inherited": false,
          "source-buildType": {
            "id": "Upstream",
            "name": "Fixture"
          },
          "properties": {
            "property": [
              {
                "name": "fixture.setting",
                "value": "fixture"
              }
            ]
          }
        }
      ]
    },
    "baselineResult": [
      {
        "id": "Entity",
        "type": "equals",
        "disabled": false,
        "inherited": false,
        "properties": [
          {
            "name": "fixture.setting",
            "type": "plain",
            "redacted": false,
            "value": "fixture"
          }
        ]
      }
    ],
    "human": "id: Entity\ntype: equals\ndisabled: false\ninherited: false\nproperties:\n  -\n    name: fixture.setting\n    type: plain\n    redacted: false\n    value: fixture\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs artifact-dependencies list Example_Build",
    "argv": [
      "jobs",
      "artifact-dependencies",
      "list",
      "Example_Build"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/artifact-dependencies",
    "query": {
      "fields": "artifact-dependency(id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))),source-buildType(id,name,projectId))"
    },
    "body": "",
    "baselineResponse": {
      "artifact-dependencie": [
        {
          "id": "Entity",
          "type": "equals",
          "disabled": false,
          "inherited": false,
          "source-buildType": {
            "id": "Upstream",
            "name": "Fixture"
          },
          "properties": {
            "property": [
              {
                "name": "fixture.setting",
                "value": "fixture"
              }
            ]
          }
        }
      ]
    },
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs artifact-dependencies show Example_Build Entity",
    "argv": [
      "jobs",
      "artifact-dependencies",
      "show",
      "Example_Build",
      "Entity"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/artifact-dependencies/id:Entity",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))),source-buildType(id,name,projectId)"
    },
    "body": "",
    "baselineResponse": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "source-buildType": {
        "id": "Upstream",
        "name": "Fixture"
      },
      "properties": {
        "property": [
          {
            "name": "fixture.setting",
            "value": "fixture"
          }
        ]
      }
    },
    "baselineResult": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "properties": [
        {
          "name": "fixture.setting",
          "type": "plain",
          "redacted": false,
          "value": "fixture"
        }
      ],
      "source": {
        "id": "Upstream",
        "name": "Fixture"
      }
    },
    "human": "id: Entity\ntype: equals\ndisabled: false\ninherited: false\nproperties:\n  -\n    name: fixture.setting\n    type: plain\n    redacted: false\n    value: fixture\nsource:\n  id: Upstream\n  name: Fixture\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs artifact-dependencies create Example_Build --source Upstream --rules *.zip --revision lastSuccessful",
    "argv": [
      "jobs",
      "artifact-dependencies",
      "create",
      "Example_Build",
      "--source",
      "Upstream",
      "--rules",
      "*.zip",
      "--revision",
      "lastSuccessful"
    ],
    "method": "POST",
    "path": "/app/rest/buildTypes/id:Example_Build/artifact-dependencies",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))),source-buildType(id,name,projectId)"
    },
    "body": "{\"type\":\"artifact_dependency\",\"source-buildType\":{\"id\":\"Upstream\"},\"properties\":{\"property\":[{\"name\":\"pathRules\",\"value\":\"*.zip\"},{\"name\":\"revisionName\",\"value\":\"lastSuccessful\"}]}}",
    "baselineResponse": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "source-buildType": {
        "id": "Upstream",
        "name": "Fixture"
      },
      "properties": {
        "property": [
          {
            "name": "fixture.setting",
            "value": "fixture"
          }
        ]
      }
    },
    "baselineResult": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "properties": [
        {
          "name": "fixture.setting",
          "type": "plain",
          "redacted": false,
          "value": "fixture"
        }
      ],
      "source": {
        "id": "Upstream",
        "name": "Fixture"
      }
    },
    "human": "id: Entity\ntype: equals\ndisabled: false\ninherited: false\nproperties:\n  -\n    name: fixture.setting\n    type: plain\n    redacted: false\n    value: fixture\nsource:\n  id: Upstream\n  name: Fixture\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs artifact-dependencies replace Example_Build Entity --source Upstream --rules *.zip --revision lastSuccessful",
    "argv": [
      "jobs",
      "artifact-dependencies",
      "replace",
      "Example_Build",
      "Entity",
      "--source",
      "Upstream",
      "--rules",
      "*.zip",
      "--revision",
      "lastSuccessful"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Example_Build/artifact-dependencies/id:Entity",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))),source-buildType(id,name,projectId)"
    },
    "body": "{\"type\":\"artifact_dependency\",\"source-buildType\":{\"id\":\"Upstream\"},\"properties\":{\"property\":[{\"name\":\"pathRules\",\"value\":\"*.zip\"},{\"name\":\"revisionName\",\"value\":\"lastSuccessful\"}]}}",
    "baselineResponse": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "source-buildType": {
        "id": "Upstream",
        "name": "Fixture"
      },
      "properties": {
        "property": [
          {
            "name": "fixture.setting",
            "value": "fixture"
          }
        ]
      }
    },
    "baselineResult": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "properties": [
        {
          "name": "fixture.setting",
          "type": "plain",
          "redacted": false,
          "value": "fixture"
        }
      ],
      "source": {
        "id": "Upstream",
        "name": "Fixture"
      }
    },
    "human": "id: Entity\ntype: equals\ndisabled: false\ninherited: false\nproperties:\n  -\n    name: fixture.setting\n    type: plain\n    redacted: false\n    value: fixture\nsource:\n  id: Upstream\n  name: Fixture\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs artifact-dependencies replace-all Example_Build --item {\"source\":\"Upstream\",\"rules\":\"*.zip\",\"revision\":\"lastSuccessful\"}",
    "argv": [
      "jobs",
      "artifact-dependencies",
      "replace-all",
      "Example_Build",
      "--item",
      "{\"source\":\"Upstream\",\"rules\":\"*.zip\",\"revision\":\"lastSuccessful\"}"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Example_Build/artifact-dependencies",
    "query": {
      "fields": "artifact-dependency(id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))),source-buildType(id,name,projectId))"
    },
    "body": "{\"artifact-dependency\":[{\"type\":\"artifact_dependency\",\"source-buildType\":{\"id\":\"Upstream\"},\"properties\":{\"property\":[{\"name\":\"pathRules\",\"value\":\"*.zip\"},{\"name\":\"revisionName\",\"value\":\"lastSuccessful\"}]}}]}",
    "baselineResponse": {
      "artifact-dependencie": [
        {
          "id": "Entity",
          "type": "equals",
          "disabled": false,
          "inherited": false,
          "source-buildType": {
            "id": "Upstream",
            "name": "Fixture"
          },
          "properties": {
            "property": [
              {
                "name": "fixture.setting",
                "value": "fixture"
              }
            ]
          }
        }
      ]
    },
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs snapshot-dependencies list Example_Build",
    "argv": [
      "jobs",
      "snapshot-dependencies",
      "list",
      "Example_Build"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/snapshot-dependencies",
    "query": {
      "fields": "snapshot-dependency(id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))),source-buildType(id,name,projectId))"
    },
    "body": "",
    "baselineResponse": {
      "snapshot-dependencie": [
        {
          "id": "Entity",
          "type": "equals",
          "disabled": false,
          "inherited": false,
          "source-buildType": {
            "id": "Upstream",
            "name": "Fixture"
          },
          "properties": {
            "property": [
              {
                "name": "fixture.setting",
                "value": "fixture"
              }
            ]
          }
        }
      ]
    },
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs snapshot-dependencies show Example_Build Entity",
    "argv": [
      "jobs",
      "snapshot-dependencies",
      "show",
      "Example_Build",
      "Entity"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/snapshot-dependencies/Entity",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))),source-buildType(id,name,projectId)"
    },
    "body": "",
    "baselineResponse": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "source-buildType": {
        "id": "Upstream",
        "name": "Fixture"
      },
      "properties": {
        "property": [
          {
            "name": "fixture.setting",
            "value": "fixture"
          }
        ]
      }
    },
    "baselineResult": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "properties": [
        {
          "name": "fixture.setting",
          "type": "plain",
          "redacted": false,
          "value": "fixture"
        }
      ],
      "source": {
        "id": "Upstream",
        "name": "Fixture"
      }
    },
    "human": "id: Entity\ntype: equals\ndisabled: false\ninherited: false\nproperties:\n  -\n    name: fixture.setting\n    type: plain\n    redacted: false\n    value: fixture\nsource:\n  id: Upstream\n  name: Fixture\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs snapshot-dependencies create Example_Build --source Upstream",
    "argv": [
      "jobs",
      "snapshot-dependencies",
      "create",
      "Example_Build",
      "--source",
      "Upstream"
    ],
    "method": "POST",
    "path": "/app/rest/buildTypes/id:Example_Build/snapshot-dependencies",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))),source-buildType(id,name,projectId)"
    },
    "body": "{\"type\":\"snapshot_dependency\",\"source-buildType\":{\"id\":\"Upstream\"}}",
    "baselineResponse": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "source-buildType": {
        "id": "Upstream",
        "name": "Fixture"
      },
      "properties": {
        "property": [
          {
            "name": "fixture.setting",
            "value": "fixture"
          }
        ]
      }
    },
    "baselineResult": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "properties": [
        {
          "name": "fixture.setting",
          "type": "plain",
          "redacted": false,
          "value": "fixture"
        }
      ],
      "source": {
        "id": "Upstream",
        "name": "Fixture"
      }
    },
    "human": "id: Entity\ntype: equals\ndisabled: false\ninherited: false\nproperties:\n  -\n    name: fixture.setting\n    type: plain\n    redacted: false\n    value: fixture\nsource:\n  id: Upstream\n  name: Fixture\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs snapshot-dependencies replace Example_Build Entity --source Upstream",
    "argv": [
      "jobs",
      "snapshot-dependencies",
      "replace",
      "Example_Build",
      "Entity",
      "--source",
      "Upstream"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Example_Build/snapshot-dependencies/Entity",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))),source-buildType(id,name,projectId)"
    },
    "body": "{\"type\":\"snapshot_dependency\",\"source-buildType\":{\"id\":\"Upstream\"}}",
    "baselineResponse": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "source-buildType": {
        "id": "Upstream",
        "name": "Fixture"
      },
      "properties": {
        "property": [
          {
            "name": "fixture.setting",
            "value": "fixture"
          }
        ]
      }
    },
    "baselineResult": {
      "id": "Entity",
      "type": "equals",
      "disabled": false,
      "inherited": false,
      "properties": [
        {
          "name": "fixture.setting",
          "type": "plain",
          "redacted": false,
          "value": "fixture"
        }
      ],
      "source": {
        "id": "Upstream",
        "name": "Fixture"
      }
    },
    "human": "id: Entity\ntype: equals\ndisabled: false\ninherited: false\nproperties:\n  -\n    name: fixture.setting\n    type: plain\n    redacted: false\n    value: fixture\nsource:\n  id: Upstream\n  name: Fixture\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs snapshot-dependencies replace-all Example_Build --item {\"source\":\"Upstream\",\"properties\":[]}",
    "argv": [
      "jobs",
      "snapshot-dependencies",
      "replace-all",
      "Example_Build",
      "--item",
      "{\"source\":\"Upstream\",\"properties\":[]}"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Example_Build/snapshot-dependencies",
    "query": {
      "fields": "snapshot-dependency(id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))),source-buildType(id,name,projectId))"
    },
    "body": "{\"snapshot-dependency\":[{\"type\":\"snapshot_dependency\",\"source-buildType\":{\"id\":\"Upstream\"},\"properties\":{\"property\":[]}}]}",
    "baselineResponse": {
      "snapshot-dependencie": [
        {
          "id": "Entity",
          "type": "equals",
          "disabled": false,
          "inherited": false,
          "source-buildType": {
            "id": "Upstream",
            "name": "Fixture"
          },
          "properties": {
            "property": [
              {
                "name": "fixture.setting",
                "value": "fixture"
              }
            ]
          }
        }
      ]
    },
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  }
];
