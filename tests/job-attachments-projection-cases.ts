import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "jobs templates list Example_Build",
    "argv": [
      "jobs",
      "templates",
      "list",
      "Example_Build"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/templates",
    "query": {
      "fields": "buildType(id,name,projectId)"
    },
    "body": "",
    "baselineResponse": {
      "buildType": [
        {
          "id": "Entity",
          "name": "Fixture",
          "projectId": "Project",
          "webUrl": "https://teamcity.test/fixture"
        }
      ]
    },
    "baselineResult": [
      {
        "id": "Entity",
        "name": "Fixture",
        "projectId": "Project"
      }
    ],
    "human": "id      name     projectId\n------  -------  ---------\nEntity  Fixture  Project\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs templates show Example_Build Entity",
    "argv": [
      "jobs",
      "templates",
      "show",
      "Example_Build",
      "Entity"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/templates/id:Entity",
    "query": {
      "fields": "id,name,projectId"
    },
    "body": "",
    "baselineResponse": {
      "id": "Entity",
      "name": "Fixture",
      "projectId": "Project",
      "webUrl": "https://teamcity.test/fixture"
    },
    "baselineResult": {
      "id": "Entity",
      "name": "Fixture",
      "projectId": "Project"
    },
    "human": "id: Entity\nname: Fixture\nprojectId: Project\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs templates attach Example_Build --template Entity --optimize-settings",
    "argv": [
      "jobs",
      "templates",
      "attach",
      "Example_Build",
      "--template",
      "Entity",
      "--optimize-settings"
    ],
    "method": "POST",
    "path": "/app/rest/buildTypes/id:Example_Build/templates",
    "query": {
      "fields": "id,name,projectId",
      "optimizeSettings": "true"
    },
    "body": "{\"id\":\"Entity\"}",
    "baselineResponse": {
      "id": "Entity",
      "name": "Fixture",
      "projectId": "Project",
      "webUrl": "https://teamcity.test/fixture"
    },
    "baselineResult": {
      "id": "Entity",
      "name": "Fixture",
      "projectId": "Project"
    },
    "human": "id: Entity\nname: Fixture\nprojectId: Project\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs templates replace-all Example_Build --template Entity --optimize-settings",
    "argv": [
      "jobs",
      "templates",
      "replace-all",
      "Example_Build",
      "--template",
      "Entity",
      "--optimize-settings"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Example_Build/templates",
    "query": {
      "fields": "buildType(id,name,projectId)",
      "optimizeSettings": "true"
    },
    "body": "{\"buildType\":[{\"id\":\"Entity\"}]}",
    "baselineResponse": {
      "buildType": [
        {
          "id": "Entity",
          "name": "Fixture",
          "projectId": "Project",
          "webUrl": "https://teamcity.test/fixture"
        }
      ]
    },
    "baselineResult": [
      {
        "id": "Entity",
        "name": "Fixture",
        "projectId": "Project"
      }
    ],
    "human": "id      name     projectId\n------  -------  ---------\nEntity  Fixture  Project\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs vcs list Example_Build",
    "argv": [
      "jobs",
      "vcs",
      "list",
      "Example_Build"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/vcs-root-entries",
    "query": {
      "fields": "vcs-root-entry(vcs-root(id,name,vcsName,project(id,name)),checkout-rules)"
    },
    "body": "",
    "baselineResponse": {
      "vcs-root-entry": [
        {
          "id": "Entity",
          "checkout-rules": "+:src",
          "vcs-root": {
            "id": "Entity",
            "name": "Fixture"
          }
        }
      ]
    },
    "baselineResult": [
      {
        "root": {
          "id": "Entity",
          "name": "Fixture"
        },
        "rules": "+:src"
      }
    ],
    "human": "root:\n  id: Entity\n  name: Fixture\nrules: +:src\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs vcs show Example_Build Entity",
    "argv": [
      "jobs",
      "vcs",
      "show",
      "Example_Build",
      "Entity"
    ],
    "method": "GET",
    "path": "/app/rest/buildTypes/id:Example_Build/vcs-root-entries/id:Entity",
    "query": {
      "fields": "vcs-root(id,name,vcsName,project(id,name)),checkout-rules"
    },
    "body": "",
    "baselineResponse": {
      "id": "Entity",
      "checkout-rules": "+:src",
      "vcs-root": {
        "id": "Entity",
        "name": "Fixture"
      }
    },
    "baselineResult": {
      "root": {
        "id": "Entity",
        "name": "Fixture"
      },
      "rules": "+:src"
    },
    "human": "root:\n  id: Entity\n  name: Fixture\nrules: +:src\n",
    "stderr": "",
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null
  },
  {
    "name": "jobs vcs attach Example_Build --root Entity --checkout-rules +:src",
    "argv": [
      "jobs",
      "vcs",
      "attach",
      "Example_Build",
      "--root",
      "Entity",
      "--checkout-rules",
      "+:src"
    ],
    "method": "POST",
    "path": "/app/rest/buildTypes/id:Example_Build/vcs-root-entries",
    "query": {
      "fields": "vcs-root(id,name,vcsName,project(id,name)),checkout-rules"
    },
    "body": "{\"vcs-root\":{\"id\":\"Entity\"},\"checkout-rules\":\"+:src\"}",
    "baselineResponse": {
      "id": "Entity",
      "checkout-rules": "+:src",
      "vcs-root": {
        "id": "Entity",
        "name": "Fixture"
      }
    },
    "baselineResult": {
      "root": {
        "id": "Entity",
        "name": "Fixture"
      },
      "rules": "+:src"
    },
    "human": "root:\n  id: Entity\n  name: Fixture\nrules: +:src\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs vcs replace Example_Build Entity --checkout-rules +:src",
    "argv": [
      "jobs",
      "vcs",
      "replace",
      "Example_Build",
      "Entity",
      "--checkout-rules",
      "+:src"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Example_Build/vcs-root-entries/id:Entity",
    "query": {
      "fields": "vcs-root(id,name,vcsName,project(id,name)),checkout-rules"
    },
    "body": "{\"vcs-root\":{\"id\":\"Entity\"},\"checkout-rules\":\"+:src\"}",
    "baselineResponse": {
      "id": "Entity",
      "checkout-rules": "+:src",
      "vcs-root": {
        "id": "Entity",
        "name": "Fixture"
      }
    },
    "baselineResult": {
      "root": {
        "id": "Entity",
        "name": "Fixture"
      },
      "rules": "+:src"
    },
    "human": "root:\n  id: Entity\n  name: Fixture\nrules: +:src\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  },
  {
    "name": "jobs vcs replace-all Example_Build --item {\"rootId\":\"Entity\",\"rules\":\"+:src\"}",
    "argv": [
      "jobs",
      "vcs",
      "replace-all",
      "Example_Build",
      "--item",
      "{\"rootId\":\"Entity\",\"rules\":\"+:src\"}"
    ],
    "method": "PUT",
    "path": "/app/rest/buildTypes/id:Example_Build/vcs-root-entries",
    "query": {
      "fields": "vcs-root-entry(vcs-root(id,name,vcsName,project(id,name)),checkout-rules)"
    },
    "body": "{\"vcs-root-entry\":[{\"vcs-root\":{\"id\":\"Entity\"},\"checkout-rules\":\"+:src\"}]}",
    "baselineResponse": {
      "vcs-root-entry": [
        {
          "id": "Entity",
          "checkout-rules": "+:src",
          "vcs-root": {
            "id": "Entity",
            "name": "Fixture"
          }
        }
      ]
    },
    "baselineResult": [
      {
        "root": {
          "id": "Entity",
          "name": "Fixture"
        },
        "rules": "+:src"
      }
    ],
    "human": "root:\n  id: Entity\n  name: Fixture\nrules: +:src\n",
    "stderr": "",
    "collection": "",
    "permission": "Update",
    "preflight": null
  }
];
