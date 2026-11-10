import { projectionAcceptance, type ProjectionCase } from "./projection-support.js";
const cases: ProjectionCase[] = ["list", "children", "metadata"].map(action => {
  const list = action !== "metadata";
  return {name: `jobs files ${action}`, argv: ["jobs", "files", action, "Demo", ...(action === "list" ? [] : ["src"])], method: "GET", path: "/app/rest/buildTypes/id:Demo/vcs/files/latest" + (action === "list" ? "" : action === "children" ? "/src" : "/metadata/src"), query: {resolveParameters: "false", ...(list ? {locator: "count:100,recursive:false,hidden:false,browseArchives:false"} : {}), fields: list ? "count,file(name,size,modificationTime)" : "name,size,modificationTime"}, body: "", baselineResponse: list ? {file: [{name: "src", size: 7, extra: true}]} : {name: "src", size: 7, extra: true}, baselineResult: list ? {count: 1, items: [{name: "src", size: 7}]} : {name: "src", size: 7}, human: list ? "NAME  SIZE  MODIFIED\nsrc   7 B\n" : "name: src\nsize: 7\n", stderr: "", collection: "", fileCollection: list, permission: "ReadOnly", preflight: null};
});
projectionAcceptance("US-022", cases, {native: 1, paging: 1, mutation: 3, parity: 2, denied: 4, error: 5, blank: 6});
