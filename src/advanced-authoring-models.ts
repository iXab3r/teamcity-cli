import { plainProperty, propertiesBody, inputProperties } from "./authoring-models.js";
import { requiredText } from "./locator.js";

export type RuleKind = "agent-requirements" | "artifact-dependencies";
export type EntitySettingsKind = RuleKind | "steps" | "features" | "triggers";
export interface RuleInput {
  [key: string]: unknown;
  kind: RuleKind;
  type?: string;
  parameter?: string;
  value?: string;
  source?: string;
  rules?: string;
  revision?: string;
  revisionValue?: string;
  branch?: string;
  clean?: boolean;
  disabled?: boolean;
}
export function booleanText(value: string): string {
  if (value !== "true" && value !== "false") throw new Error("Expected true or false.");
  return value;
}
export function allowedField(field: string, allowed: readonly string[], ignoreCase = false): string {
  if (!allowed.some(value => ignoreCase ? value.toLowerCase() === field.toLowerCase() : value === field))
    throw new Error(`Supported fields: ${allowed.join(", ")}.`);
  return field;
}
export function ruleBody(jobId: string, input: RuleInput, extra: Record<string, unknown> = {}) {
  const { kind, parameter, value, source, rules, revision, revisionValue, branch, clean, ...native } = input;
  for (const flag of [clean, input.disabled]) if (flag !== undefined && typeof flag !== "boolean")
    throw new Error("Rule flags must be booleans.");
  const properties = kind === "agent-requirements" ? [
    ...(parameter === undefined ? [] : [plainProperty("property-name", requiredText(parameter, "Parameter"))]),
    ...(value === undefined ? [] : [plainProperty("property-value", value)]),
  ] : [
    ...(rules === undefined ? [] : [plainProperty("pathRules", rules)]),
    ...(revision === undefined ? [] : [plainProperty("revisionName", revision)]),
    ...(revisionValue === undefined ? [] : [plainProperty("revisionValue", revisionValue)]),
    ...(branch === undefined ? [] : [plainProperty("revisionBranch", branch)]),
    ...(clean === undefined ? [] : [plainProperty("cleanDestinationDirectory", String(clean))]),
  ];
  return {
    ...(kind === "artifact-dependencies" && (source !== undefined || properties.length) ? { type: "artifact_dependency" } : {}),
    ...(source === undefined ? {} : { "source-buildType": { id: requiredText(source, "Source job ID") } }),
    ...(properties.length ? { properties: propertiesBody(properties) } : {}),
    ...native,
    ...(native.properties === undefined ? {} : { properties: inputProperties(native.properties) }),
    ...extra,
  };
}
