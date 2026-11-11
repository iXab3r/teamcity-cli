import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "jobs features list Example_Build",
    "argv": [
      "jobs",
      "features",
      "list",
      "Example_Build"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/features",
    "query": {
      "fields": "feature(id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))))"
    },
    "body": "",
    "baselineResponse": {
      "feature": [
        {
          "id": "FEATURE_1",
          "type": "swabra",
          "properties": {
            "property": [
              {
                "name": "example.setting",
                "value": "a=b"
              }
            ]
          },
          "inherited": false
        }
      ]
    },
    "baselineResult": [
      {
        "id": "FEATURE_1",
        "type": "swabra",
        "inherited": false,
        "properties": [
          {
            "name": "example.setting",
            "type": "plain",
            "redacted": false,
            "value": "a=b"
          }
        ]
      }
    ],
    "human": "id: FEATURE_1\ntype: swabra\ninherited: false\nproperties:\n  -\n    name: example.setting\n    type: plain\n    redacted: false\n    value: a=b\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs features show Example_Build FEATURE_1",
    "argv": [
      "jobs",
      "features",
      "show",
      "Example_Build",
      "FEATURE_1"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/features/FEATURE_1",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue)))"
    },
    "body": "",
    "baselineResponse": {
      "id": "FEATURE_1",
      "type": "swabra",
      "properties": {
        "property": [
          {
            "name": "example.setting",
            "value": "a=b"
          }
        ]
      },
      "inherited": false
    },
    "baselineResult": {
      "id": "FEATURE_1",
      "type": "swabra",
      "inherited": false,
      "properties": [
        {
          "name": "example.setting",
          "type": "plain",
          "redacted": false,
          "value": "a=b"
        }
      ]
    },
    "human": "id: FEATURE_1\ntype: swabra\ninherited: false\nproperties:\n  -\n    name: example.setting\n    type: plain\n    redacted: false\n    value: a=b\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs features create Example_Build --type swabra --property example.setting=a=b",
    "argv": [
      "jobs",
      "features",
      "create",
      "Example_Build",
      "--type",
      "swabra",
      "--property",
      "example.setting=a=b"
    ],
    "method": "POST",
    "path": "/app/rest/buildTypes/id:Example_Build/features",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue)))"
    },
    "body": "{\"type\":\"swabra\",\"properties\":{\"property\":[{\"name\":\"example.setting\",\"value\":\"a=b\"}]}}",
    "baselineResponse": {
      "id": "FEATURE_1",
      "type": "swabra",
      "properties": {
        "property": [
          {
            "name": "example.setting",
            "value": "a=b"
          }
        ]
      },
      "inherited": false
    },
    "baselineResult": {
      "id": "FEATURE_1",
      "type": "swabra",
      "inherited": false,
      "properties": [
        {
          "name": "example.setting",
          "type": "plain",
          "redacted": false,
          "value": "a=b"
        }
      ]
    },
    "human": "id: FEATURE_1\ntype: swabra\ninherited: false\nproperties:\n  -\n    name: example.setting\n    type: plain\n    redacted: false\n    value: a=b\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs features replace Example_Build FEATURE_1 --type swabra --property example.setting=a=b",
    "argv": [
      "jobs",
      "features",
      "replace",
      "Example_Build",
      "FEATURE_1",
      "--type",
      "swabra",
      "--property",
      "example.setting=a=b"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Example_Build/features/FEATURE_1",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue)))"
    },
    "body": "{\"type\":\"swabra\",\"properties\":{\"property\":[{\"name\":\"example.setting\",\"value\":\"a=b\"}]}}",
    "baselineResponse": {
      "id": "FEATURE_1",
      "type": "swabra",
      "properties": {
        "property": [
          {
            "name": "example.setting",
            "value": "a=b"
          }
        ]
      },
      "inherited": false
    },
    "baselineResult": {
      "id": "FEATURE_1",
      "type": "swabra",
      "inherited": false,
      "properties": [
        {
          "name": "example.setting",
          "type": "plain",
          "redacted": false,
          "value": "a=b"
        }
      ]
    },
    "human": "id: FEATURE_1\ntype: swabra\ninherited: false\nproperties:\n  -\n    name: example.setting\n    type: plain\n    redacted: false\n    value: a=b\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs features parameters list Example_Build Entity",
    "argv": [
      "jobs",
      "features",
      "parameters",
      "list",
      "Example_Build",
      "Entity"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/features/Entity/parameters",
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
    "name": "jobs features parameters replace Example_Build Entity --property example.setting=synthetic-hidden",
    "argv": [
      "jobs",
      "features",
      "parameters",
      "replace",
      "Example_Build",
      "Entity",
      "--property",
      "example.setting=synthetic-hidden"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Example_Build/features/Entity/parameters",
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
    "name": "jobs features replace-all Build --item {\"type\":\"swabra\"}",
    "argv": [
      "jobs",
      "features",
      "replace-all",
      "Build",
      "--item",
      "{\"type\":\"swabra\"}"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Build/features",
    "query": {
      "fields": "feature(id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))))"
    },
    "body": "{\"feature\":[{\"type\":\"swabra\"}]}",
    "baselineResponse": {
      "feature": [
        {
          "id": "Feature",
          "type": "swabra",
          "disabled": true
        }
      ]
    },
    "baselineResult": [
      {
        "id": "Feature",
        "type": "swabra",
        "disabled": true,
        "properties": []
      }
    ],
    "human": "id: Feature\ntype: swabra\ndisabled: true\nproperties: (empty list)\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs triggers list Example_Build",
    "argv": [
      "jobs",
      "triggers",
      "list",
      "Example_Build"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/triggers",
    "query": {
      "fields": "trigger(id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))))"
    },
    "body": "",
    "baselineResponse": {
      "trigger": [
        {
          "id": "TRIGGER_1",
          "type": "vcsTrigger",
          "properties": {
            "property": [
              {
                "name": "example.setting",
                "value": "a=b"
              }
            ]
          },
          "inherited": false
        }
      ]
    },
    "baselineResult": [
      {
        "id": "TRIGGER_1",
        "type": "vcsTrigger",
        "inherited": false,
        "properties": [
          {
            "name": "example.setting",
            "type": "plain",
            "redacted": false,
            "value": "a=b"
          }
        ]
      }
    ],
    "human": "id: TRIGGER_1\ntype: vcsTrigger\ninherited: false\nproperties:\n  -\n    name: example.setting\n    type: plain\n    redacted: false\n    value: a=b\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs triggers show Example_Build TRIGGER_1",
    "argv": [
      "jobs",
      "triggers",
      "show",
      "Example_Build",
      "TRIGGER_1"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/triggers/TRIGGER_1",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue)))"
    },
    "body": "",
    "baselineResponse": {
      "id": "TRIGGER_1",
      "type": "vcsTrigger",
      "properties": {
        "property": [
          {
            "name": "example.setting",
            "value": "a=b"
          }
        ]
      },
      "inherited": false
    },
    "baselineResult": {
      "id": "TRIGGER_1",
      "type": "vcsTrigger",
      "inherited": false,
      "properties": [
        {
          "name": "example.setting",
          "type": "plain",
          "redacted": false,
          "value": "a=b"
        }
      ]
    },
    "human": "id: TRIGGER_1\ntype: vcsTrigger\ninherited: false\nproperties:\n  -\n    name: example.setting\n    type: plain\n    redacted: false\n    value: a=b\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs triggers create Example_Build --type vcsTrigger --property example.setting=a=b",
    "argv": [
      "jobs",
      "triggers",
      "create",
      "Example_Build",
      "--type",
      "vcsTrigger",
      "--property",
      "example.setting=a=b"
    ],
    "method": "POST",
    "path": "/app/rest/buildTypes/id:Example_Build/triggers",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue)))"
    },
    "body": "{\"type\":\"vcsTrigger\",\"properties\":{\"property\":[{\"name\":\"example.setting\",\"value\":\"a=b\"}]}}",
    "baselineResponse": {
      "id": "TRIGGER_1",
      "type": "vcsTrigger",
      "properties": {
        "property": [
          {
            "name": "example.setting",
            "value": "a=b"
          }
        ]
      },
      "inherited": false
    },
    "baselineResult": {
      "id": "TRIGGER_1",
      "type": "vcsTrigger",
      "inherited": false,
      "properties": [
        {
          "name": "example.setting",
          "type": "plain",
          "redacted": false,
          "value": "a=b"
        }
      ]
    },
    "human": "id: TRIGGER_1\ntype: vcsTrigger\ninherited: false\nproperties:\n  -\n    name: example.setting\n    type: plain\n    redacted: false\n    value: a=b\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs triggers replace Example_Build TRIGGER_1 --type vcsTrigger --property example.setting=a=b",
    "argv": [
      "jobs",
      "triggers",
      "replace",
      "Example_Build",
      "TRIGGER_1",
      "--type",
      "vcsTrigger",
      "--property",
      "example.setting=a=b"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Example_Build/triggers/TRIGGER_1",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue)))"
    },
    "body": "{\"type\":\"vcsTrigger\",\"properties\":{\"property\":[{\"name\":\"example.setting\",\"value\":\"a=b\"}]}}",
    "baselineResponse": {
      "id": "TRIGGER_1",
      "type": "vcsTrigger",
      "properties": {
        "property": [
          {
            "name": "example.setting",
            "value": "a=b"
          }
        ]
      },
      "inherited": false
    },
    "baselineResult": {
      "id": "TRIGGER_1",
      "type": "vcsTrigger",
      "inherited": false,
      "properties": [
        {
          "name": "example.setting",
          "type": "plain",
          "redacted": false,
          "value": "a=b"
        }
      ]
    },
    "human": "id: TRIGGER_1\ntype: vcsTrigger\ninherited: false\nproperties:\n  -\n    name: example.setting\n    type: plain\n    redacted: false\n    value: a=b\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs triggers replace-all Build --item {\"type\":\"vcsTrigger\"}",
    "argv": [
      "jobs",
      "triggers",
      "replace-all",
      "Build",
      "--item",
      "{\"type\":\"vcsTrigger\"}"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Build/triggers",
    "query": {
      "fields": "trigger(id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))))"
    },
    "body": "{\"trigger\":[{\"type\":\"vcsTrigger\"}]}",
    "baselineResponse": {
      "trigger": [
        {
          "id": "Trigger",
          "type": "vcsTrigger",
          "disabled": true
        }
      ]
    },
    "baselineResult": [
      {
        "id": "Trigger",
        "type": "vcsTrigger",
        "disabled": true,
        "properties": []
      }
    ],
    "human": "id: Trigger\ntype: vcsTrigger\ndisabled: true\nproperties: (empty list)\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  }
];
