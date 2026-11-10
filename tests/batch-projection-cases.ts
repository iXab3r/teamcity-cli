export const actionCases = [
  {
    "name": "show",
    "argv": [
      "builds",
      "batch",
      "show",
      "--build",
      "41",
      "--build",
      "42"
    ],
    "request": {
      "method": "GET",
      "path": "/app/rest/builds/multiple/item:(id:41),item:(id:42)",
      "query": {
        "fields": "count,nextHref,build(id,buildTypeId,number,state,status)"
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
    "name": "cancel",
    "argv": [
      "builds",
      "batch",
      "cancel",
      "--build",
      "41",
      "--build",
      "42",
      "--comment",
      "Fixture"
    ],
    "request": {
      "method": "POST",
      "path": "/app/rest/builds/multiple/item:(id:41),item:(id:42)",
      "query": {
        "fields": "count,errorCount,operationResult(text,related(build(id)))"
      },
      "body": "{\"comment\":\"Fixture\",\"readdIntoQueue\":false}"
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
      "count": 0,
      "errorCount": 0,
      "items": []
    },
    "human": {
      "exitCode": 0,
      "stdout": "No results.\n\ncount: 0  errorCount: 0\n",
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
      "builds",
      "batch",
      "delete",
      "--build",
      "41",
      "--build",
      "42"
    ],
    "request": {
      "method": "DELETE",
      "path": "/app/rest/builds/multiple/item:(id:41),item:(id:42)",
      "query": {
        "fields": "count,errorCount,operationResult(text,related(build(id)))"
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
      "count": 0,
      "errorCount": 0,
      "items": []
    },
    "human": {
      "exitCode": 0,
      "stdout": "No results.\n\ncount: 0  errorCount: 0\n",
      "stderr": ""
    },
    "empty": {
      "code": "error",
      "message": "TeamCity response was not valid JSON."
    }
  },
  {
    "name": "comment set",
    "argv": [
      "builds",
      "batch",
      "comment",
      "set",
      "--build",
      "41",
      "--build",
      "42",
      "--text",
      "Fixture"
    ],
    "request": {
      "method": "PUT",
      "path": "/app/rest/builds/multiple/item:(id:41),item:(id:42)/comment",
      "query": {
        "fields": "count,errorCount,operationResult(text,related(build(id)))"
      },
      "body": "Fixture"
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
      "count": 0,
      "errorCount": 0,
      "items": []
    },
    "human": {
      "exitCode": 0,
      "stdout": "No results.\n\ncount: 0  errorCount: 0\n",
      "stderr": ""
    },
    "empty": {
      "code": "error",
      "message": "TeamCity response was not valid JSON."
    }
  },
  {
    "name": "comment clear",
    "argv": [
      "builds",
      "batch",
      "comment",
      "clear",
      "--build",
      "41",
      "--build",
      "42"
    ],
    "request": {
      "method": "DELETE",
      "path": "/app/rest/builds/multiple/item:(id:41),item:(id:42)/comment",
      "query": {
        "fields": "count,errorCount,operationResult(text,related(build(id)))"
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
      "count": 0,
      "errorCount": 0,
      "items": []
    },
    "human": {
      "exitCode": 0,
      "stdout": "No results.\n\ncount: 0  errorCount: 0\n",
      "stderr": ""
    },
    "empty": {
      "code": "error",
      "message": "TeamCity response was not valid JSON."
    }
  },
  {
    "name": "pin",
    "argv": [
      "builds",
      "batch",
      "pin",
      "--build",
      "41",
      "--build",
      "42",
      "--status",
      "true"
    ],
    "request": {
      "method": "PUT",
      "path": "/app/rest/builds/multiple/item:(id:41),item:(id:42)/pinInfo",
      "query": {
        "fields": "count,errorCount,operationResult(text,related(build(id)))"
      },
      "body": "{\"status\":true}"
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
      "count": 0,
      "errorCount": 0,
      "items": []
    },
    "human": {
      "exitCode": 0,
      "stdout": "No results.\n\ncount: 0  errorCount: 0\n",
      "stderr": ""
    },
    "empty": {
      "code": "error",
      "message": "TeamCity response was not valid JSON."
    }
  },
  {
    "name": "tags add",
    "argv": [
      "builds",
      "batch",
      "tags",
      "add",
      "--build",
      "41",
      "--build",
      "42",
      "--tag",
      "release"
    ],
    "request": {
      "method": "POST",
      "path": "/app/rest/builds/multiple/item:(id:41),item:(id:42)/tags",
      "query": {
        "fields": "count,errorCount,operationResult(text,related(build(id)))"
      },
      "body": "{\"tag\":[{\"name\":\"release\"}]}"
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
      "count": 0,
      "errorCount": 0,
      "items": []
    },
    "human": {
      "exitCode": 0,
      "stdout": "No results.\n\ncount: 0  errorCount: 0\n",
      "stderr": ""
    },
    "empty": {
      "code": "error",
      "message": "TeamCity response was not valid JSON."
    }
  },
  {
    "name": "tags remove",
    "argv": [
      "builds",
      "batch",
      "tags",
      "remove",
      "--build",
      "41",
      "--build",
      "42",
      "--tag",
      "release"
    ],
    "request": {
      "method": "DELETE",
      "path": "/app/rest/builds/multiple/item:(id:41),item:(id:42)/tags",
      "query": {
        "fields": "count,errorCount,operationResult(text,related(build(id)))"
      },
      "body": "{\"tag\":[{\"name\":\"release\"}]}"
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
      "count": 0,
      "errorCount": 0,
      "items": []
    },
    "human": {
      "exitCode": 0,
      "stdout": "No results.\n\ncount: 0  errorCount: 0\n",
      "stderr": ""
    },
    "empty": {
      "code": "error",
      "message": "TeamCity response was not valid JSON."
    }
  }
];
