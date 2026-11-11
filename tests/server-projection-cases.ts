import type { ProjectionCase } from "./projection-support.js";
export const cases: ProjectionCase[] = [
  {
    "name": "server status",
    "argv": [
      "server",
      "status"
    ],
    "method": "GET",
    "path": "/app/rest/server",
    "query": {
      "fields": "version,versionMajor,versionMinor,buildNumber,startTime,currentTime,role,webUrl"
    },
    "body": "",
    "baselineResponse": {
      "version": "2026.1",
      "buildNumber": "123",
      "role": "main_node",
      "currentTime": "20261110T120000+0000"
    },
    "baselineResult": {
      "version": "2026.1",
      "buildNumber": "123",
      "role": "main_node",
      "currentTime": "20261110T120000+0000"
    },
    "human": "version: 2026.1\nbuildNumber: 123\nrole: main_node\ncurrentTime: 20261110T120000+0000\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "",
    "preflight": null
  },
  {
    "name": "server licenses summary",
    "argv": [
      "server",
      "licenses",
      "summary"
    ],
    "method": "GET",
    "path": "/app/rest/server/licensingData",
    "query": {
      "fields": "serverLicenseType,maxAgents,unlimitedAgents,maxBuildTypes,unlimitedBuildTypes"
    },
    "body": "",
    "baselineResponse": {
      "serverLicenseType": "enterprise",
      "maxAgents": 10
    },
    "baselineResult": {
      "serverLicenseType": "enterprise",
      "maxAgents": 10
    },
    "human": "serverLicenseType: enterprise\nmaxAgents: 10\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "",
    "preflight": null,
    "inputSecrets": {
      "license": "synthetic-license-value"
    }
  },
  {
    "name": "server licenses list",
    "argv": [
      "server",
      "licenses",
      "list"
    ],
    "method": "GET",
    "path": "/app/rest/server/licensingData/licenseKeys",
    "query": {
      "fields": "count,licenseKey(valid,active,expired,obsolete,expirationDate,maintenanceEndDate,type,servers,agents,unlimitedAgents,buildTypes,unlimitedBuildTypes,pipelines,unlimitedPipelines)"
    },
    "body": "",
    "baselineResponse": {
      "count": 1,
      "licenseKey": [
        {
          "valid": true,
          "active": true,
          "type": "enterprise",
          "agents": 10
        }
      ]
    },
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "valid": true,
          "active": true,
          "type": "enterprise",
          "agents": 10
        }
      ]
    },
    "human": "valid  active  type        agents\n-----  ------  ----------  ------\ntrue   true    enterprise  10\n\ncount: 1\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "",
    "preflight": null,
    "inputSecrets": {
      "license": "synthetic-license-value"
    }
  },
  {
    "name": "server licenses add --secret license",
    "argv": [
      "server",
      "licenses",
      "add",
      "--secret",
      "license"
    ],
    "method": "POST",
    "path": "/app/rest/server/licensingData/licenseKeys",
    "query": {
      "fields": "count,licenseKey(valid,active,expired,obsolete,expirationDate,maintenanceEndDate,type,servers,agents,unlimitedAgents,buildTypes,unlimitedBuildTypes,pipelines,unlimitedPipelines)"
    },
    "body": "synthetic-license-value",
    "baselineResponse": {
      "count": 1,
      "licenseKey": [
        {
          "valid": true,
          "active": true,
          "type": "enterprise",
          "agents": 10
        }
      ]
    },
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "valid": true,
          "active": true,
          "type": "enterprise",
          "agents": 10
        }
      ]
    },
    "human": "valid  active  type        agents\n-----  ------  ----------  ------\ntrue   true    enterprise  10\n\ncount: 1\n",
    "stderr": "",
    "permission": "Admin",
    "collection": "",
    "preflight": null,
    "inputSecrets": {
      "license": "synthetic-license-value"
    }
  },
  {
    "name": "server licenses show license",
    "argv": [
      "server",
      "licenses",
      "show",
      "license"
    ],
    "method": "GET",
    "path": "/app/rest/server/licensingData/licenseKeys/synthetic-license-value",
    "query": {
      "fields": "valid,active,expired,obsolete,expirationDate,maintenanceEndDate,type,servers,agents,unlimitedAgents,buildTypes,unlimitedBuildTypes,pipelines,unlimitedPipelines"
    },
    "body": "",
    "baselineResponse": {
      "valid": true,
      "active": true,
      "type": "enterprise",
      "agents": 10
    },
    "baselineResult": {
      "valid": true,
      "active": true,
      "type": "enterprise",
      "agents": 10
    },
    "human": "valid: true\nactive: true\ntype: enterprise\nagents: 10\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "",
    "preflight": null,
    "inputSecrets": {
      "license": "synthetic-license-value"
    }
  },
  {
    "name": "server metrics",
    "argv": [
      "server",
      "metrics"
    ],
    "method": "GET",
    "path": "/app/rest/server/metrics",
    "query": {
      "fields": "count,metric(name,prometheusName,metricValues(metricValue(name,value)))"
    },
    "body": "",
    "baselineResponse": {
      "count": 1,
      "metric": [
        {
          "name": "queue",
          "prometheusName": "queue",
          "metricValues": {
            "metricValue": [
              {
                "name": "size",
                "value": 3,
                "metricTags": [
                  "omit"
                ]
              }
            ]
          }
        }
      ]
    },
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "name": "queue",
          "prometheusName": "queue",
          "values": [
            {
              "name": "size",
              "value": 3
            }
          ]
        }
      ]
    },
    "human": "name: queue\nprometheusName: queue\nvalues:\n  -\n    name: size\n    value: 3\n\ncount: 1\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "",
    "preflight": null
  },
  {
    "name": "server plugins",
    "argv": [
      "server",
      "plugins"
    ],
    "method": "GET",
    "path": "/app/rest/server/plugins",
    "query": {
      "fields": "count,plugin(name,displayName,version,loaded,disabled)"
    },
    "body": "",
    "baselineResponse": {
      "count": 1,
      "plugin": [
        {
          "name": "rest-api",
          "displayName": "REST API",
          "version": "2026.1",
          "loaded": true,
          "disabled": false
        }
      ]
    },
    "baselineResult": {
      "count": 1,
      "items": [
        {
          "name": "rest-api",
          "displayName": "REST API",
          "version": "2026.1",
          "loaded": true,
          "disabled": false
        }
      ]
    },
    "human": "name      displayName  version  loaded  disabled\n--------  -----------  -------  ------  --------\nrest-api  REST API     2026.1   true    false\n\ncount: 1\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "",
    "preflight": null,
    "nativeQuery": {
      "locator": " name:fixture + "
    }
  },
  {
    "name": "server nodes list",
    "argv": [
      "server",
      "nodes",
      "list"
    ],
    "method": "GET",
    "path": "/app/rest/server/nodes",
    "query": {
      "fields": "count,node(id,role,state,current)"
    },
    "body": "",
    "baselineResponse": {
      "node": [
        {
          "id": "node1",
          "role": "secondary_node",
          "state": "online",
          "current": false
        }
      ]
    },
    "baselineResult": [
      {
        "id": "node1",
        "role": "secondary_node",
        "state": "online",
        "current": false
      }
    ],
    "human": "id     role            state   current\n-----  --------------  ------  -------\nnode1  secondary_node  online  false\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "",
    "preflight": null
  },
  {
    "name": "server nodes show node1",
    "argv": [
      "server",
      "nodes",
      "show",
      "node1"
    ],
    "method": "GET",
    "path": "/app/rest/server/nodes/id:node1",
    "query": {
      "fields": "id,role,state,current"
    },
    "body": "",
    "baselineResponse": {
      "id": "node1",
      "role": "secondary_node",
      "state": "online",
      "current": false
    },
    "baselineResult": {
      "id": "node1",
      "role": "secondary_node",
      "state": "online",
      "current": false
    },
    "human": "id: node1\nrole: secondary_node\nstate: online\ncurrent: false\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "",
    "preflight": null
  },
  {
    "name": "server nodes responsibilities disabled node1",
    "argv": [
      "server",
      "nodes",
      "responsibilities",
      "disabled",
      "node1"
    ],
    "method": "GET",
    "path": "/app/rest/server/nodes/id:node1/disabledResponsibilities",
    "query": {
      "fields": "count,responsibility(name,description)"
    },
    "body": "",
    "baselineResponse": {
      "responsibility": [
        {
          "name": "CAN_PROCESS_BUILD_MESSAGES",
          "description": "Messages"
        }
      ]
    },
    "baselineResult": [
      {
        "name": "CAN_PROCESS_BUILD_MESSAGES",
        "description": "Messages"
      }
    ],
    "human": "name                        description\n--------------------------  -----------\nCAN_PROCESS_BUILD_MESSAGES  Messages\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "",
    "preflight": null
  },
  {
    "name": "server nodes responsibilities effective node1",
    "argv": [
      "server",
      "nodes",
      "responsibilities",
      "effective",
      "node1"
    ],
    "method": "GET",
    "path": "/app/rest/server/nodes/id:node1/effectiveResponsibilities",
    "query": {
      "fields": "count,responsibility(name,description)"
    },
    "body": "",
    "baselineResponse": {
      "responsibility": [
        {
          "name": "CAN_PROCESS_BUILD_MESSAGES",
          "description": "Messages"
        }
      ]
    },
    "baselineResult": [
      {
        "name": "CAN_PROCESS_BUILD_MESSAGES",
        "description": "Messages"
      }
    ],
    "human": "name                        description\n--------------------------  -----------\nCAN_PROCESS_BUILD_MESSAGES  Messages\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "",
    "preflight": null
  },
  {
    "name": "server nodes responsibilities enabled node1",
    "argv": [
      "server",
      "nodes",
      "responsibilities",
      "enabled",
      "node1"
    ],
    "method": "GET",
    "path": "/app/rest/server/nodes/id:node1/enabledResponsibilities",
    "query": {
      "fields": "count,responsibility(name,description)"
    },
    "body": "",
    "baselineResponse": {
      "responsibility": [
        {
          "name": "CAN_PROCESS_BUILD_MESSAGES",
          "description": "Messages"
        }
      ]
    },
    "baselineResult": [
      {
        "name": "CAN_PROCESS_BUILD_MESSAGES",
        "description": "Messages"
      }
    ],
    "human": "name                        description\n--------------------------  -----------\nCAN_PROCESS_BUILD_MESSAGES  Messages\n",
    "stderr": "",
    "permission": "ReadOnly",
    "collection": "",
    "preflight": null
  }
];
