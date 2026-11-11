import { requiredText } from "./locator.js";

export type ParameterOwner = "projects" | "jobs" | "output";
export interface PlainProperty {
  name: string;
  value: string;
}
export interface RawProperty {
  name: string;
  value?: string | null;
  inherited?: boolean;
  type?: { rawValue?: string };
}
export interface StepInput {
  name: string;
  type: string;
  properties?: readonly PlainProperty[];
}
export type ExtensionKind = "triggers" | "features";
export interface ExtensionInput {
  type: string;
  enabled?: boolean;
  properties?: readonly PlainProperty[];
}
export interface SnapshotDependencyInput {
  source: string;
  properties?: readonly PlainProperty[];
}
export interface BuildTypeIdentity {
  id: string;
  name?: string;
  projectId?: string;
}
export interface RawExtension {
  id: string;
  type: string;
  disabled?: boolean;
  inherited?: boolean;
  properties?: { property?: RawProperty[] };
}
export interface RawStep extends RawExtension {
  name?: string;
}
export interface RawSnapshotDependency extends RawExtension {
  "source-buildType"?: BuildTypeIdentity;
}
export interface VcsRoot {
  id: string;
  name: string;
  vcsName?: string;
  project?: { id: string; name?: string };
}
export interface RawVcsEntry {
  "vcs-root": VcsRoot;
  "checkout-rules"?: string;
}

export const propertyFields = "name,value,inherited,type(rawValue)";
export const stepFields = `id,name,type,disabled,inherited,properties(property(${propertyFields}))`;
export const extensionFields = `id,type,disabled,inherited,properties(property(${propertyFields}))`;
export const identityFields = "id,name,projectId";
export const snapshotFields = `${extensionFields},source-buildType(${identityFields})`;
export const rootFields = "id,name,vcsName,project(id,name)";
export const entryFields = `vcs-root(${rootFields}),checkout-rules`;

export function parameterType(property: RawProperty): string {
  if (property.type === undefined) return "plain";
  const spec = property.type?.rawValue;
  if (typeof spec !== "string") return "unknown";
  if (/^\s*password(?:\s|$)/i.test(spec)) return "protected";
  const kind = spec.trim().split(/\s+/)[0] ?? "";
  return kind === "" ? "plain" : kind;
}

export function safeProperty(property: RawProperty, exposeValue = true) {
  const redacted =
    !exposeValue ||
    isSecretProperty(property);
  return {
    name: property.name,
    ...(property.inherited === undefined ? {} : { inherited: property.inherited }),
    type: parameterType(property),
    redacted,
    ...(!redacted && property.value !== undefined ? { value: property.value } : {}),
  };
}

/** Read policy follows TeamCity metadata, independently of write inputs. */
export function isSecretProperty(property: RawProperty): boolean {
  return /^secure:/i.test(property.name) ||
    /^\s*password(?:\s|$)/i.test(property.type?.rawValue ?? "") ||
    property.value == null;
}

/** Retain native configuration shape, removing only server-protected property values. */
export function readableConfiguration(value: unknown, property = false): unknown {
  if (Array.isArray(value)) return value.map((item) => readableConfiguration(item, property));
  if (value === null || typeof value !== "object") return value;
  const raw = value as Record<string, unknown>;
  const result = Object.fromEntries(Object.entries(raw).map(([key, item]) =>
    [key, readableConfiguration(item, key === "property")]));
  if (typeof raw.name === "string" && (property || "value" in raw || typeof raw.type === "object" || /^secure:/i.test(raw.name)) &&
      isSecretProperty(raw as unknown as RawProperty)) {
    delete result.value;
    result.redacted = true;
  }
  return result;
}

export function plainProperty(name: string, value: string): PlainProperty {
  const normalized = requiredText(name, "Property name");
  if (typeof value !== "string") throw new Error("Property value must be text.");
  return { name: normalized, value };
}

export function propertiesBody(input: readonly PlainProperty[] = []) {
  const properties = input.map((p) => {
    const plain = plainProperty(p.name, p.value);
    return { ...p, ...plain };
  });
  return { property: properties };
}

export function stepBody(input: StepInput) {
  return {
    name: requiredText(input.name, "Step name"),
    type: requiredText(input.type, "Runner type"),
    properties: propertiesBody(input.properties),
  };
}

export function extensionBody(input: ExtensionInput) {
  return {
    type: requiredText(input.type, "Extension type"),
    ...(input.enabled === undefined ? {} : { disabled: !input.enabled }),
    properties: propertiesBody(input.properties),
  };
}

export function snapshotBody(jobId: string, input: SnapshotDependencyInput) {
  const source = requiredText(input.source, "Source build configuration ID");
  return {
    type: "snapshot_dependency",
    "source-buildType": { id: source },
    properties: propertiesBody(input.properties),
  };
}

export function safeExtension(extension: RawExtension) {
  return {
    id: extension.id,
    type: extension.type,
    ...(extension.disabled === undefined ? {} : { disabled: extension.disabled }),
    ...(extension.inherited === undefined ? {} : { inherited: extension.inherited }),
    properties: (extension.properties?.property ?? []).map((p) => safeProperty(p)),
  };
}

export function safeIdentity(identity: BuildTypeIdentity): BuildTypeIdentity {
  return {
    id: identity.id,
    ...(identity.name === undefined ? {} : { name: identity.name }),
    ...(identity.projectId === undefined ? {} : { projectId: identity.projectId }),
  };
}

export function safeSnapshot(dependency: RawSnapshotDependency) {
  const source = dependency["source-buildType"];
  return {
    ...safeExtension(dependency),
    ...(source === undefined ? {} : { source: safeIdentity(source) }),
  };
}

// These endpoints parse a single-value locator, not an id: dimension.
export function literalIdPath(id: string): string {
  const value = requiredText(id, "Resource ID");
  return /^[A-Za-z0-9_-]+$/.test(value)
    ? value
    : `$base64:${Buffer.from(value).toString("base64url")}`;
}

export function safeStep(step: RawStep) {
  return {
    id: step.id,
    name: step.name,
    type: step.type,
    ...(step.disabled === undefined ? {} : { disabled: step.disabled }),
    ...(step.inherited === undefined ? {} : { inherited: step.inherited }),
    properties: (step.properties?.property ?? []).map((p) => safeProperty(p)),
  };
}

export function safeRoot(root: VcsRoot): VcsRoot {
  return {
    id: root.id,
    name: root.name,
    ...(root.vcsName === undefined ? {} : { vcsName: root.vcsName }),
    ...(root.project === undefined
      ? {}
      : {
          project: {
            id: root.project.id,
            ...(root.project.name === undefined ? {} : { name: root.project.name }),
          },
        }),
  };
}

export function safeEntry(entry: RawVcsEntry) {
  return { root: safeRoot(entry["vcs-root"]), rules: entry["checkout-rules"] ?? "" };
}

export function pathSegment(value: string): string {
  const normalized = requiredText(value, "Path segment");
  // URL dot-segment normalization happens even for percent-encoded dots.
  if (normalized === "" || normalized === "." || normalized === "..")
    throw new Error("Expected one nonempty path segment without dot traversal.");
  return encodeURIComponent(normalized);
}
