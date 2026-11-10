import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "projects versioned-settings affected Demo",
    "argv": [
      "projects",
      "versioned-settings",
      "affected",
      "Demo"
    ],
    "baselineResponse": {
      "project": [
        {
          "id": "Demo",
          "name": "Demo",
          "extra": "drop"
        }
      ],
      "config": {
        "format": "kotlin",
        "extra": "drop"
      },
      "format": "kotlin",
      "type": "info",
      "timestamp": "20260101T000000+0000",
      "dslOutdated": false,
      "missingContextParameters": [
        "mode"
      ],
      "extra": "drop"
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/versionedSettings/affectedProjects",
    "query": {
      "fields": "count,project(id,name)"
    },
    "body": "",
    "baselineResult": [
      {
        "id": "Demo",
        "name": "Demo"
      }
    ],
    "human": "id    name\n----  ----\nDemo  Demo\n",
    "stderr": ""
  },
  {
    "name": "projects versioned-settings config show Demo",
    "argv": [
      "projects",
      "versioned-settings",
      "config",
      "show",
      "Demo"
    ],
    "baselineResponse": {
      "project": [
        {
          "id": "Demo",
          "name": "Demo",
          "extra": "drop"
        }
      ],
      "config": {
        "format": "kotlin",
        "extra": "drop"
      },
      "format": "kotlin",
      "type": "info",
      "timestamp": "20260101T000000+0000",
      "dslOutdated": false,
      "missingContextParameters": [
        "mode"
      ],
      "extra": "drop"
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/versionedSettings/config",
    "query": {
      "fields": "synchronizationMode,vcsRootId,format,buildSettingsMode,allowUIEditing,showSettingsChanges,storeSecureValuesOutsideVcs,portableDsl,settingsPath,applyChangesInDependenciesAndVcsSettings,dslExecutionMode"
    },
    "body": "",
    "baselineResult": {
      "format": "kotlin"
    },
    "human": "format: kotlin\n",
    "stderr": ""
  },
  {
    "name": "projects versioned-settings config effective Demo",
    "argv": [
      "projects",
      "versioned-settings",
      "config",
      "effective",
      "Demo"
    ],
    "baselineResponse": {
      "project": {
        "id": "Demo",
        "extra": "drop"
      },
      "config": {
        "format": "kotlin",
        "extra": "drop"
      },
      "format": "kotlin",
      "type": "info",
      "timestamp": "20260101T000000+0000",
      "dslOutdated": false,
      "missingContextParameters": [
        "mode"
      ],
      "extra": "drop"
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/versionedSettings/config/effective",
    "query": {
      "fields": "project(id),config(synchronizationMode,vcsRootId,format,buildSettingsMode,allowUIEditing,showSettingsChanges,storeSecureValuesOutsideVcs,portableDsl,settingsPath,applyChangesInDependenciesAndVcsSettings,dslExecutionMode)"
    },
    "body": "",
    "baselineResult": {
      "project": {
        "id": "Demo"
      },
      "config": {
        "format": "kotlin"
      }
    },
    "human": "project:\n  id: Demo\nconfig:\n  format: kotlin\n",
    "stderr": ""
  },
  {
    "name": "projects versioned-settings status Demo",
    "argv": [
      "projects",
      "versioned-settings",
      "status",
      "Demo"
    ],
    "baselineResponse": {
      "project": [
        {
          "id": "Demo",
          "name": "Demo",
          "extra": "drop"
        }
      ],
      "config": {
        "format": "kotlin",
        "extra": "drop"
      },
      "format": "kotlin",
      "type": "info",
      "timestamp": "20260101T000000+0000",
      "dslOutdated": false,
      "missingContextParameters": [
        "mode"
      ],
      "extra": "drop"
    },
    "collection": "",
    "permission": "ReadOnly",
    "preflight": null,
    "method": "GET",
    "path": "/app/rest/projects/id:Demo/versionedSettings/status",
    "query": {
      "fields": "type,timestamp,dslOutdated,missingContextParameters"
    },
    "body": "",
    "baselineResult": {
      "type": "info",
      "timestamp": "20260101T000000+0000",
      "dslOutdated": false,
      "missingContextParameters": [
        "mode"
      ]
    },
    "human": "type: info\ntimestamp: 20260101T000000+0000\ndslOutdated: false\nmissingContextParameters:\n  - mode\n",
    "stderr": ""
  },
  {
    "name": "projects versioned-settings load Demo --confirm",
    "argv": [
      "projects",
      "versioned-settings",
      "load",
      "Demo",
      "--confirm"
    ],
    "baselineResponse": {
      "project": [
        {
          "id": "Demo",
          "name": "Demo",
          "extra": "drop"
        }
      ],
      "config": {
        "format": "kotlin",
        "extra": "drop"
      },
      "format": "kotlin",
      "type": "info",
      "timestamp": "20260101T000000+0000",
      "dslOutdated": false,
      "missingContextParameters": [
        "mode"
      ],
      "extra": "drop"
    },
    "collection": "",
    "permission": "Update",
    "preflight": null,
    "method": "POST",
    "path": "/app/rest/projects/id:Demo/versionedSettings/loadSettings",
    "query": {
      "fields": "count,project(id,name)"
    },
    "body": "",
    "baselineResult": [
      {
        "id": "Demo",
        "name": "Demo"
      }
    ],
    "human": "id    name\n----  ----\nDemo  Demo\n",
    "stderr": ""
  },
  {
    "name": "projects versioned-settings config replace Demo --item {\"format\":\"kotlin\"}",
    "argv": [
      "projects",
      "versioned-settings",
      "config",
      "replace",
      "Demo",
      "--item",
      "{\"format\":\"kotlin\"}"
    ],
    "baselineResponse": {
      "project": [
        {
          "id": "Demo",
          "name": "Demo",
          "extra": "drop"
        }
      ],
      "config": {
        "format": "kotlin",
        "extra": "drop"
      },
      "format": "kotlin",
      "type": "info",
      "timestamp": "20260101T000000+0000",
      "dslOutdated": false,
      "missingContextParameters": [
        "mode"
      ],
      "extra": "drop"
    },
    "collection": "",
    "permission": "Update",
    "preflight": null,
    "method": "PUT",
    "path": "/app/rest/projects/id:Demo/versionedSettings/config",
    "query": {
      "fields": "synchronizationMode,vcsRootId,format,buildSettingsMode,allowUIEditing,showSettingsChanges,storeSecureValuesOutsideVcs,portableDsl,settingsPath,applyChangesInDependenciesAndVcsSettings,dslExecutionMode"
    },
    "body": "{\"format\":\"kotlin\",\"storeSecureValuesOutsideVcs\":true}",
    "baselineResult": {
      "format": "kotlin"
    },
    "human": "format: kotlin\n",
    "stderr": ""
  }
];
