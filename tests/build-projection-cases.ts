// Independently authored 0.7.1 requests and outputs; no production projection constants.
export const defaultBuildFields =
  "id,buildTypeId,number,state,status,statusText,branchName,defaultBranch,personal," +
  "failedToStart,canceledInfo(timestamp)," +
  "queuedDate,startDate,finishDate,percentageComplete,queuePosition,waitReason,webUrl," +
  "agent(id,name)";

export const baselineBuild = {
  id: 42, buildTypeId: "Demo_Build", number: "7", state: "finished", status: "SUCCESS", branchName: "main",
};
const record = "Build 42 (#7) · Demo_Build · main\nState:   finished\nResult:  SUCCESS\n\nNext:\n" +
  "  teamcity-cli builds artifacts list 42\n";

export const buildProjectionCases = [
  {
    name: "list", argv: ["builds", "list", "--limit", "2", "--start", "3"],
    path: "/app/rest/builds",
    locator: "start:3,count:3",
    fields: (item: string) => `nextHref,build(${item})`,
    response: <T>(build: T) => ({ build: [build] }),
    result: <T>(build: T) => ({ count: 1, items: [build], hasMore: false, nextStart: null }),
    human: "BUILD  JOB         BRANCH  STATE     RESULT   AGE\n42     Demo_Build  main    finished  SUCCESS\n",
    stderr: "",
  },
  {
    name: "show ID", argv: ["builds", "show", "42"], path: "/app/rest/builds/id:42",
    locator: undefined,
    fields: (item: string) => item,
    response: <T>(build: T) => build,
    result: <T>(build: T) => build,
    human: record, stderr: "",
  },
  {
    name: "show latest", argv: ["builds", "show", "--job", "Demo_Build", "--latest"],
    path: "/app/rest/builds",
    locator: "defaultFilter:false,buildType:(id:Demo_Build),branch:default:any,state:finished,personal:false,count:1",
    fields: (item: string) => `build(${item})`,
    response: <T>(build: T) => ({ build: [build] }),
    result: <T>(build: T) => build,
    human: record, stderr: "Latest finished build on all branches: 42\n",
  },
];
