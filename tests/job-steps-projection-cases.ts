import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "jobs steps list Example_Build",
    "argv": [
      "jobs",
      "steps",
      "list",
      "Example_Build"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/steps",
    "query": {
      "fields": "step(id,name,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))))"
    },
    "body": "",
    "baselineResponse": {
      "step": [
        {
          "id": "RUNNER_1",
          "name": "Echo",
          "type": "simpleRunner",
          "properties": {
            "property": [
              {
                "name": "script.content",
                "value": "echo a=b"
              },
              {
                "name": "use.custom.script",
                "value": "true"
              }
            ]
          },
          "disabled": false
        }
      ]
    },
    "baselineResult": [
      {
        "id": "RUNNER_1",
        "name": "Echo",
        "type": "simpleRunner",
        "disabled": false,
        "properties": [
          {
            "name": "script.content",
            "type": "plain",
            "redacted": false,
            "value": "echo a=b"
          },
          {
            "name": "use.custom.script",
            "type": "plain",
            "redacted": false,
            "value": "true"
          }
        ]
      }
    ],
    "human": "id: RUNNER_1\nname: Echo\ntype: simpleRunner\ndisabled: false\nproperties:\n  -\n    name: script.content\n    type: plain\n    redacted: false\n    value: echo a=b\n  -\n    name: use.custom.script\n    type: plain\n    redacted: false\n    value: true\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs steps create Example_Build --name Echo --type simpleRunner --property script.content=echo a=b --property use.custom.script=true",
    "argv": [
      "jobs",
      "steps",
      "create",
      "Example_Build",
      "--name",
      "Echo",
      "--type",
      "simpleRunner",
      "--property",
      "script.content=echo a=b",
      "--property",
      "use.custom.script=true"
    ],
    "method": "POST",
    "path": "/app/rest/buildTypes/id:Example_Build/steps",
    "query": {
      "fields": "id,name,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue)))"
    },
    "body": "{\"name\":\"Echo\",\"type\":\"simpleRunner\",\"properties\":{\"property\":[{\"name\":\"script.content\",\"value\":\"echo a=b\"},{\"name\":\"use.custom.script\",\"value\":\"true\"}]}}",
    "baselineResponse": {
      "id": "RUNNER_1",
      "name": "Echo",
      "type": "simpleRunner",
      "properties": {
        "property": [
          {
            "name": "script.content",
            "value": "echo a=b"
          },
          {
            "name": "use.custom.script",
            "value": "true"
          }
        ]
      },
      "disabled": false
    },
    "baselineResult": {
      "id": "RUNNER_1",
      "name": "Echo",
      "type": "simpleRunner",
      "disabled": false,
      "properties": [
        {
          "name": "script.content",
          "type": "plain",
          "redacted": false,
          "value": "echo a=b"
        },
        {
          "name": "use.custom.script",
          "type": "plain",
          "redacted": false,
          "value": "true"
        }
      ]
    },
    "human": "id: RUNNER_1\nname: Echo\ntype: simpleRunner\ndisabled: false\nproperties:\n  -\n    name: script.content\n    type: plain\n    redacted: false\n    value: echo a=b\n  -\n    name: use.custom.script\n    type: plain\n    redacted: false\n    value: true\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs steps show Example_Build RUNNER_1",
    "argv": [
      "jobs",
      "steps",
      "show",
      "Example_Build",
      "RUNNER_1"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/steps/RUNNER_1",
    "query": {
      "fields": "id,name,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue)))"
    },
    "body": "",
    "baselineResponse": {
      "id": "RUNNER_1",
      "name": "Echo",
      "type": "simpleRunner",
      "properties": {
        "property": [
          {
            "name": "script.content",
            "value": "echo a=b"
          },
          {
            "name": "use.custom.script",
            "value": "true"
          }
        ]
      },
      "disabled": false
    },
    "baselineResult": {
      "id": "RUNNER_1",
      "name": "Echo",
      "type": "simpleRunner",
      "disabled": false,
      "properties": [
        {
          "name": "script.content",
          "type": "plain",
          "redacted": false,
          "value": "echo a=b"
        },
        {
          "name": "use.custom.script",
          "type": "plain",
          "redacted": false,
          "value": "true"
        }
      ]
    },
    "human": "id: RUNNER_1\nname: Echo\ntype: simpleRunner\ndisabled: false\nproperties:\n  -\n    name: script.content\n    type: plain\n    redacted: false\n    value: echo a=b\n  -\n    name: use.custom.script\n    type: plain\n    redacted: false\n    value: true\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs steps replace Example_Build RUNNER_1 --name Echo --type simpleRunner --property script.content=echo a=b --property use.custom.script=true",
    "argv": [
      "jobs",
      "steps",
      "replace",
      "Example_Build",
      "RUNNER_1",
      "--name",
      "Echo",
      "--type",
      "simpleRunner",
      "--property",
      "script.content=echo a=b",
      "--property",
      "use.custom.script=true"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Example_Build/steps/RUNNER_1",
    "query": {
      "fields": "id,name,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue)))"
    },
    "body": "{\"name\":\"Echo\",\"type\":\"simpleRunner\",\"properties\":{\"property\":[{\"name\":\"script.content\",\"value\":\"echo a=b\"},{\"name\":\"use.custom.script\",\"value\":\"true\"}]}}",
    "baselineResponse": {
      "id": "RUNNER_1",
      "name": "Echo",
      "type": "simpleRunner",
      "properties": {
        "property": [
          {
            "name": "script.content",
            "value": "echo a=b"
          },
          {
            "name": "use.custom.script",
            "value": "true"
          }
        ]
      },
      "disabled": false
    },
    "baselineResult": {
      "id": "RUNNER_1",
      "name": "Echo",
      "type": "simpleRunner",
      "disabled": false,
      "properties": [
        {
          "name": "script.content",
          "type": "plain",
          "redacted": false,
          "value": "echo a=b"
        },
        {
          "name": "use.custom.script",
          "type": "plain",
          "redacted": false,
          "value": "true"
        }
      ]
    },
    "human": "id: RUNNER_1\nname: Echo\ntype: simpleRunner\ndisabled: false\nproperties:\n  -\n    name: script.content\n    type: plain\n    redacted: false\n    value: echo a=b\n  -\n    name: use.custom.script\n    type: plain\n    redacted: false\n    value: true\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs steps parameters list Example_Build Entity",
    "argv": [
      "jobs",
      "steps",
      "parameters",
      "list",
      "Example_Build",
      "Entity"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/steps/Entity/parameters",
    "query": {
      "fields": "property(name,value,inherited,type(rawValue))"
    },
    "body": "",
    "baselineResponse": {
      "property": [
        {
          "name": "example.setting",
          "value": "synthetic-hidden"
        }
      ]
    },
    "baselineResult": [
      {
        "name": "example.setting",
        "type": "plain",
        "redacted": false,
        "value": "synthetic-hidden"
      }
    ],
    "human": "name             type   redacted  value\n---------------  -----  --------  ----------------\nexample.setting  plain  false     synthetic-hidden\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs steps parameters replace Example_Build Entity --property example.setting=synthetic-hidden",
    "argv": [
      "jobs",
      "steps",
      "parameters",
      "replace",
      "Example_Build",
      "Entity",
      "--property",
      "example.setting=synthetic-hidden"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Example_Build/steps/Entity/parameters",
    "query": {
      "fields": "property(name,value,inherited,type(rawValue))"
    },
    "body": "{\"property\":[{\"name\":\"example.setting\",\"value\":\"synthetic-hidden\"}]}",
    "baselineResponse": {
      "property": [
        {
          "name": "example.setting",
          "value": "synthetic-hidden"
        }
      ]
    },
    "baselineResult": [
      {
        "name": "example.setting",
        "type": "plain",
        "redacted": true
      }
    ],
    "human": "name             type   redacted\n---------------  -----  --------\nexample.setting  plain  true\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs steps replace-all Build --item {\"name\":\"Echo\",\"type\":\"simpleRunner\"}",
    "argv": [
      "jobs",
      "steps",
      "replace-all",
      "Build",
      "--item",
      "{\"name\":\"Echo\",\"type\":\"simpleRunner\"}"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Build/steps",
    "query": {
      "fields": "step(id,name,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))))"
    },
    "body": "{\"step\":[{\"name\":\"Echo\",\"type\":\"simpleRunner\",\"properties\":{\"property\":[]}}]}",
    "baselineResponse": {
      "step": [
        {
          "id": "Runner",
          "name": "Echo",
          "type": "simpleRunner"
        }
      ]
    },
    "baselineResult": [
      {
        "id": "Runner",
        "name": "Echo",
        "type": "simpleRunner",
        "properties": []
      }
    ],
    "human": "id: Runner\nname: Echo\ntype: simpleRunner\nproperties: (empty list)\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  }
];
