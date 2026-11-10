import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "audit list --limit 2 --start 3",
    "argv": [
      "audit",
      "list",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/audit",
    "query": {
      "locator": "start:3,count:3",
      "fields": "nextHref,auditEvent(id,timestamp,action(id,name))"
    },
    "body": "",
    "baselineResponse": {
      "count": 1,
      "auditEvent": [
        {
          "id": 4,
          "timestamp": "20260830T120000+0000",
          "action": {
            "id": "CREATE",
            "name": "Create"
          },
          "comment": "omit"
        }
      ]
    },
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "id": 4,
          "timestamp": "20260830T120000+0000",
          "action": {
            "id": "CREATE",
            "name": "Create"
          }
        }
      ],
      "hasMore": false,
      "nextStart": null
    },
    "human": "id: 4\ntimestamp: 20260830T120000+0000\naction:\n  id: CREATE\n  name: Create\n\ncount: 1  hasMore: false  nextStart: null\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "auditEvent",
    "preflight": null
  },
  {
    "name": "audit show 4",
    "argv": [
      "audit",
      "show",
      "4"
    ],
    "method": "GET",
    "path": "/app/rest/audit/id:4",
    "query": {
      "fields": "id,timestamp,action(id,name)"
    },
    "body": "",
    "baselineResponse": {
      "id": 4,
      "action": {
        "id": "CREATE",
        "name": "Create"
      }
    },
    "baselineResult": {
      "id": 4,
      "action": {
        "id": "CREATE",
        "name": "Create"
      }
    },
    "human": "id: 4\naction:\n  id: CREATE\n  name: Create\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "",
    "preflight": null
  },
  {
    "name": "health list --global --limit 2 --start 3",
    "argv": [
      "health",
      "list",
      "--global",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "method": "GET",
    "path": "/app/rest/health",
    "query": {
      "locator": "global:true,start:3,count:3",
      "fields": "nextHref,healthItem(identity,severity,healthCategory(id,name))"
    },
    "body": "",
    "baselineResponse": {
      "count": 1,
      "healthItem": [
        {
          "identity": "example",
          "severity": "WARN",
          "healthCategory": {
            "id": "unused",
            "name": "Unused"
          }
        }
      ]
    },
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "identity": "example",
          "severity": "WARN",
          "healthCategory": {
            "id": "unused",
            "name": "Unused"
          }
        }
      ],
      "hasMore": false,
      "nextStart": null
    },
    "human": "identity: example\nseverity: WARN\nhealthCategory:\n  id: unused\n  name: Unused\n\ncount: 1  hasMore: false  nextStart: null\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "healthItem",
    "preflight": null
  },
  {
    "name": "health categories list",
    "argv": [
      "health",
      "categories",
      "list"
    ],
    "method": "GET",
    "path": "/app/rest/health/category",
    "query": {
      "fields": "count,healthCategory(id,name)"
    },
    "body": "",
    "baselineResponse": {
      "count": 1,
      "healthCategory": [
        {
          "id": "unused",
          "name": "Unused"
        }
      ]
    },
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "id": "unused",
          "name": "Unused"
        }
      ]
    },
    "human": "id      name\n------  ------\nunused  Unused\n\ncount: 1\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "",
    "preflight": null,
    "nativeQuery": {
      "locator": " name:fixture + "
    }
  },
  {
    "name": "health categories show unused",
    "argv": [
      "health",
      "categories",
      "show",
      "unused"
    ],
    "method": "GET",
    "path": "/app/rest/health/category/id:unused",
    "query": {
      "fields": "id,name"
    },
    "body": "",
    "baselineResponse": {
      "id": "unused",
      "name": "Unused"
    },
    "baselineResult": {
      "id": "unused",
      "name": "Unused"
    },
    "human": "id: unused\nname: Unused\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "",
    "preflight": null
  },
  {
    "name": "health show --project Example --category unused",
    "argv": [
      "health",
      "show",
      "--project",
      "Example",
      "--category",
      "unused"
    ],
    "method": "GET",
    "path": "/app/rest/health/project:(id:Example),healthCategory:(id:unused)",
    "query": {
      "fields": "identity,severity,healthCategory(id,name)"
    },
    "body": "",
    "baselineResponse": {
      "identity": "example",
      "severity": "WARN",
      "healthCategory": {
        "id": "unused",
        "name": "Unused"
      }
    },
    "baselineResult": {
      "identity": "example",
      "severity": "WARN",
      "healthCategory": {
        "id": "unused",
        "name": "Unused"
      }
    },
    "human": "identity: example\nseverity: WARN\nhealthCategory:\n  id: unused\n  name: Unused\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "",
    "preflight": null
  }
];
