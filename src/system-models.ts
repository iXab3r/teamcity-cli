import {
  array,
  object,
  inputRecord,
  apiInputRecord,
  inputText,
  inputIds,
  safeScalars,
} from "./triage-models.js";
import { pathSegment, inputProperties, safeProperty, type RawProperty } from "./authoring-models.js";
import { idPath, nestedId, joinLocator, integerId } from "./locator.js";
import { open, lstat } from "node:fs/promises";
import { basename } from "node:path";
import { constants } from "node:fs";
import type { ScopedSecrets } from "@eyeauras/cli-factory";
import { requireInputSecret } from "./credential-inputs.js";

export const dashboardFields = "id,name,project(id)";
export const instanceFields = "id,currentState,deploymentDashboard(id)";
export const auditFields = "id,timestamp,action(id,name)";
export const healthFields = "identity,severity,healthCategory(id,name)";
export const pluginFields = "name,displayName,version,loaded,disabled";
export const roleFields = "id,name,permissions(permission(id)),included(role(id))";
export const licenseFields =
  "valid,active,expired,obsolete,expirationDate,maintenanceEndDate,type,servers,agents,unlimitedAgents,buildTypes,unlimitedBuildTypes,pipelines,unlimitedPipelines";
export const licenseSummaryFields =
  "serverLicenseType,maxAgents,unlimitedAgents,maxBuildTypes,unlimitedBuildTypes";
export function collection(value: unknown, key: string, project: (v: unknown) => unknown) {
  const raw = object(value),
    items = array(raw[key]);
  const count = raw.count ?? items.length;
  if (!Number.isSafeInteger(count) || Number(count) < 0)
    throw new Error("Invalid collection count.");
  return { count, items: items.map(project) };
}
export const safeCategory = (v: unknown) => safeScalars(v, ["id", "name"]);
export function safeDashboard(value: unknown) {
  const v = object(value);
  return {
    ...safeScalars(v, ["id", "name"]),
    ...(v.project === undefined ? {} : { project: safeScalars(v.project, ["id"]) }),
  };
}
export function safeInstance(value: unknown) {
  const v = object(value);
  return {
    ...safeScalars(v, ["id", "currentState"]),
    ...(v.deploymentDashboard === undefined
      ? {}
      : { deploymentDashboard: safeScalars(v.deploymentDashboard, ["id"]) }),
  };
}
export function safeAudit(value: unknown) {
  const v = object(value);
  return {
    ...safeScalars(v, ["id", "timestamp"]),
    ...(v.action === undefined ? {} : { action: safeCategory(v.action) }),
  };
}
export function safeHealth(value: unknown) {
  const v = object(value);
  return {
    ...safeScalars(v, ["identity", "severity"]),
    ...(v.healthCategory === undefined ? {} : { healthCategory: safeCategory(v.healthCategory) }),
  };
}
export const safePlugin = (v: unknown) => safeScalars(v, pluginFields.split(","));
export const safeLicense = (v: unknown) => safeScalars(v, licenseFields.split(","));
export const dashboardPath = (id: string) =>
  "/app/rest/deploymentDashboards/" + idPath(id, "Dashboard ID");
export const instancePath = (dashboard: string, id: string) =>
  dashboardPath(dashboard) + "/instances/" + idPath(id, "Instance ID");
export const rolePath = (id: string) =>
  "/app/rest/roles/id:" + pathSegment(inputText(id, "Role ID"));
export function stateEntry(state: string | undefined, date: string | undefined, build?: string) {
  return {
    ...(state === undefined ? {} : { state: inputText(state, "State") }),
    ...(date === undefined ? {} : { deploymentDate: inputText(date, "Deployment date") }),
    ...(build === undefined
      ? {}
      : { build: { id: Number(integerId(build, "Build ID")) } }),
  };
}
export function healthLocator(
  options: { project?: string; global?: boolean; category?: string },
) {
  if (options.global !== undefined) boolean(options.global);
  return joinLocator(
    options.project === undefined ? undefined : nestedId("project", options.project, "Project ID"),
    options.global === undefined ? undefined : `global:${options.global}`,
    options.category === undefined ? undefined : nestedId("healthCategory", options.category, "Category ID"),
  );
}
export function userId(id: string) {
  return inputText(id, "User ID");
}
export function safeRole(value: unknown) {
  const v = object(value);
  return {
    ...safeScalars(v, ["id", "name"]),
    permissions: {
      permission: array(
        v.permissions === undefined ? undefined : object(v.permissions).permission,
      ).map((x) => safeScalars(x, ["id"])),
    },
    included: {
      role: array(v.included === undefined ? undefined : object(v.included).role).map((x) =>
        safeScalars(x, ["id"]),
      ),
    },
  };
}
export function idsOrEmpty(ids: readonly string[]) {
  return ids.length ? inputIds(ids) : [];
}
export function boolean(value: unknown) {
  if (typeof value !== "boolean") throw new Error("Expected a boolean.");
  return value;
}
export function integer(value: unknown) {
  if (typeof value !== "number" || !Number.isSafeInteger(value))
    throw new Error("Expected a safe integer.");
  return value;
}
export const globalKeys = [
  "defaultQuietPeriod",
  "defaultExecutionTimeout",
  "maxArtifactsNumber",
  "maxArtifactSize",
  "enforceDefaultVCSCheckInterval",
  "defaultVCSCheckInterval",
];
export function globalPatch(value: unknown) {
  const v = apiInputRecord(value, globalKeys),
    result: Record<string, unknown> = { ...v };
  for (const [k, x] of Object.entries(v)) {
    if (!globalKeys.includes(k)) continue;
    result[k] =
      k === "enforceDefaultVCSCheckInterval"
        ? boolean(x)
        : integer(x);
  }
  return result;
}
export const safeGlobal = (v: unknown) =>
  safeScalars(v, [...globalKeys, "useEncryption", "artifactsDomainIsolation"]);
export function cleanupPatch(value: unknown) {
  const v = apiInputRecord(value, ["enabled", "maxCleanupDuration", "daily", "cron"]),
    result: Record<string, unknown> = { ...v };
  if (v.enabled !== undefined) result.enabled = boolean(v.enabled);
  if (v.maxCleanupDuration !== undefined) result.maxCleanupDuration = integer(v.maxCleanupDuration);
  if (v.daily !== undefined) {
    const d = apiInputRecord(v.daily, ["hour", "minute"]);
    result.daily = { ...d,
      ...(d.hour === undefined ? {} : { hour: integer(d.hour) }),
      ...(d.minute === undefined ? {} : { minute: integer(d.minute) }),
    };
  }
  if (v.cron !== undefined) {
    const c = apiInputRecord(v.cron, ["minute", "hour", "day", "month", "dayWeek"]);
    result.cron = { ...c };
    for (const k of ["minute", "hour", "day", "month", "dayWeek"])
      if (c[k] !== undefined) inputText(c[k], "Cron field");
  }
  return result;
}
export function safeCleanup(value: unknown) {
  const v = object(value);
  return {
    ...safeScalars(v, ["enabled", "maxCleanupDuration"]),
    ...(v.daily == null ? {} : { daily: safeScalars(v.daily, ["hour", "minute"]) }),
    ...(v.cron == null
      ? {}
      : { cron: safeScalars(v.cron, ["minute", "hour", "day", "month", "dayWeek"]) }),
  };
}
const authBooleans = [
  "allowGuest",
  "collapseLoginForm",
  "perProjectPermissions",
  "emailVerification",
];
// Replace output stays names-only: the server can echo secrets the caller just submitted.
export function safeAuth(value: unknown, withProperties = false) {
  const v = object(value);
  return {
    ...safeScalars(v, [...authBooleans, "buildAuthenticationMode"]),
    modules: array(v.modules === undefined ? undefined : object(v.modules).module).map((x) => {
      const m = object(x);
      return {
        ...safeScalars(m, ["name"]),
        ...(!withProperties || m.properties == null
          ? {}
          : { properties: array(object(m.properties).property).map((p) => safeProperty(p as RawProperty)) }),
      };
    }),
  };
}
export async function authBody(value: unknown, secrets: ScopedSecrets) {
  const v = apiInputRecord(value, [...authBooleans, "buildAuthenticationMode", "modules"]),
    result: Record<string, unknown> = { ...v };
  for (const k of authBooleans) if (v[k] !== undefined) result[k] = boolean(v[k]);
  if (v.buildAuthenticationMode !== undefined)
    result.buildAuthenticationMode = inputText(v.buildAuthenticationMode, "Mode");
  if (v.modules === undefined) return result;
  const moduleEnvelope = Array.isArray(v.modules) ? {} : apiInputRecord(v.modules, ["module"]);
  const modules = Array.isArray(v.modules) ? v.modules : array(moduleEnvelope.module);
  if (!Array.isArray(v.modules) && moduleEnvelope.module === undefined) return result;
  const prepared = [];
  for (const item of modules) {
    const m = apiInputRecord(item, ["name", "properties", "secrets"]),
      name = m.name === undefined ? undefined : inputText(m.name, "Module name");
    const propertyEnvelope = m.properties === undefined ? {} : inputProperties(m.properties);
    const properties = array(propertyEnvelope?.property).map(value => apiInputRecord(value, []));
    const directNames = new Set(properties.map((p) => p.name));
    for (const item of array(m.secrets)) {
      const s = inputRecord(item, ["name", "alias"]);
      const name = inputText(s.name, "Property name"),
        alias = inputText(s.alias, "Alias");
      if (directNames.has(name)) continue;
      properties.push({
        name,
        value: await requireInputSecret(secrets, alias),
      });
    }
    const { secrets: aliases, ...native } = m;
    prepared.push({ ...native, ...(name === undefined ? {} : { name }),
      ...(m.properties === undefined && m.secrets === undefined ? {} : { properties: m.secrets === undefined ? propertyEnvelope : { ...propertyEnvelope, property: properties } }) });
  }
  return { ...result, modules: { ...moduleEnvelope, module: prepared } };
}
export function safeMetric(value: unknown) {
  const v = object(value);
  return {
    ...safeScalars(v, ["name", "prometheusName"]),
    values: array(
      v.metricValues === undefined ? undefined : object(v.metricValues).metricValue,
    ).map((x) => {
      const m = object(x);
      if (typeof m.value !== "number" || !Number.isFinite(m.value))
        throw new Error("Invalid numeric metric.");
      return safeScalars(m, ["name", "value"]);
    }),
  };
}
// Deliberately parse the attribute-only plugin projection, not a general XML document.
export function pluginXml(value: string) {
  if (/<!|&(?!(?:amp|lt|gt|quot|apos);)/.test(value))
    throw new Error("Unsafe or unsupported plugin XML.");
  const match = value.match(
    /^\s*(?:<\?xml\s+[^?]*\?>\s*)?<plugin\b([^<>]*?)(?:\s*\/\s*>|>\s*<\/plugin>)\s*$/,
  );
  if (!match) throw new Error("Expected projected plugin XML.");
  const attrs = match[1]!,
    raw: Record<string, unknown> = {};
  let offset = 0;
  const pattern = /\s+([A-Za-z][\w.-]*)\s*=\s*(?:"([^"<]*)"|'([^'<]*)')/gy;
  while (offset < attrs.length) {
    pattern.lastIndex = offset;
    const a = pattern.exec(attrs);
    if (!a) {
      if (attrs.slice(offset).trim()) throw new Error("Malformed plugin XML.");
      break;
    }
    const key = a[1]!,
      text = a[2] ?? a[3] ?? "";
    if (Object.hasOwn(raw, key)) throw new Error("Duplicate XML attribute.");
    raw[key] = text.replace(
      /&(amp|lt|gt|quot|apos);/g,
      (_, e: string) => ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" })[e]!,
    );
    offset = pattern.lastIndex;
  }
  for (const key of ["loaded", "disabled"])
    if (raw[key] !== undefined) {
      if (raw[key] !== "true" && raw[key] !== "false") throw new Error("Invalid plugin boolean.");
      raw[key] = raw[key] === "true";
    }
  if (typeof raw.name !== "string") throw new Error("Plugin identity is missing.");
  return safePlugin(raw);
}
export async function avatarInput(path: string) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink())
    throw new Error("Avatar input must be a regular file.");
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    if (!(await file.stat()).isFile()) throw new Error("Expected regular avatar file.");
    const data = await file.readFile();
    const png = data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpeg = data[0] === 255 && data[1] === 216 && data[2] === 255;
    const form = new FormData();
    form.set(
      "avatar",
      new Blob([data], { type: png ? "image/png" : jpeg ? "image/jpeg" : "application/octet-stream" }),
      basename(path),
    );
    return form;
  } finally {
    await file.close();
  }
}
