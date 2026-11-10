export const actionCases = [
  {
    "name": "approve",
    "argv": [
      "queue",
      "approval",
      "approve",
      "42"
    ],
    "request": {
      "method": "POST",
      "path": "/app/rest/buildQueue/id:42/approve",
      "query": {
        "fields": "status,canBeApprovedByCurrentUser,configurationValid,timeoutTimestamp",
        "approveAll": "false"
      },
      "body": ""
    },
    "response": {
      "count": 0,
      "errorCount": 0,
      "operationResult": [],
      "id": 42,
      "status": true,
      "build": [
        {
          "id": 42
        }
      ],
      "vcsLabel": []
    },
    "result": {
      "status": true
    },
    "human": {
      "exitCode": 0,
      "stdout": "status: true\n",
      "stderr": ""
    },
    "empty": {
      "code": "error",
      "message": "TeamCity response was not valid JSON."
    }
  },
  {
    "name": "delete",
    "argv": [
      "queue",
      "delete-page",
      "--job",
      "Demo_Build",
      "--confirm"
    ],
    "request": {
      "method": "DELETE",
      "path": "/app/rest/buildQueue",
      "query": {
        "locator": "buildType:(id:Demo_Build),start:0,count:100"
      },
      "body": ""
    },
    "response": {
      "count": 0,
      "errorCount": 0,
      "operationResult": [],
      "id": 42,
      "status": true,
      "build": [
        {
          "id": 42
        }
      ],
      "vcsLabel": []
    },
    "result": {
      "jobId": "Demo_Build",
      "pageDeleted": true
    },
    "human": {
      "exitCode": 0,
      "stdout": "jobId: Demo_Build\npageDeleted: true\n",
      "stderr": ""
    },
    "empty": {
      "result": {
        "jobId": "Demo_Build",
        "pageDeleted": true
      }
    }
  },
  {
    "name": "reorder",
    "argv": [
      "queue",
      "reorder",
      "--build",
      "41",
      "--build",
      "42"
    ],
    "request": {
      "method": "PUT",
      "path": "/app/rest/buildQueue/order",
      "query": {
        "fields": "build(id,buildTypeId,number,state,status,queuePosition)"
      },
      "body": "{\"build\":[{\"id\":41},{\"id\":42}]}"
    },
    "response": {
      "count": 0,
      "errorCount": 0,
      "operationResult": [],
      "id": 42,
      "status": true,
      "build": [
        {
          "id": 42
        }
      ],
      "vcsLabel": []
    },
    "result": [
      {
        "id": 42
      }
    ],
    "human": {
      "exitCode": 0,
      "stdout": "id\n--\n42\n",
      "stderr": ""
    },
    "empty": {
      "code": "error",
      "message": "TeamCity response was not valid JSON."
    }
  },
  {
    "name": "position",
    "argv": [
      "queue",
      "position",
      "set",
      "1",
      "--build",
      "42"
    ],
    "request": {
      "method": "PUT",
      "path": "/app/rest/buildQueue/order/1",
      "query": {
        "fields": "id,buildTypeId,number,state,status,queuePosition"
      },
      "body": "{\"id\":42}"
    },
    "response": {
      "count": 0,
      "errorCount": 0,
      "operationResult": [],
      "id": 42,
      "status": true,
      "build": [
        {
          "id": 42
        }
      ],
      "vcsLabel": []
    },
    "result": {
      "id": 42,
      "status": true
    },
    "human": {
      "exitCode": 0,
      "stdout": "id: 42\nstatus: true\n",
      "stderr": ""
    },
    "empty": {
      "code": "error",
      "message": "TeamCity response was not valid JSON."
    }
  }
];
