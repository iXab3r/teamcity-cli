import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "vcs instances list --limit 2 --start 3 --root Demo",
    "argv": [
      "vcs",
      "instances",
      "list",
      "--limit",
      "2",
      "--start",
      "3",
      "--root",
      "Demo"
    ],
    "baselineResponse": {
      "id": 8,
      "name": "Demo",
      "vcs-root-id": "Demo",
      "vcsName": "jetbrains.git",
      "size": 7,
      "modificationTime": "20260101T000000+0000",
      "extra": "drop",
      "vcs-root-instance": [
        {
          "id": 8,
          "name": "Demo",
          "vcs-root-id": "Demo",
          "vcsName": "jetbrains.git",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ],
      "property": [
        {
          "name": "mode",
          "value": "test"
        }
      ],
      "entry": [
        {
          "name": "main",
          "value": "abc"
        }
      ],
      "file": [
        {
          "name": "src",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ]
    },
    "collection": "vcs-root-instance",
    "fileCollection": false,
    "permission": "ReadOnly",
    "preflight": null,
    "method": "GET",
    "path": "/app/rest/vcs-root-instances",
    "query": {
      "locator": "vcsRoot:(id:Demo),start:3,count:3",
      "fields": "nextHref,vcs-root-instance(id,name,vcs-root-id,vcsName,modificationCheckInterval,commitHookMode)"
    },
    "body": "",
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "id": 8,
          "name": "Demo",
          "vcs-root-id": "Demo",
          "vcsName": "jetbrains.git"
        }
      ],
      "hasMore": false,
      "nextStart": null
    },
    "human": "id  name  vcs-root-id  vcsName\n--  ----  -----------  -------------\n8   Demo  Demo         jetbrains.git\n\ncount: 1  hasMore: false  nextStart: null\n",
    "stderr": ""
  },
  {
    "name": "vcs instances show 8",
    "argv": [
      "vcs",
      "instances",
      "show",
      "8"
    ],
    "baselineResponse": {
      "id": 8,
      "name": "Demo",
      "vcs-root-id": "Demo",
      "vcsName": "jetbrains.git",
      "size": 7,
      "modificationTime": "20260101T000000+0000",
      "extra": "drop",
      "vcs-root-instance": [
        {
          "id": 8,
          "name": "Demo",
          "vcs-root-id": "Demo",
          "vcsName": "jetbrains.git",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ],
      "property": [
        {
          "name": "mode",
          "value": "test"
        }
      ],
      "entry": [
        {
          "name": "main",
          "value": "abc"
        }
      ],
      "file": [
        {
          "name": "src",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ]
    },
    "collection": "",
    "fileCollection": false,
    "permission": "ReadOnly",
    "preflight": null,
    "method": "GET",
    "path": "/app/rest/vcs-root-instances/id:8",
    "query": {
      "fields": "id,name,vcs-root-id,vcsName,modificationCheckInterval,commitHookMode"
    },
    "body": "",
    "baselineResult": {
      "id": 8,
      "name": "Demo",
      "vcs-root-id": "Demo",
      "vcsName": "jetbrains.git"
    },
    "human": "id: 8\nname: Demo\nvcs-root-id: Demo\nvcsName: jetbrains.git\n",
    "stderr": ""
  },
  {
    "name": "vcs instances properties 8",
    "argv": [
      "vcs",
      "instances",
      "properties",
      "8"
    ],
    "baselineResponse": {
      "id": 8,
      "name": "Demo",
      "vcs-root-id": "Demo",
      "vcsName": "jetbrains.git",
      "size": 7,
      "modificationTime": "20260101T000000+0000",
      "extra": "drop",
      "vcs-root-instance": [
        {
          "id": 8,
          "name": "Demo",
          "vcs-root-id": "Demo",
          "vcsName": "jetbrains.git",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ],
      "property": [
        {
          "name": "mode",
          "value": "test"
        }
      ],
      "entry": [
        {
          "name": "main",
          "value": "abc"
        }
      ],
      "file": [
        {
          "name": "src",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ]
    },
    "collection": "",
    "fileCollection": false,
    "permission": "ReadOnly",
    "preflight": null,
    "method": "GET",
    "path": "/app/rest/vcs-root-instances/id:8/properties",
    "query": {
      "fields": "count,property(name,value,inherited,type(rawValue))"
    },
    "body": "",
    "baselineResult": [
      {
        "name": "mode",
        "type": "plain",
        "redacted": false,
        "value": "test"
      }
    ],
    "human": "name  type   redacted  value\n----  -----  --------  -----\nmode  plain  false     test\n",
    "stderr": ""
  },
  {
    "name": "vcs instances state show 8",
    "argv": [
      "vcs",
      "instances",
      "state",
      "show",
      "8"
    ],
    "baselineResponse": {
      "id": 8,
      "name": "Demo",
      "vcs-root-id": "Demo",
      "vcsName": "jetbrains.git",
      "size": 7,
      "modificationTime": "20260101T000000+0000",
      "extra": "drop",
      "vcs-root-instance": [
        {
          "id": 8,
          "name": "Demo",
          "vcs-root-id": "Demo",
          "vcsName": "jetbrains.git",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ],
      "property": [
        {
          "name": "mode",
          "value": "test"
        }
      ],
      "entry": [
        {
          "name": "main",
          "value": "abc"
        }
      ],
      "file": [
        {
          "name": "src",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ]
    },
    "collection": "",
    "fileCollection": false,
    "permission": "ReadOnly",
    "preflight": null,
    "method": "GET",
    "path": "/app/rest/vcs-root-instances/id:8/repositoryState",
    "query": {
      "fields": "count,entry(name,value)"
    },
    "body": "",
    "baselineResult": [
      {
        "name": "main",
        "value": "abc"
      }
    ],
    "human": "name  value\n----  -----\nmain  abc\n",
    "stderr": ""
  },
  {
    "name": "vcs instances state replace 8 --revision main=abc",
    "argv": [
      "vcs",
      "instances",
      "state",
      "replace",
      "8",
      "--revision",
      "main=abc"
    ],
    "baselineResponse": {
      "id": 8,
      "name": "Demo",
      "vcs-root-id": "Demo",
      "vcsName": "jetbrains.git",
      "size": 7,
      "modificationTime": "20260101T000000+0000",
      "extra": "drop",
      "vcs-root-instance": [
        {
          "id": 8,
          "name": "Demo",
          "vcs-root-id": "Demo",
          "vcsName": "jetbrains.git",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ],
      "property": [
        {
          "name": "mode",
          "value": "test"
        }
      ],
      "entry": [
        {
          "name": "main",
          "value": "abc"
        }
      ],
      "file": [
        {
          "name": "src",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ]
    },
    "collection": "",
    "fileCollection": false,
    "permission": "Update",
    "preflight": null,
    "method": "PUT",
    "path": "/app/rest/vcs-root-instances/id:8/repositoryState",
    "query": {
      "fields": "count,entry(name,value)"
    },
    "body": "{\"entry\":[{\"name\":\"main\",\"value\":\"abc\"}]}",
    "baselineResult": [
      {
        "name": "main",
        "value": "abc"
      }
    ],
    "human": "name  value\n----  -----\nmain  abc\n",
    "stderr": ""
  },
  {
    "name": "vcs instances check-changes 8",
    "argv": [
      "vcs",
      "instances",
      "check-changes",
      "8"
    ],
    "baselineResponse": {
      "id": 8,
      "name": "Demo",
      "vcs-root-id": "Demo",
      "vcsName": "jetbrains.git",
      "size": 7,
      "modificationTime": "20260101T000000+0000",
      "extra": "drop",
      "vcs-root-instance": [
        {
          "id": 8,
          "name": "Demo",
          "vcs-root-id": "Demo",
          "vcsName": "jetbrains.git",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ],
      "property": [
        {
          "name": "mode",
          "value": "test"
        }
      ],
      "entry": [
        {
          "name": "main",
          "value": "abc"
        }
      ],
      "file": [
        {
          "name": "src",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ]
    },
    "collection": "",
    "fileCollection": false,
    "permission": "Update",
    "preflight": null,
    "method": "POST",
    "path": "/app/rest/vcs-root-instances/checkingForChangesQueue",
    "query": {
      "locator": "id:8",
      "fields": "count,nextHref,vcs-root-instance(id,name,vcs-root-id,vcsName,modificationCheckInterval,commitHookMode)"
    },
    "body": "",
    "baselineResult": [
      {
        "id": 8,
        "name": "Demo",
        "vcs-root-id": "Demo",
        "vcsName": "jetbrains.git"
      }
    ],
    "human": "id  name  vcs-root-id  vcsName\n--  ----  -----------  -------------\n8   Demo  Demo         jetbrains.git\n",
    "stderr": "",
    "fixedQuery": {
      "locator": "id:8",

    },
    "nativeQuery": {
      "requestor": " nightly + "
    }
  },
  {
    "name": "vcs instances files list 8",
    "argv": [
      "vcs",
      "instances",
      "files",
      "list",
      "8"
    ],
    "baselineResponse": {
      "id": 8,
      "name": "Demo",
      "vcs-root-id": "Demo",
      "vcsName": "jetbrains.git",
      "size": 7,
      "modificationTime": "20260101T000000+0000",
      "extra": "drop",
      "vcs-root-instance": [
        {
          "id": 8,
          "name": "Demo",
          "vcs-root-id": "Demo",
          "vcsName": "jetbrains.git",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ],
      "property": [
        {
          "name": "mode",
          "value": "test"
        }
      ],
      "entry": [
        {
          "name": "main",
          "value": "abc"
        }
      ],
      "file": [
        {
          "name": "src",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ]
    },
    "collection": "",
    "fileCollection": true,
    "permission": "ReadOnly",
    "preflight": null,
    "method": "GET",
    "path": "/app/rest/vcs-root-instances/id:8/files/latest",
    "query": {
      "locator": "hidden:any,count:100",
      "fields": "count,file(name,size,modificationTime)"
    },
    "body": "",
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "name": "src",
          "size": 7,
          "modificationTime": "20260101T000000+0000"
        }
      ]
    },
    "human": "NAME  SIZE  MODIFIED\nsrc   7 B   313d\n",
    "stderr": "",
    "fixedQuery": {
      "locator": "count:100"
    }
  },
  {
    "name": "vcs instances files children 8 src",
    "argv": [
      "vcs",
      "instances",
      "files",
      "children",
      "8",
      "src"
    ],
    "baselineResponse": {
      "id": 8,
      "name": "Demo",
      "vcs-root-id": "Demo",
      "vcsName": "jetbrains.git",
      "size": 7,
      "modificationTime": "20260101T000000+0000",
      "extra": "drop",
      "vcs-root-instance": [
        {
          "id": 8,
          "name": "Demo",
          "vcs-root-id": "Demo",
          "vcsName": "jetbrains.git",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ],
      "property": [
        {
          "name": "mode",
          "value": "test"
        }
      ],
      "entry": [
        {
          "name": "main",
          "value": "abc"
        }
      ],
      "file": [
        {
          "name": "src",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ]
    },
    "collection": "",
    "fileCollection": true,
    "permission": "ReadOnly",
    "preflight": null,
    "method": "GET",
    "path": "/app/rest/vcs-root-instances/id:8/files/latest/src",
    "query": {
      "locator": "hidden:any,count:100",
      "fields": "count,file(name,size,modificationTime)"
    },
    "body": "",
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "name": "src",
          "size": 7,
          "modificationTime": "20260101T000000+0000"
        }
      ]
    },
    "human": "NAME  SIZE  MODIFIED\nsrc   7 B   313d\n",
    "stderr": "",
    "fixedQuery": {
      "locator": "count:100"
    }
  },
  {
    "name": "vcs instances files metadata 8 src",
    "argv": [
      "vcs",
      "instances",
      "files",
      "metadata",
      "8",
      "src"
    ],
    "baselineResponse": {
      "id": 8,
      "name": "Demo",
      "vcs-root-id": "Demo",
      "vcsName": "jetbrains.git",
      "size": 7,
      "modificationTime": "20260101T000000+0000",
      "extra": "drop",
      "vcs-root-instance": [
        {
          "id": 8,
          "name": "Demo",
          "vcs-root-id": "Demo",
          "vcsName": "jetbrains.git",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ],
      "property": [
        {
          "name": "mode",
          "value": "test"
        }
      ],
      "entry": [
        {
          "name": "main",
          "value": "abc"
        }
      ],
      "file": [
        {
          "name": "src",
          "size": 7,
          "modificationTime": "20260101T000000+0000",
          "extra": "drop"
        }
      ]
    },
    "collection": "",
    "fileCollection": false,
    "permission": "ReadOnly",
    "preflight": null,
    "method": "GET",
    "path": "/app/rest/vcs-root-instances/id:8/files/latest/metadata/src",
    "query": {
      "fields": "name,size,modificationTime"
    },
    "body": "",
    "baselineResult": {
      "name": "Demo",
      "size": 7,
      "modificationTime": "20260101T000000+0000"
    },
    "human": "name: Demo\nsize: 7\nmodificationTime: 20260101T000000+0000\n",
    "stderr": ""
  }
];
