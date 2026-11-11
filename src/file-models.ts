import { idPath, integerId } from "./locator.js";
import { object, safeScalars } from "./triage-models.js";
import { collection, integer } from "./system-models.js";
import { credentialAlias } from "./admin-models.js";
import { pathSegment } from "./authoring-models.js";
export type FileTree = "jobs" | "builds" | "instances" | "server";
export type DownloadFormat = "bytes" | "zip" | "png" | "svg";
export const fileFields = "name,size,modificationTime";
export const artifactFileFields = `${fileFields},children(href),content(href)`;
export function remotePath(value: string) {
  const parts = value.split("/");
  if (parts.some((p) => p === "." || p === ".."))
    throw new Error("Remote path contains dot segments.");
  return parts.map((p) => encodeURIComponent(p)).join("/");
}
export function treePath(kind: FileTree, id: string) {
  if (kind === "server")
    return "/app/rest/server/files/" + pathSegment(id);
  if (kind === "builds")
    return "/app/rest/builds/id:" + integerId(id, "Build ID") + "/artifacts";
  return kind === "jobs"
    ? "/app/rest/buildTypes/" + idPath(id, "Job ID") + "/vcs/files/latest"
    : "/app/rest/vcs-root-instances/" + idPath(id, "VCS instance ID") + "/files/latest";
}
export function fileQuery(kind: FileTree): Record<string, string> {
  return {};
}
export function fileLocator(count: number, browseArchives?: boolean) {
  integer(count);
  if (count < 0) throw new Error("File limit must be non-negative.");
  return `count:${count}${browseArchives === undefined ? "" : ",browseArchives:" + browseArchives}`;
}
export function safeFile(value: unknown) {
  const v = object(value);
  if (typeof v.name !== "string")
    throw new Error("Invalid file metadata.");
  if (v.size !== undefined) integer(v.size);
  return safeScalars(v, ["name", "size", "modificationTime"]);
}
export function safeArtifactFile(value: unknown) {
  const v = object(value);
  const hasChildren = v.children !== undefined && v.children !== null;
  const hasContent = v.content !== undefined && v.content !== null;
  return { ...safeFile(value), directory: hasChildren && !hasContent, archive: hasChildren && hasContent };
}
export const safeFiles = (v: unknown) => collection(v, "file", safeFile);
export function serverPath(value: string) {
  return { serverPath: value };
}
export const referenceKey = (alias: string) => "secure-reference:" + credentialAlias(alias);
export function sensitiveSegment(value: string) {
  if (
    !value ||
    value === "." ||
    value === ".."
  )
    throw new Error("Invalid secure reference; value omitted.");
  return encodeURIComponent(value);
}

export interface FileControls<F extends string | undefined = string | undefined> {
  fields?: F;
  basePath?: string;
  archiveName?: string;
  resolveParameters?: string;
  logBuildUsage?: string;
}
export function controlledFileQuery(
  kind: FileTree,
  controls: FileControls = {},
): Record<string, string> {
  return {
    ...fileQuery(kind),
    ...(controls.basePath === undefined ? {} : { basePath: controls.basePath }),
    ...(controls.archiveName === undefined ? {} : { name: controls.archiveName }),
    ...(controls.resolveParameters === undefined
      ? {}
      : { resolveParameters: controls.resolveParameters }),
    ...(controls.logBuildUsage === undefined ? {} : { logBuildUsage: controls.logBuildUsage }),
  };
}
