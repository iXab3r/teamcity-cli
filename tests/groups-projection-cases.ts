import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "groups list",
    "argv": [
      "groups",
      "list"
    ],
    "method": "GET",
    "path": "/app/rest/userGroups",
    "query": {
      "fields": "count,group(key,name,description)"
    },
    "body": "",
    "baselineResponse": {
      "count": 1,
      "group": [
        {
          "key": "DEVS",
          "name": "Fixture group",
          "description": "Synthetic group"
        }
      ]
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "baselineResult": [
      {
        "key": "DEVS",
        "name": "Fixture group",
        "description": "Synthetic group"
      }
    ],
    "human": "key   name           description\n----  -------------  ---------------\nDEVS  Fixture group  Synthetic group\n",
    "stderr": ""
  },
  {
    "name": "groups show DEVS",
    "argv": [
      "groups",
      "show",
      "DEVS"
    ],
    "method": "GET",
    "path": "/app/rest/userGroups/key:DEVS",
    "query": {
      "fields": "key,name,description"
    },
    "body": "",
    "baselineResponse": {
      "key": "DEVS",
      "name": "Fixture group",
      "description": "Synthetic group"
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "baselineResult": {
      "key": "DEVS",
      "name": "Fixture group",
      "description": "Synthetic group"
    },
    "human": "key: DEVS\nname: Fixture group\ndescription: Synthetic group\n",
    "stderr": ""
  },
  {
    "name": "groups parents list DEVS",
    "argv": [
      "groups",
      "parents",
      "list",
      "DEVS"
    ],
    "method": "GET",
    "path": "/app/rest/userGroups/key:DEVS/parent-groups",
    "query": {
      "fields": "count,group(key,name,description)"
    },
    "body": "",
    "baselineResponse": {
      "count": 1,
      "group": [
        {
          "key": "DEVS",
          "name": "Fixture group",
          "description": "Synthetic group"
        }
      ]
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "baselineResult": [
      {
        "key": "DEVS",
        "name": "Fixture group",
        "description": "Synthetic group"
      }
    ],
    "human": "key   name           description\n----  -------------  ---------------\nDEVS  Fixture group  Synthetic group\n",
    "stderr": ""
  },
  {
    "name": "groups properties list DEVS",
    "argv": [
      "groups",
      "properties",
      "list",
      "DEVS"
    ],
    "method": "GET",
    "path": "/app/rest/userGroups/key:DEVS/properties",
    "query": {
      "fields": "count,property(name)"
    },
    "body": "",
    "baselineResponse": {
      "count": 1,
      "property": [
        {
          "name": "fixture.property",
          "value": "fixture-value"
        }
      ]
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "baselineResult": [
      "fixture.property"
    ],
    "human": "fixture.property\n",
    "stderr": ""
  },
  {
    "name": "groups create DEVS --name Fixture group",
    "argv": [
      "groups",
      "create",
      "DEVS",
      "--name",
      "Fixture group"
    ],
    "method": "POST",
    "path": "/app/rest/userGroups",
    "query": {
      "fields": "key,name,description"
    },
    "body": "{\"key\":\"DEVS\",\"name\":\"Fixture group\"}",
    "baselineResponse": {
      "key": "DEVS",
      "name": "Fixture group",
      "description": "Synthetic group"
    },
    "collection": "",
    "permission": "Admin",
    "preflight": null,
    "baselineResult": {
      "key": "DEVS",
      "name": "Fixture group",
      "description": "Synthetic group"
    },
    "human": "key: DEVS\nname: Fixture group\ndescription: Synthetic group\n",
    "stderr": ""
  },
  {
    "name": "groups parents replace DEVS --group PARENT",
    "argv": [
      "groups",
      "parents",
      "replace",
      "DEVS",
      "--group",
      "PARENT"
    ],
    "method": "PUT",
    "path": "/app/rest/userGroups/key:DEVS/parent-groups",
    "query": {
      "fields": "count,group(key,name,description)"
    },
    "body": "{\"group\":[{\"key\":\"PARENT\"}]}",
    "baselineResponse": {
      "count": 1,
      "group": [
        {
          "key": "DEVS",
          "name": "Fixture group",
          "description": "Synthetic group"
        }
      ]
    },
    "collection": "",
    "permission": "Admin",
    "preflight": null,
    "baselineResult": [
      {
        "key": "DEVS",
        "name": "Fixture group",
        "description": "Synthetic group"
      }
    ],
    "human": "key   name           description\n----  -------------  ---------------\nDEVS  Fixture group  Synthetic group\n",
    "stderr": ""
  }
];
