import {
  stepBody,
  extensionBody,
  snapshotBody,
} from "./authoring-models.js";
import { ruleBody } from "./advanced-authoring-models.js";
import { requiredText } from "./locator.js";
import { apiInputRecord } from "./triage-models.js";

export type SettingsCollection =
  | "steps"
  | "features"
  | "triggers"
  | "agent-requirements"
  | "artifact-dependencies"
  | "snapshot-dependencies"
  | "vcs-root-entries"
  | "projectFeatures";
export type ParameterPart = "value" | "type" | "type/rawValue";
export function textIds(values: readonly string[]): string[] {
  const ids = values.map((value) => requiredText(value, "ID"));
  return ids;
}
export function settingsItems(
  kind: SettingsCollection,
  ownerId: string,
  values: readonly unknown[],
): object[] {
  return values.map(value => {
    const item = apiInputRecord(value, []);
    switch (kind) {
      case "steps": return stepBody(item);
      case "features":
      case "triggers": return extensionBody(item);
      case "projectFeatures": return stepBody(item);
      case "agent-requirements":
      case "artifact-dependencies": return ruleBody(ownerId, { ...item, kind }, item.kind === undefined ? {} : { kind: item.kind });
      case "snapshot-dependencies": return snapshotBody(ownerId, item);
      case "vcs-root-entries": {
        const { rootId, rules, ...native } = item;
        return {
          ...(rootId === undefined ? {} : { "vcs-root": { id: requiredText(rootId as string, "Root ID") } }),
          ...(rules === undefined ? {} : { "checkout-rules": requiredText(rules as string, "Checkout rules") }),
          ...native,
        };
      }
    }
  });
}
export interface ApprovalSummary {
  status?: string;
  canBeApprovedByCurrentUser?: boolean;
  configurationValid?: boolean;
  timeoutTimestamp?: string;
}
export const approvalFields =
  "status,canBeApprovedByCurrentUser,configurationValid,timeoutTimestamp";
export function safeApproval(value: ApprovalSummary): ApprovalSummary {
  return {
    ...(value.status === undefined ? {} : { status: value.status }),
    ...(value.canBeApprovedByCurrentUser === undefined
      ? {}
      : { canBeApprovedByCurrentUser: value.canBeApprovedByCurrentUser }),
    ...(value.configurationValid === undefined
      ? {}
      : { configurationValid: value.configurationValid }),
    ...(value.timeoutTimestamp === undefined ? {} : { timeoutTimestamp: value.timeoutTimestamp }),
  };
}
