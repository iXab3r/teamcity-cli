// Baseline captured before US-002 implementation using synthetic empty responses.
export const evidenceProjectionCases = [
  {
    "name": "builds artifact-changes <id>",
    "argv": [
      "builds",
      "artifact-changes",
      "42"
    ],
    "path": "/app/rest/builds/id:42/artifactDependencyChanges",
    "defaultFields": "count,buildChange(nextBuild(id,buildTypeId,number,state,status),prevBuild(id,buildTypeId,number,state,status))",
    "baselineResponse": {},
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": ""
  },
  {
    "name": "builds canceled-info <build-id>",
    "argv": [
      "builds",
      "canceled-info",
      "42"
    ],
    "path": "/app/rest/builds/id:42/canceledInfo",
    "defaultFields": "text,timestamp",
    "baselineResponse": {},
    "baselineResult": {},
    "human": "",
    "stderr": ""
  },
  {
    "name": "builds output-parameters list <id>",
    "argv": [
      "builds",
      "output-parameters",
      "list",
      "42"
    ],
    "path": "/app/rest/builds/id:42/output-parameters",
    "defaultFields": "count,property(name,value,inherited,type(rawValue))",
    "baselineResponse": {},
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": ""
  },
  {
    "name": "builds pin show <build-id>",
    "argv": [
      "builds",
      "pin",
      "show",
      "42"
    ],
    "path": "/app/rest/builds/id:42/pinInfo",
    "defaultFields": "status,comment(text,timestamp)",
    "baselineResponse": { "status": true },
    "baselineResult": { "status": true },
    "human": "status: true\n",
    "stderr": ""
  },
  {
    "name": "builds problem-occurrences list <id>",
    "argv": [
      "builds",
      "problem-occurrences",
      "list",
      "42"
    ],
    "path": "/app/rest/builds/id:42/problemOccurrences",
    "defaultFields": "count,problemOccurrence(id,type,identity,currentlyMuted,problem(id),build(id))",
    "baselineResponse": {},
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": ""
  },
  {
    "name": "builds related-issues <id>",
    "argv": [
      "builds",
      "related-issues",
      "42"
    ],
    "path": "/app/rest/builds/id:42/relatedIssues",
    "defaultFields": "count,issueUsage(issue(id))",
    "baselineResponse": {},
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": ""
  },
  {
    "name": "builds resulting-properties list <id>",
    "argv": [
      "builds",
      "resulting-properties",
      "list",
      "42"
    ],
    "path": "/app/rest/builds/id:42/resulting-properties",
    "defaultFields": "count,property(name,value,inherited,type(rawValue))",
    "baselineResponse": {},
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": ""
  },
  {
    "name": "builds statistics list <build-id>",
    "argv": [
      "builds",
      "statistics",
      "list",
      "42"
    ],
    "path": "/app/rest/builds/id:42/statistics",
    "defaultFields": "property(name,value)",
    "baselineResponse": {},
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": ""
  },
  {
    "name": "builds test-occurrences <id>",
    "argv": [
      "builds",
      "test-occurrences",
      "42"
    ],
    "path": "/app/rest/builds/id:42/testOccurrences",
    "defaultFields": "count,testOccurrence(id,name,status,duration,ignored,currentlyMuted,test(id),build(id))",
    "baselineResponse": {},
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": ""
  },
  {
    "name": "builds vcs-labels list <id>",
    "argv": [
      "builds",
      "vcs-labels",
      "list",
      "42"
    ],
    "path": "/app/rest/builds/id:42/vcsLabels",
    "defaultFields": "count,vcsLabel,text,status,buildId",
    "baselineResponse": {},
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": ""
  }
].map(c => ({...c, locator: undefined, fields: (s: string) => s, response: <T>(v:T) => v, result: <T>(v:T) => v}));
