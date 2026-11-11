import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "jobs parameters list Demo",
    "nativeQuery": {"locator":" name:env.MODE "},
    "argv": [
      "jobs",
      "parameters",
      "list",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Demo/parameters",
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
    "name": "jobs parameters show Demo env.MODE",
    "argv": [
      "jobs",
      "parameters",
      "show",
      "Demo",
      "env.MODE"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Demo/parameters/env.MODE",
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
    "name": "jobs parameters create Demo env.MODE --value test",
    "argv": [
      "jobs",
      "parameters",
      "create",
      "Demo",
      "env.MODE",
      "--value",
      "test"
    ],
    "method": "POST",
    "path": "/app/rest/buildTypes/id:Demo/parameters",
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
    "preflight": {
      "path": "/app/rest/buildTypes/id:Demo/parameters/env.MODE",
      "query": {
        "fields": "name,inherited,type(rawValue)"
      }
    }
  },
  {
    "name": "jobs parameters set Demo env.MODE --value test",
    "argv": [
      "jobs",
      "parameters",
      "set",
      "Demo",
      "env.MODE",
      "--value",
      "test"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Demo/parameters/env.MODE",
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
    "preflight": {
      "path": "/app/rest/buildTypes/id:Demo/parameters/env.MODE",
      "query": {
        "fields": "name,inherited,type(rawValue)"
      }
    }
  },
  {
    "name": "jobs parameters replace-all Demo --property env.MODE=test",
    "argv": [
      "jobs",
      "parameters",
      "replace-all",
      "Demo",
      "--property",
      "env.MODE=test"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Demo/parameters",
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
    "preflight": {
      "path": "/app/rest/buildTypes/id:Demo/parameters",
      "query": {
        "fields": "property(name,inherited,type(rawValue))"
      }
    }
  },
  {
    "name": "jobs output-parameters list Demo",
    "nativeQuery": {"locator":" name:env.MODE "},
    "argv": [
      "jobs",
      "output-parameters",
      "list",
      "Demo"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Demo/output-parameters",
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
    "name": "jobs output-parameters show Demo env.MODE",
    "argv": [
      "jobs",
      "output-parameters",
      "show",
      "Demo",
      "env.MODE"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Demo/output-parameters/env.MODE",
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
    "name": "jobs output-parameters create Demo env.MODE --value test",
    "argv": [
      "jobs",
      "output-parameters",
      "create",
      "Demo",
      "env.MODE",
      "--value",
      "test"
    ],
    "method": "POST",
    "path": "/app/rest/buildTypes/id:Demo/output-parameters",
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
    "preflight": {
      "path": "/app/rest/buildTypes/id:Demo/output-parameters/env.MODE",
      "query": {
        "fields": "name,inherited,type(rawValue)"
      }
    }
  },
  {
    "name": "jobs output-parameters set Demo env.MODE --value test",
    "argv": [
      "jobs",
      "output-parameters",
      "set",
      "Demo",
      "env.MODE",
      "--value",
      "test"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Demo/output-parameters/env.MODE",
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
    "preflight": {
      "path": "/app/rest/buildTypes/id:Demo/output-parameters/env.MODE",
      "query": {
        "fields": "name,inherited,type(rawValue)"
      }
    }
  },
  {
    "name": "jobs output-parameters replace-all Demo --property env.MODE=test",
    "argv": [
      "jobs",
      "output-parameters",
      "replace-all",
      "Demo",
      "--property",
      "env.MODE=test"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Demo/output-parameters",
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
    "preflight": {
      "path": "/app/rest/buildTypes/id:Demo/output-parameters",
      "query": {
        "fields": "property(name,inherited,type(rawValue))"
      }
    }
  }
];
