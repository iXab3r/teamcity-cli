export const actionCases = [
  {
    name: "cancel",
    argv: ["builds", "cancel", "42", "--comment", "Fixture"],
    request: {
      method: "POST",
      path: "/app/rest/builds/id:42",
      query: {
        fields:
          "id,buildTypeId,number,state,status,statusText,branchName,defaultBranch,personal,failedToStart,canceledInfo(timestamp),queuedDate,startDate,finishDate,percentageComplete,queuePosition,waitReason,webUrl,agent(id,name)",
      },
      body: '{"comment":"Fixture","readdIntoQueue":false}',
    },
    response: {
      id: 42,
      status: true,
      build: {
        id: 42,
      },
      vcsLabel: [],
    },
    result: {
      id: 42,
      status: true,
      build: {
        id: 42,
      },
      vcsLabel: [],
    },
    human: {
      exitCode: 0,
      stdout: "Build 42\n\nNext:\n  teamcity-cli builds wait 42\n",
      stderr: "",
    },
    empty: {
      code: "error",
      message: "TeamCity response was not valid JSON.",
    },
  },
  {
    name: "status",
    argv: ["builds", "set-status", "42", "SUCCESS", "--comment", "Fixture"],
    request: {
      method: "POST",
      path: "/app/rest/builds/id:42/status",
      query: {
        fields: "build(id,buildTypeId,number,state,status),errors(item)",
      },
      body: '{"status":"SUCCESS","comment":"Fixture"}',
    },
    response: {
      id: 42,
      status: true,
      build: {
        id: 42,
      },
      vcsLabel: [],
    },
    result: {
      build: {
        id: 42,
      },
      errorCount: 0,
      partialFailure: false,
    },
    human: {
      exitCode: 0,
      stdout: "build:\n  id: 42\nerrorCount: 0\npartialFailure: false\n",
      stderr: "",
    },
    empty: {
      code: "error",
      message: "TeamCity response was not valid JSON.",
    },
  },
  {
    name: "log",
    argv: ["builds", "log", "append", "42", "--text", "Fixture"],
    request: {
      method: "POST",
      path: "/app/rest/builds/id:42/log",
      query: {},
      body: "Fixture",
    },
    response: {
      id: 42,
      status: true,
      build: {
        id: 42,
      },
      vcsLabel: [],
    },
    result: {
      buildId: 42,
      appended: true,
    },
    human: {
      exitCode: 0,
      stdout: "buildId: 42\nappended: true\n",
      stderr: "",
    },
    empty: {
      result: {
        buildId: 42,
        appended: true,
      },
    },
  },
  {
    name: "problem",
    argv: ["builds", "problem-occurrences", "add", "42", "--text", "Fixture"],
    request: {
      method: "POST",
      path: "/app/rest/builds/id:42/problemOccurrences",
      query: {
        fields: "id,type,identity,currentlyMuted,problem(id),build(id)",
      },
      body: "Fixture",
    },
    response: {
      id: 42,
      status: true,
      build: {
        id: 42,
      },
      vcsLabel: [],
    },
    result: {
      id: 42,
      build: {
        id: 42,
      },
    },
    human: {
      exitCode: 0,
      stdout: "id: 42\nbuild:\n  id: 42\n",
      stderr: "",
    },
    empty: {
      code: "error",
      message: "TeamCity response was not valid JSON.",
    },
  },
  {
    name: "label",
    argv: [
      "builds",
      "vcs-labels",
      "add",
      "42",
      "--label",
      "release",
      "--root-instance",
      "Fixture_Root",
    ],
    request: {
      method: "POST",
      path: "/app/rest/builds/id:42/vcsLabels",
      query: {
        fields: "count,vcsLabel,text,status,buildId",
        locator: "id:Fixture_Root",
      },
      body: "release",
    },
    response: {
      id: 42,
      status: true,
      build: {
        id: 42,
      },
      vcsLabel: [],
    },
    result: [],
    human: {
      exitCode: 0,
      stdout: "No results.\n",
      stderr: "",
    },
    empty: {
      code: "error",
      message: "TeamCity response was not valid JSON.",
    },
  },
  {
    name: "pin",
    argv: ["builds", "pin", "set", "42", "true"],
    request: {
      method: "PUT",
      path: "/app/rest/builds/id:42/pinInfo",
      query: {
        fields: "status,comment(text,timestamp)",
      },
      body: '{"status":true}',
    },
    response: {
      id: 42,
      status: true,
      build: {
        id: 42,
      },
      vcsLabel: [],
    },
    result: {
      status: true,
    },
    human: {
      exitCode: 0,
      stdout: "status: true\n",
      stderr: "",
    },
    empty: {
      code: "error",
      message: "TeamCity response was not valid JSON.",
    },
  },
  {
    name: "agentless",
    argv: ["builds", "start-agentless", "42", "--requestor", "Fixture"],
    request: {
      method: "PUT",
      path: "/app/rest/builds/id:42/runningData",
      query: {
        fields: "id,buildTypeId,number,state,status",
      },
      body: "Fixture",
    },
    response: {
      id: 42,
      status: true,
      build: {
        id: 42,
      },
      vcsLabel: [],
    },
    result: {
      id: 42,
      status: true,
    },
    human: {
      exitCode: 0,
      stdout: "id: 42\nstatus: true\n",
      stderr: "",
    },
    empty: {
      code: "error",
      message: "TeamCity response was not valid JSON.",
    },
  },
];
