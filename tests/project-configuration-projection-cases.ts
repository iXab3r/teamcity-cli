import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "projects parameters list Demo",
    "nativeQuery": {
      "locator": " name:env.MODE "
    },
    "argv": [
      "projects",
      "parameters",
      "list",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/parameters",
    "query": {
      "fields": "property(name,value,inherited,type(rawValue))"
    },
    "body": "",
    "baselineResponse": {
      "property": [
        {
          "name": "env.MODE",
          "value": "test",
          "inherited": false,
          "type": {
            "rawValue": "text",
            "extra": "drop"
          },
          "extra": "drop"
        }
      ]
    },
    "baselineResult": [
      {
        "name": "env.MODE",
        "inherited": false,
        "type": "text",
        "redacted": false,
        "value": "test"
      }
    ],
    "human": "name      inherited  type  redacted  value\n--------  ---------  ----  --------  -----\nenv.MODE  false      text  false     test\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "projects parameters show Demo env.MODE",
    "argv": [
      "projects",
      "parameters",
      "show",
      "Demo",
      "env.MODE"
    ],
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/parameters/env.MODE",
    "query": {
      "fields": "name,value,inherited,type(rawValue)"
    },
    "body": "",
    "baselineResponse": {
      "name": "env.MODE",
      "value": "test",
      "inherited": false,
      "type": {
        "rawValue": "text",
        "extra": "drop"
      },
      "extra": "drop"
    },
    "baselineResult": {
      "name": "env.MODE",
      "inherited": false,
      "type": "text",
      "redacted": false,
      "value": "test"
    },
    "human": "name: env.MODE\ninherited: false\ntype: text\nredacted: false\nvalue: test\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "projects parameters create Demo env.MODE --value test",
    "argv": [
      "projects",
      "parameters",
      "create",
      "Demo",
      "env.MODE",
      "--value",
      "test"
    ],
    "method": "POST",
    "path": "/app/rest/projects/id:Demo/parameters",
    "query": {
      "fields": "name,value,inherited,type(rawValue)"
    },
    "body": "{\"name\":\"env.MODE\",\"value\":\"test\"}",
    "baselineResponse": {
      "name": "env.MODE",
      "value": "test",
      "inherited": false,
      "type": {
        "rawValue": "text",
        "extra": "drop"
      },
      "extra": "drop"
    },
    "baselineResult": {
      "name": "env.MODE",
      "inherited": false,
      "type": "text",
      "redacted": false,
      "value": "test"
    },
    "human": "name: env.MODE\ninherited: false\ntype: text\nredacted: false\nvalue: test\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "projects parameters set Demo env.MODE --value test",
    "argv": [
      "projects",
      "parameters",
      "set",
      "Demo",
      "env.MODE",
      "--value",
      "test"
    ],
    "method": "PUT",
    "path": "/app/rest/projects/id:Demo/parameters/env.MODE",
    "query": {
      "fields": "name,value,inherited,type(rawValue)"
    },
    "body": "{\"name\":\"env.MODE\",\"value\":\"test\"}",
    "baselineResponse": {
      "name": "env.MODE",
      "value": "test",
      "inherited": false,
      "type": {
        "rawValue": "text",
        "extra": "drop"
      },
      "extra": "drop"
    },
    "baselineResult": {
      "name": "env.MODE",
      "inherited": false,
      "type": "text",
      "redacted": false,
      "value": "test"
    },
    "human": "name: env.MODE\ninherited: false\ntype: text\nredacted: false\nvalue: test\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "projects parameters replace-all Demo --property env.MODE=test",
    "argv": [
      "projects",
      "parameters",
      "replace-all",
      "Demo",
      "--property",
      "env.MODE=test"
    ],
    "method": "PUT",
    "path": "/app/rest/projects/id:Demo/parameters",
    "query": {
      "fields": "property(name,value,inherited,type(rawValue))"
    },
    "body": "{\"property\":[{\"name\":\"env.MODE\",\"value\":\"test\"}]}",
    "baselineResponse": {
      "property": [
        {
          "name": "env.MODE",
          "value": "test",
          "inherited": false,
          "type": {
            "rawValue": "text",
            "extra": "drop"
          },
          "extra": "drop"
        }
      ]
    },
    "baselineResult": [
      {
        "name": "env.MODE",
        "inherited": false,
        "type": "text",
        "redacted": false,
        "value": "test"
      }
    ],
    "human": "name      inherited  type  redacted  value\n--------  ---------  ----  --------  -----\nenv.MODE  false      text  false     test\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "projects features list Demo",
    "argv": [
      "projects",
      "features",
      "list",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/projectFeatures",
    "query": {
      "fields": "projectFeature(id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))))"
    },
    "body": "",
    "baselineResponse": {
      "projectFeature": [
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
          "type": "synthetic",
          "properties": {
            "property": [
              {
                "name": "mode",
                "value": "test"
              }
            ]
          }
        }
      ]
    },
    "baselineResult": [
      {
        "id": "Demo",
        "type": "synthetic",
        "properties": [
          {
            "name": "mode",
            "type": "plain",
            "redacted": false,
            "value": "test"
          }
        ]
      }
    ],
    "human": "id: Demo\ntype: synthetic\nproperties:\n  -\n    name: mode\n    type: plain\n    redacted: false\n    value: test\n",
    "stderr": "",
    "collection": "",
    "field": false,
    "acknowledgement": false,
    "permission": "ReadOnly",
    "preflight": null,
    "nativeQuery": {
      "locator": " type:synthetic "
    }
  },
  {
    "name": "projects features show Demo Feature",
    "argv": [
      "projects",
      "features",
      "show",
      "Demo",
      "Feature"
    ],
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/projectFeatures/id:Feature",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue)))"
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
      "type": "synthetic",
      "properties": {
        "property": [
          {
            "name": "mode",
            "value": "test"
          }
        ]
      }
    },
    "baselineResult": {
      "id": "Demo",
      "type": "synthetic",
      "properties": [
        {
          "name": "mode",
          "type": "plain",
          "redacted": false,
          "value": "test"
        }
      ]
    },
    "human": "id: Demo\ntype: synthetic\nproperties:\n  -\n    name: mode\n    type: plain\n    redacted: false\n    value: test\n",
    "stderr": "",
    "collection": "",
    "field": false,
    "acknowledgement": false,
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "projects features create Demo --type synthetic --property mode=test",
    "argv": [
      "projects",
      "features",
      "create",
      "Demo",
      "--type",
      "synthetic",
      "--property",
      "mode=test"
    ],
    "method": "POST",
    "path": "/app/rest/projects/id:Demo/projectFeatures",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue)))"
    },
    "body": "{\"type\":\"synthetic\",\"properties\":{\"property\":[{\"name\":\"mode\",\"value\":\"test\"}]}}",
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
      "type": "synthetic",
      "properties": {
        "property": [
          {
            "name": "mode",
            "value": "test"
          }
        ]
      }
    },
    "baselineResult": {
      "id": "Demo",
      "type": "synthetic",
      "properties": [
        {
          "name": "mode",
          "type": "plain",
          "redacted": false,
          "value": "test"
        }
      ]
    },
    "human": "id: Demo\ntype: synthetic\nproperties:\n  -\n    name: mode\n    type: plain\n    redacted: false\n    value: test\n",
    "stderr": "",
    "collection": "",
    "field": false,
    "acknowledgement": false,
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "projects features replace Demo Feature --type synthetic --property mode=test",
    "argv": [
      "projects",
      "features",
      "replace",
      "Demo",
      "Feature",
      "--type",
      "synthetic",
      "--property",
      "mode=test"
    ],
    "method": "PUT",
    "path": "/app/rest/projects/id:Demo/projectFeatures/id:Feature",
    "query": {
      "fields": "id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue)))"
    },
    "body": "{\"type\":\"synthetic\",\"properties\":{\"property\":[{\"name\":\"mode\",\"value\":\"test\"}]}}",
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
      "type": "synthetic",
      "properties": {
        "property": [
          {
            "name": "mode",
            "value": "test"
          }
        ]
      }
    },
    "baselineResult": {
      "id": "Demo",
      "type": "synthetic",
      "properties": [
        {
          "name": "mode",
          "type": "plain",
          "redacted": false,
          "value": "test"
        }
      ]
    },
    "human": "id: Demo\ntype: synthetic\nproperties:\n  -\n    name: mode\n    type: plain\n    redacted: false\n    value: test\n",
    "stderr": "",
    "collection": "",
    "field": false,
    "acknowledgement": false,
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "projects features replace-all Demo --item {\"id\":\"Feature\",\"type\":\"synthetic\",\"properties\":[{\"name\":\"mode\",\"value\":\"test\"}]}",
    "argv": [
      "projects",
      "features",
      "replace-all",
      "Demo",
      "--item",
      "{\"id\":\"Feature\",\"type\":\"synthetic\",\"properties\":[{\"name\":\"mode\",\"value\":\"test\"}]}"
    ],
    "method": "PUT",
    "path": "/app/rest/projects/id:Demo/projectFeatures",
    "query": {
      "fields": "projectFeature(id,type,disabled,inherited,properties(property(name,value,inherited,type(rawValue))))"
    },
    "body": "{\"projectFeature\":[{\"id\":\"Feature\",\"type\":\"synthetic\",\"properties\":{\"property\":[{\"name\":\"mode\",\"value\":\"test\"}]}}]}",
    "baselineResponse": {
      "projectFeature": [
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
          "type": "synthetic",
          "properties": {
            "property": [
              {
                "name": "mode",
                "value": "test"
              }
            ]
          }
        }
      ]
    },
    "baselineResult": [
      {
        "id": "Demo",
        "type": "synthetic",
        "properties": [
          {
            "name": "mode",
            "type": "plain",
            "redacted": false,
            "value": "test"
          }
        ]
      }
    ],
    "human": "id: Demo\ntype: synthetic\nproperties:\n  -\n    name: mode\n    type: plain\n    redacted: false\n    value: test\n",
    "stderr": "",
    "collection": "",
    "field": false,
    "acknowledgement": false,
    "permission": "Update",
    "preflight": null
  }
];
