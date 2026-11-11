// Default requests and empty-response outputs captured before this story.
export const cases = [
  {
    "name": "tests list",
    "argv": [
      "tests",
      "list",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "path": "/app/rest/tests",
    "defaultQuery": {
      "locator": "start:3,count:3",
      "fields": "nextHref,test(id,name)"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {},
    "baselineResult": {
      "count": 0,
      "items": [],
      "hasMore": false,
      "nextStart": null
    },
    "human": "No results.\n\ncount: 0  hasMore: false  nextStart: null\n",
    "stderr": "",
    "collection": "test",
    "permission": "ReadOnly"
  },
  {
    "name": "tests show 7",
    "argv": [
      "tests",
      "show",
      "7"
    ],
    "path": "/app/rest/tests/id:7",
    "defaultQuery": {
      "fields": "id,name"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "tests occurrence 7 --build 42",
    "argv": [
      "tests",
      "occurrence",
      "7",
      "--build",
      "42"
    ],
    "path": "/app/rest/testOccurrences/build:(id:42),test:(id:7)",
    "defaultQuery": {
      "fields": "id,name,status,duration,ignored,currentlyMuted,test(id),build(id)"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "problems list",
    "argv": [
      "problems",
      "list",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "path": "/app/rest/problems",
    "defaultQuery": {
      "locator": "start:3,count:3",
      "fields": "nextHref,problem(id,type,identity)"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {},
    "baselineResult": {
      "count": 0,
      "items": [],
      "hasMore": false,
      "nextStart": null
    },
    "human": "No results.\n\ncount: 0  hasMore: false  nextStart: null\n",
    "stderr": "",
    "collection": "problem",
    "permission": "ReadOnly"
  },
  {
    "name": "problems show 7",
    "argv": [
      "problems",
      "show",
      "7"
    ],
    "path": "/app/rest/problems/id:7",
    "defaultQuery": {
      "fields": "id,type,identity"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "problems occurrence 7 --build 42",
    "argv": [
      "problems",
      "occurrence",
      "7",
      "--build",
      "42"
    ],
    "path": "/app/rest/problemOccurrences/build:(id:42),problem:(id:7)",
    "defaultQuery": {
      "fields": "id,type,identity,currentlyMuted,problem(id),build(id)"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "builds tests 42",
    "argv": [
      "builds",
      "tests",
      "42",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "path": "/app/rest/testOccurrences",
    "defaultQuery": {
      "locator": "build:(id:42),start:3,count:3",
      "fields": "nextHref,testOccurrence(id,name,status,duration,ignored,newFailure,muted,currentlyMuted,currentlyInvestigated,details)"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {},
    "baselineResult": {
      "count": 0,
      "items": [],
      "hasMore": false,
      "nextStart": null
    },
    "human": "No tests found.\n",
    "stderr": "",
    "collection": "testOccurrence",
    "permission": "ReadOnly"
  },
  {
    "name": "builds problems 42",
    "argv": [
      "builds",
      "problems",
      "42",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "path": "/app/rest/problemOccurrences",
    "defaultQuery": {
      "locator": "build:(id:42),start:3,count:3",
      "fields": "nextHref,problemOccurrence(id,type,identity,newFailure,currentlyMuted,currentlyInvestigated,logAnchor,details,problem(id,type,identity,description))"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {},
    "baselineResult": {
      "count": 0,
      "items": [],
      "hasMore": false,
      "nextStart": null
    },
    "human": "No problems found.\n",
    "stderr": "",
    "collection": "problemOccurrence",
    "permission": "ReadOnly"
  }
];
