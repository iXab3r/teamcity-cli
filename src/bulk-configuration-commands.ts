import { nativeInput, booleanOption } from "./command-support.js";
import { fieldsOption, fieldsFromOptions } from "./projection.js";
import {
  command,
  Permission,
  type CommandContext,
  type OptionDefinition,
} from "@eyeauras/cli-factory";
import type { TeamCityClient } from "./client.js";
import {
  clientLeaf,
  fieldOption,
  option,
  propertyOption,
  text,
  repeatOption,
  jsonOption,
} from "./command-support.js";
import { booleanText } from "./advanced-authoring-models.js";
import type { ParameterOwner, PlainProperty } from "./authoring-models.js";
import type { ParameterPart, SettingsCollection } from "./bulk-configuration-models.js";

const confirm = option("--confirm", "Confirm clearing this collection", true);
const strings = (values: Record<string, unknown>, key: string) => (values[key] ?? []) as string[];
const number = (values: Record<string, unknown>, key: string) => Number(text(values, key));
const itemOption: OptionDefinition = {
  ...jsonOption(
    "--item <json>",
    "Repeat a configuration item",
    true,
  ),
  required: false,
};

export function createBulkConfigurationCommands(
  clientFor: (context: CommandContext) => Promise<TeamCityClient>,
  pageOptions: readonly OptionDefinition[],
) {
  const leaf = clientLeaf(clientFor);
  function parameters(owner: ParameterOwner) {
    const parts: ParameterPart[] =
      owner === "output" ? ["value"] : ["value", "type", "type/rawValue"];
    return [
      leaf(
        "replace-all <owner-id>",
        "Replace all parameters",
        Permission.Update,
        (c, { args, options }) =>
          c.replaceAllParameters(
            owner,
            args["owner-id"],
            (options.property ?? []) as PlainProperty[],
            fieldsFromOptions(options),
            nativeInput(options),
          ),
        [propertyOption, fieldsOption, jsonOption("--item <json>", "Supply a native body")],
      ),
      leaf(
        "clear <owner-id>",
        "Delete all own parameters",
        Permission.Update,
        (c, { args, options }) => c.clearParameters(owner, args["owner-id"], fieldsFromOptions(options)),
        [confirm, fieldsOption],
      ),
      ...parts.map((part) =>
        command(
          part === "type/rawValue" ? "raw-type" : part,
          "Inspect and change parameter metadata",
          [
            leaf(
              "show <owner-id> <name>",
              "Read parameter metadata",
              Permission.ReadOnly,
              (c, { args, options }) =>
                c.getParameterPart(owner, args["owner-id"], args.name, part, fieldsFromOptions(options)), [fieldsOption]
            ),
            leaf(
              "set <owner-id> <name> <value>",
              "Set a parameter value or type",
              Permission.Update,
              (c, { args, options }) =>
                c.setParameterPart(
                  owner,
                  args["owner-id"],
                  args.name,
                  part,
                  args.value,
                  nativeInput(options), fieldsFromOptions(options)
                ),
              [...part === "type" ? [jsonOption("--item <json>", "Supply a native type body")] : [], fieldsOption],
            ),
          ],
        ),
      ),
    ];
  }
  function replaceAll(kind: SettingsCollection) {
    return leaf(
      "replace-all <owner-id>",
      "Replace the collection",
      Permission.Update,
      (c, { args, options }) =>
        c.replaceAllSettings(
          kind,
          args["owner-id"],
          (options.item ?? []) as unknown[],
          [
            "projectFeatures",
            "steps",
            "features",
            "triggers",
            "agent-requirements",
            "artifact-dependencies",
            "snapshot-dependencies",
            "vcs-root-entries",
          ].includes(
            kind,
          ) ? fieldsFromOptions(options) : undefined,
        ),
      [itemOption, ...([
        "projectFeatures",
        "steps",
        "features",
        "triggers",
        "agent-requirements",
        "artifact-dependencies",
        "snapshot-dependencies",
        "vcs-root-entries",
      ].includes(
        kind,
      ) ? [fieldsOption] : [])],
    );
  }
  const templates = [
    leaf(
      "replace-all <job-id>",
      "Replace template attachments in order",
      Permission.Update,
      (c, { args, options }) =>
        c.replaceTemplates(
          args["job-id"],
          strings(options, "template"),
          options.optimizeSettings as boolean | undefined,
          fieldsFromOptions(options),
          nativeInput(options),
        ),
      [
        fieldsOption,
        repeatOption("--template <id>", "Repeat template IDs in priority order"),
        option("--optimize-settings", "Remove redundant local settings"),
        jsonOption("--item <json>", "Supply a native body"),
      ],
    ),
    leaf(
      "clear <job-id>",
      "Detach all templates",
      Permission.Update,
      (c, { args, options }) =>
        c.clearTemplates(args["job-id"], options.inlineSettings as boolean | undefined, fieldsFromOptions(options)),
      [confirm, option("--inline-settings", "Copy inherited settings locally before detaching"), fieldsOption],
    ),
  ];
  const jobs = [
    leaf(
      "builds <job-id>",
      "List native scoped builds in server order",
      Permission.ReadOnly,
      (c, { args, options }) => c.listJobBuilds(args["job-id"], fieldsFromOptions(options)),
      [fieldsOption],
    ),
  ];
  const projects = [
    command("pools", "Manage project pool assignments", [
      leaf(
        "list <project-id>",
        "List assigned pools",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.listProjectPools(args["project-id"], fieldsFromOptions(options)),
        [fieldsOption],

      ),
      leaf("assign <project-id> <pool-id>", "Assign one pool", Permission.Update, (c, { args, options }) =>
        c.assignProjectPool(args["project-id"], number(args, "pool-id"), nativeInput(options), fieldsFromOptions(options)), [jsonOption("--item <json>", "Supply a native body"), fieldsOption],
      ),
      leaf(
        "replace-all <project-id>",
        "Replace all pool assignments",
        Permission.Update,
        (c, { args, options }) =>
          c.replaceProjectPools(
            args["project-id"],
            strings(options, "pool").map(Number),
            fieldsFromOptions(options),
            nativeInput(options),
          ),
        [fieldsOption, repeatOption("--pool <id>", "Repeat pool IDs"), jsonOption("--item <json>", "Supply a native body")],
      ),
      leaf(
        "unassign <project-id> <pool-id>",
        "Remove one pool assignment",
        Permission.Update,
        (c, { args, options }) => c.unassignProjectPool(args["project-id"], number(args, "pool-id"), fieldsFromOptions(options)), [fieldsOption]
      ),
    ]),
    leaf(
      "branches <project-id>",
      "List branches",
      Permission.ReadOnly,
      (c, { args, options }) =>
        c.listProjectBranches(args["project-id"], {
          fields: fieldsFromOptions(options),
          limit: Number(options.limit),
          start: Number(options.start),
        }),
      [...pageOptions, fieldsOption],
    ),
    command("jobs", "Create jobs inside a project", [
      leaf(
        "create <project-id> <job-id>",
        "Create a named empty build configuration",
        Permission.Update,
        (c, { args, options }) =>
          c.createProjectJob(
            args["project-id"],
            args["job-id"],
            options.name as string | undefined,
            fieldsFromOptions(options),
            nativeInput(options),
          ),
        [fieldsOption, option("--name <name>", "Set the job name"), jsonOption("--item <json>", "Supply a native body")],
      ),
    ]),
    command(
      "order",
      "Inspect or replace custom project ordering",
      (["jobs", "projects"] as const).map((kind) =>
        command(kind, "Manage child ordering", [
          leaf(
            "show <project-id>",
            "Read custom child order",
            Permission.ReadOnly,
            (c, { args, options }) =>
              c.getProjectOrder(args["project-id"], kind, options.field as string | undefined, fieldsFromOptions(options)),
            [fieldOption, fieldsOption],
          ),
          leaf(
            "set <project-id>",
            "Replace custom child order",
            Permission.Update,
            (c, { args, options }) =>
              c.setProjectOrder(
                args["project-id"],
                kind,
                strings(options, "id"),
                options.field as string | undefined,
                nativeInput(options), fieldsFromOptions(options)
              ),
            [fieldOption, repeatOption("--id <id>", "Repeat IDs in order"), jsonOption("--item <json>", "Supply a native body"), fieldsOption],
          ),
        ]),
      ),
    ),
  ];
  const poolProjects = [
    leaf(
      "replace-all <pool-id>",
      "Replace all assigned projects",
      Permission.Update,
      (c, { args, options }) =>
        c.replacePoolProjects(number(args, "pool-id"), strings(options, "project"), nativeInput(options), fieldsFromOptions(options)),
      [repeatOption("--project <id>", "Repeat project IDs"), jsonOption("--item <json>", "Supply a native body"), fieldsOption],
    ),
    leaf(
      "clear <pool-id>",
      "Remove all project assignments",
      Permission.Update,
      (c, { args, options }) => c.clearPoolProjects(number(args, "pool-id"), fieldsFromOptions(options)),
      [confirm, fieldsOption],
    ),
  ];
  const queue = [
    leaf(
      "delete-page",
      "Delete one page of queued builds",
      Permission.Update,
      (c, { options }) =>
        c.deleteQueuePage(options.job as string | undefined, {
          limit: Number(options.limit),
          start: Number(options.start),
        },
          fieldsFromOptions(options),
        ),
      [option("--job <job-id>", "Select one job"), ...pageOptions, confirm, fieldsOption],
    ),
    leaf(
      "reorder",
      "Reorder selected queued builds",
      Permission.Update,
      (c, { options }) => c.reorderQueue(strings(options, "build").map(Number), fieldsFromOptions(options), nativeInput(options)),
      [repeatOption("--build <id>", "Repeat build IDs in order"), fieldsOption, jsonOption("--item <json>", "Supply a native body")],
    ),
    leaf(
      "delete <build-id>",
      "Delete a queued build and cancellation history",
      Permission.Update,
      (c, { args, options }) => c.deleteQueuedBuild(number(args, "build-id"), fieldsFromOptions(options)), [fieldsOption]
    ),
    command("paused", "Change global queue pause state", [
      leaf(
        "set <status>",
        "Set queue pause status",
        Permission.Update,
        (c, { args, options }) =>
          c.setQueuePaused(booleanText(args.status) === "true", options.reason as string | undefined, nativeInput(options), fieldsFromOptions(options)),
        [option("--reason <text>", "Set the pause reason"), jsonOption("--item <json>", "Supply a native body"), fieldsOption],
      ),
    ]),
    command("approval", "Inspect and approve queued builds", [
      leaf(
        "show <build-id>",
        "Show minimal approval status",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.getQueueApproval(number(args, "build-id"), fieldsFromOptions(options)),
        [fieldsOption],

      ),
      leaf(
        "approve <build-id>",
        "Approve one queued build",
        Permission.Update,
        (c, { args, options }) =>
          c.approveQueuedBuild(
            number(args, "build-id"),
            fieldsFromOptions(options),
            options.approveAll as string | undefined,
          ),
        [
          fieldsOption,
          booleanOption("--approve-all <boolean>", "Approve on behalf of all approvers"),
        ],
      ),
    ]),
  ];
  const agentTypes = command("types", "Inspect agent type identity", [
    leaf(
      "show <type-id>",
      "Show agent type identity",
      Permission.ReadOnly,
      (c, { args, options }) => c.getAgentType(number(args, "type-id"), fieldsFromOptions(options)),
      [fieldsOption],
    ),
  ]);
  return { parameters, replaceAll, templates, jobs, projects, poolProjects, queue, agentTypes };
}
