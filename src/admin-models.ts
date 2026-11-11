import type { ScopedSecrets } from "@eyeauras/cli-factory";
import { locatorValue, idPath, requiredText } from "./locator.js";
import { pathSegment } from "./authoring-models.js";
import { textIds } from "./bulk-configuration-models.js";
import {
  array,
  inputRecord,
  apiInputRecord,
  collectionEnvelope,
  inputText,
  object,
  safeScalars,
} from "./triage-models.js";

export const adminCategories = [
  {
    name: "Admin",
    description: "Change remote accounts, access policy and server administration",
    enabledByDefault: false,
  },
  {
    name: "Credentials",
    description: "Issue/revoke remote credentials or remove explicitly owned local credentials",
    enabledByDefault: false,
  },
];
export type AccountKind = "users" | "groups";
export const accountUserFields = "id,username,name";
export const groupFields = "key,name,description";
export const nodeFields = "id,role,state,current";
export const responsibilityFields = "count,responsibility(name,description)";
export const tokenFields = "name,creationTime,expirationTime";
export const groupLocator = (key: string) => "key:" + locatorValue(key, "Group key");
export function accountPath(kind: AccountKind, id: string) {
  return kind === "users"
    ? "/app/rest/users/" + idPath(id, "User ID")
    : "/app/rest/userGroups/" + groupLocator(id);
}
export const safeAccountUser = (value: unknown) => safeScalars(value, ["id", "username", "name"]);
export const safeGroup = (value: unknown) => safeScalars(value, ["key", "name", "description"]);
export const safeNode = (value: unknown) => safeScalars(value, ["id", "role", "state", "current"]);
export const safeRole = (value: unknown) => safeScalars(value, ["roleId", "scope"]);
export function groupKeys(keys: readonly string[]) {
  return { group: textIds(keys).map((key) => ({ key })) };
}
export interface RoleInput {
  roleId?: string;
  scope?: string;
  [key: string]: unknown;
  global?: boolean;
  project?: string;
}
function assignmentScope(input: { global?: unknown; project?: unknown }) {
  if (input.global !== undefined && typeof input.global !== "boolean")
    throw new Error("Global scope must be a boolean.");
  if (input.global === true && input.project !== undefined)
    throw new Error("Choose either global or project scope.");
  return input.global === true ? "g" : input.project === undefined ? undefined : "p:" + inputText(input.project, "Project ID");
}
export function roleBody(value: unknown): Record<string, unknown> {
  const { global, project, ...native } = apiInputRecord(value, []);
  if (global !== undefined && typeof global !== "boolean") throw new Error("Global scope must be a boolean.");
  if (global === true && project !== undefined) return { ...native, global, project };
  const scope = native.scope === undefined ? assignmentScope({ global, project }) : native.scope;
  return { ...native, ...(scope === undefined ? {} : { scope }) };
}
export function roleSuffix(input: RoleInput) {
  const role = { roleId: input.roleId, scope: input.scope ?? assignmentScope(input) };
  return { role, suffix: "/" + pathSegment(inputText(role.roleId, "Role ID")) + "/" + pathSegment(inputText(role.scope, "Scope")) };
}
export function roleBodies(inputs: readonly unknown[]) {
  return collectionEnvelope(inputs, "role") ?? { role: inputs.map(roleBody) };
}
export function safeToken(value: unknown) {
  const raw = object(value);
  return {
    ...safeScalars(raw, ["name", "creationTime"]),
    ...(raw.expirationTime === undefined
      ? {}
      : raw.expirationTime === null
        ? { expirationTime: null }
        : safeScalars(raw, ["expirationTime"])),
  };
}
export interface TokenCreationOptions {
  name: string;
  alias: string;
  expires?: string;
  noExpiration?: boolean;
  samePermissions?: boolean;
  restrictions?: readonly unknown[];
  item?: Record<string, unknown>;
}
export function tokenBody(input: TokenCreationOptions) {
  const name = inputText(input.name, "Name");
  const permissionRestriction = input.restrictions?.map(value => {
    const { global, project, ...native } = apiInputRecord(value, []);
    return {
      ...(global === undefined ? {} : { isGlobalScope: global }),
      ...(project === undefined ? {} : { project: typeof project === "string" ? { id: project } : project }),
      ...native,
      ...(typeof native.permission === "string" ? { permission: { id: native.permission } } : {}),
    };
  });
  return {
    name,
    ...(input.expires === undefined ? {} : { expirationTime: inputText(input.expires, "Expiration time") }),
    ...(permissionRestriction === undefined ? {} : { permissionRestrictions: { permissionRestriction } }),
    ...input.item,
  };
}
export function credentialAlias(alias: string) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(alias))
    throw new Error("Invalid issued-token alias.");
  return alias;
}
export const issuedTokenKey = (alias: string) => "issued-token:" + credentialAlias(alias);
export async function readIssuedToken(secrets: ScopedSecrets, alias: string) {
  const key = issuedTokenKey(alias);
  try {
    return await secrets.get(key);
  } catch {
    throw new Error("Could not inspect the issued-token credential store; no HTTP was attempted.");
  }
}
export function issuedTokenName(contents: string): string {
  try {
    const item = object(JSON.parse(contents));
    if (typeof item.name !== "string" || typeof item.value !== "string" || !item.value)
      throw new Error();
    return requiredText(item.name, "Token name");
  } catch {
    throw new Error("Invalid issued-token secure record; contents omitted.");
  }
}
export async function forgetIssuedToken(secrets: ScopedSecrets, alias: string) {
  const contents = await readIssuedToken(secrets, alias);
  if (contents === undefined) throw new Error("Issued-token alias does not exist.");
  issuedTokenName(contents);
  try {
    await secrets.delete(issuedTokenKey(alias));
  } catch {
    throw new Error("Could not remove the issued-token secure record; contents omitted.");
  }
  return { alias, forgotten: true };
}
export function responsibilities(value: unknown) {
  return array(object(value).responsibility).map((item) =>
    safeScalars(item, ["name", "description"]),
  );
}
