import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "users list --limit 2 --start 3",
    "argv": [
      "users",
      "list",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/users",
    "query": {
      "locator": "start:3,count:3",
      "fields": "nextHref,user(id,username,name)"
    },
    "body": "",
    "baselineResponse": {
      "user": [
        {
          "id": 12,
          "username": "fixture-user",
          "name": "Fixture account",
          "email": "synthetic@example.test"
        }
      ]
    },
    "collection": "user",
    "permission": "ReadOnly",
    "preflight": null,
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "id": 12,
          "username": "fixture-user",
          "name": "Fixture account"
        }
      ],
      "hasMore": false,
      "nextStart": null
    },
    "human": "id  username      name\n--  ------------  ---------------\n12  fixture-user  Fixture account\n\ncount: 1  hasMore: false  nextStart: null\n",
    "stderr": ""
  },
  {
    "name": "users show 12",
    "argv": [
      "users",
      "show",
      "12"
    ],
    "method": "GET",
    "path": "/app/rest/users/id:12",
    "query": {
      "fields": "id,username,name"
    },
    "body": "",
    "baselineResponse": {
      "id": 12,
      "username": "fixture-user",
      "name": "Fixture account",
      "email": "synthetic@example.test"
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "baselineResult": {
      "id": 12,
      "username": "fixture-user",
      "name": "Fixture account"
    },
    "human": "id: 12\nusername: fixture-user\nname: Fixture account\n",
    "stderr": ""
  },
  {
    "name": "users create fixture-user --name Fixture account",
    "argv": [
      "users",
      "create",
      "fixture-user",
      "--name",
      "Fixture account"
    ],
    "method": "POST",
    "path": "/app/rest/users",
    "query": {
      "fields": "id,username,name"
    },
    "body": "{\"username\":\"fixture-user\",\"name\":\"Fixture account\"}",
    "baselineResponse": {
      "id": 12,
      "username": "fixture-user",
      "name": "Fixture account",
      "email": "synthetic@example.test"
    },
    "collection": "",
    "permission": "Admin",
    "preflight": null,
    "baselineResult": {
      "id": 12,
      "username": "fixture-user",
      "name": "Fixture account"
    },
    "human": "id: 12\nusername: fixture-user\nname: Fixture account\n",
    "stderr": ""
  },
  {
    "name": "users update 12 --name Fixture account",
    "argv": [
      "users",
      "update",
      "12",
      "--name",
      "Fixture account"
    ],
    "method": "PUT",
    "path": "/app/rest/users/id:12",
    "query": {
      "fields": "id,username,name"
    },
    "body": "{\"name\":\"Fixture account\"}",
    "baselineResponse": {
      "id": 12,
      "username": "fixture-user",
      "name": "Fixture account",
      "email": "synthetic@example.test"
    },
    "collection": "",
    "permission": "Admin",
    "preflight": null,
    "baselineResult": {
      "id": 12,
      "username": "fixture-user",
      "name": "Fixture account"
    },
    "human": "id: 12\nusername: fixture-user\nname: Fixture account\n",
    "stderr": ""
  },
  {
    "name": "users groups list 12",
    "argv": [
      "users",
      "groups",
      "list",
      "12"
    ],
    "method": "GET",
    "path": "/app/rest/users/id:12/groups",
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
    "name": "users groups show 12 DEVS",
    "argv": [
      "users",
      "groups",
      "show",
      "12",
      "DEVS"
    ],
    "method": "GET",
    "path": "/app/rest/users/id:12/groups/key:DEVS",
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
    "name": "users groups replace 12 --group DEVS",
    "argv": [
      "users",
      "groups",
      "replace",
      "12",
      "--group",
      "DEVS"
    ],
    "method": "PUT",
    "path": "/app/rest/users/id:12/groups",
    "query": {
      "fields": "count,group(key,name,description)"
    },
    "body": "{\"group\":[{\"key\":\"DEVS\"}]}",
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
  },
  {
    "name": "users groups remove 12 DEVS",
    "argv": [
      "users",
      "groups",
      "remove",
      "12",
      "DEVS"
    ],
    "method": "DELETE",
    "path": "/app/rest/users/id:12/groups/key:DEVS",
    "query": {},
    "body": "",
    "baselineResponse": {
      "removed": true
    },
    "collection": "",
    "permission": "Admin",
    "preflight": null,
    "baselineResult": {
      "userId": "12",
      "group": "DEVS",
      "removed": true
    },
    "human": "userId: 12\ngroup: DEVS\nremoved: true\n",
    "stderr": "",
    "acknowledgement": true
  },
  {
    "name": "users permissions list 12",
    "argv": [
      "users",
      "permissions",
      "list",
      "12"
    ],
    "method": "GET",
    "path": "/app/rest/users/id:12/permissions",
    "query": {
      "fields": "count,permissionAssignment(permission(id),project(id),isGlobalScope)"
    },
    "body": "",
    "baselineResponse": {
      "count": 1,
      "permissionAssignment": [
        {
          "permission": {
            "id": "VIEW_PROJECT"
          },
          "project": {
            "id": "Demo"
          },
          "isGlobalScope": false
        }
      ]
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "baselineResult": [
      {
        "isGlobalScope": false,
        "permission": {
          "id": "VIEW_PROJECT"
        },
        "project": {
          "id": "Demo"
        }
      }
    ],
    "human": "isGlobalScope: false\npermission:\n  id: VIEW_PROJECT\nproject:\n  id: Demo\n",
    "stderr": ""
  },
  {
    "name": "users properties list 12",
    "argv": [
      "users",
      "properties",
      "list",
      "12"
    ],
    "method": "GET",
    "path": "/app/rest/users/id:12/properties",
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
    "name": "users tokens list",
    "argv": [
      "users",
      "tokens",
      "list"
    ],
    "method": "GET",
    "path": "/app/rest/users/current/tokens",
    "query": {
      "fields": "count,token(name,creationTime,expirationTime)"
    },
    "body": "",
    "baselineResponse": {
      "count": 1,
      "token": [
        {
          "name": "fixture-token",
          "creationTime": "20260101T000000+0000",
          "expirationTime": "20270101T000000+0000"
        }
      ]
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "baselineResult": [
      {
        "name": "fixture-token",
        "creationTime": "20260101T000000+0000",
        "expirationTime": "20270101T000000+0000"
      }
    ],
    "human": "name           creationTime          expirationTime\n-------------  --------------------  --------------------\nfixture-token  20260101T000000+0000  20270101T000000+0000\n",
    "stderr": ""
  },
  {
    "name": "users tokens create",
    "argv": [
      "users",
      "tokens",
      "create",
      "ExampleToken",
      "--alias",
      "automation",
      "--no-expiration",
      "--same-permissions"
    ],
    "method": "POST",
    "path": "/app/rest/users/current/tokens",
    "query": {
      "fields": "name,creationTime,expirationTime,value"
    },
    "body": "{\"name\":\"ExampleToken\"}",
    "baselineResponse": {
      "name": "ExampleToken",
      "value": "synthetic-issued-token"
    },
    "baselineResult": {
      "name": "ExampleToken",
      "alias": "automation",
      "stored": true
    },
    "human": "name: ExampleToken\nalias: automation\nstored: true\n",
    "stderr": "",
    "collection": "",
    "permission": "Credentials",
    "preflight": null,
    "issuedToken": true
  }
];
