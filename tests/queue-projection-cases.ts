// Synthetic baseline captured before US-007 implementation.
export const queueProjectionCases = [
  {
    "name": "queue list",
    "argv": [
      "queue",
      "list",
      "--limit",
      "2",
      "--start",
      "3"
    ],
    "path": "/app/rest/buildQueue",
    "defaultFields": "nextHref,build(id,buildTypeId,number,state,status,statusText,branchName,defaultBranch,personal,failedToStart,canceledInfo(timestamp),queuedDate,startDate,finishDate,percentageComplete,queuePosition,waitReason,webUrl,agent(id,name))",
    "locator": "start:3,count:3",
    "baselineResponse": {
      "build": []
    },
    "baselineResult": {
      "count": 0,
      "items": [],
      "hasMore": false,
      "nextStart": null
    },
    "human": "No builds found.\n",
    "stderr": ""
  },
  {
    "name": "queue position show <position>",
    "argv": [
      "queue",
      "position",
      "show",
      "42"
    ],
    "path": "/app/rest/buildQueue/order/42",
    "defaultFields": "id,buildTypeId,number,state,status,queuePosition",
    "baselineResponse": {
      "id": 42,
      "buildTypeId": "Demo_Build",
      "number": "7",
      "state": "queued",
      "status": "SUCCESS"
    },
    "baselineResult": {
      "id": 42,
      "buildTypeId": "Demo_Build",
      "number": "7",
      "state": "queued",
      "status": "SUCCESS"
    },
    "human": "id: 42\nbuildTypeId: Demo_Build\nnumber: 7\nstate: queued\nstatus: SUCCESS\n",
    "stderr": ""
  },
  {
    "name": "queue show <build-id>",
    "argv": [
      "queue",
      "show",
      "42"
    ],
    "path": "/app/rest/buildQueue/id:42",
    "defaultFields": "id,buildTypeId,number,state,status,queuePosition",
    "baselineResponse": {
      "id": 42,
      "buildTypeId": "Demo_Build",
      "number": "7",
      "state": "queued",
      "status": "SUCCESS"
    },
    "baselineResult": {
      "id": 42,
      "buildTypeId": "Demo_Build",
      "number": "7",
      "state": "queued",
      "status": "SUCCESS"
    },
    "human": "id: 42\nbuildTypeId: Demo_Build\nnumber: 7\nstate: queued\nstatus: SUCCESS\n",
    "stderr": ""
  },
  {
    "name": "queue approval show <build-id>",
    "argv": [
      "queue",
      "approval",
      "show",
      "42"
    ],
    "path": "/app/rest/buildQueue/id:42/approvalInfo",
    "defaultFields": "status,canBeApprovedByCurrentUser,configurationValid,timeoutTimestamp",
    "baselineResponse": {
      "id": 42,
      "buildTypeId": "Demo_Build",
      "number": "7",
      "state": "queued",
      "status": "SUCCESS"
    },
    "baselineResult": {
      "status": "SUCCESS"
    },
    "human": "status: SUCCESS\n",
    "stderr": ""
  },
  {
    "name": "queue compatible-agents <build-id>",
    "argv": [
      "queue",
      "compatible-agents",
      "42"
    ],
    "path": "/app/rest/buildQueue/id:42/compatibleAgents",
    "defaultFields": "agent(id,name)",
    "baselineResponse": {
      "id": 42,
      "buildTypeId": "Demo_Build",
      "number": "7",
      "state": "queued",
      "status": "SUCCESS"
    },
    "baselineResult": [],
    "human": "No results.\n",
    "stderr": ""
  }
].map(c => ({...c, fields: (s: string) => c.name === "queue list" ? `nextHref,build(${s})` : s, response: <T>(v:T) => c.name === "queue list" ? {build:[v]} : v, result: <T>(v:T) => c.name === "queue list" ? {count:1,items:[v],hasMore:false,nextStart:null} : v}));
