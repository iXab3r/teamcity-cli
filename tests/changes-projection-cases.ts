// Default requests and empty-response outputs captured before this story.
export const cases = [
  {
    "name": "builds changes 42",
    "argv": [
      "builds",
      "changes",
      "42",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "path": "/app/rest/changes",
    "defaultQuery": {
      "locator": "build:(id:42),start:3,count:3",
      "fields": "nextHref,change(id,version,internalVersion,date,commitDate,comment,webUrl,commiter(vcsUsername))"
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
    "collection": "change",
    "permission": "ReadOnly"
  },
  {
    "name": "changes show 7",
    "argv": [
      "changes",
      "show",
      "7"
    ],
    "path": "/app/rest/changes/id:7",
    "defaultQuery": {
      "fields": "id,version,date,comment"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "id: \n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "changes attributes 7",
    "argv": [
      "changes",
      "attributes",
      "7"
    ],
    "path": "/app/rest/changes/id:7/attributes",
    "defaultQuery": {
      "fields": "count,entry(name)"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {},
    "baselineResult": [],
    "human": "No names found.\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "changes duplicates 7",
    "argv": [
      "changes",
      "duplicates",
      "7"
    ],
    "path": "/app/rest/changes/id:7/duplicates",
    "defaultQuery": {
      "fields": "change(id,version,date,comment)"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {},
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "changes first-builds 7",
    "argv": [
      "changes",
      "first-builds",
      "7"
    ],
    "path": "/app/rest/changes/id:7/firstBuilds",
    "defaultQuery": {
      "fields": "build(id,buildTypeId,number,state,status)"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {},
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "changes parents 7",
    "argv": [
      "changes",
      "parents",
      "7"
    ],
    "path": "/app/rest/changes/id:7/parentChanges",
    "defaultQuery": {
      "fields": "change(id,version,date,comment)"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {},
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  },
  {
    "name": "changes root-instance 7",
    "argv": [
      "changes",
      "root-instance",
      "7"
    ],
    "path": "/app/rest/changes/id:7/vcsRootInstance",
    "defaultQuery": {
      "fields": "id,name,vcs-root-id"
    },
    "method": "GET",
    "body": "",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly"
  }
];
