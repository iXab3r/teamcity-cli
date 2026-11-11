import { nativeInput } from "./command-support.js";
import { fieldsOption, fieldsFromOptions } from "./projection.js";
import { fieldOption, locatorOption } from "./command-support.js";
import { stringList, withView } from "./presentation.js";
import { command, Permission, type OptionDefinition } from "@eyeauras/cli-factory";
import { text, optionalText, option, propertyOption, jsonOption, type ClientLeaf } from "./command-support.js";
import type { PlainProperty } from "./authoring-models.js";
import type { EntitySettingsKind, RuleInput, RuleKind } from "./advanced-authoring-models.js";
import type { createBulkConfigurationCommands } from "./bulk-configuration-commands.js";

export function createAdvancedAuthoringCommands(
  leaf: ClientLeaf,
  pageOptions: readonly OptionDefinition[],
  bulk: ReturnType<typeof createBulkConfigurationCommands>,
) {
  function entityFields(kind: EntitySettingsKind) {
    const arg =
      kind === "steps"
        ? "step-id"
        : kind === "features"
          ? "feature-id"
          : kind === "triggers"
            ? "trigger-id"
            : kind === "agent-requirements"
              ? "requirement-id"
              : "dependency-id";
    return command(
      "fields",
      "Manage scalar entity settings",
      [
        leaf(
          `show <job-id> <${arg}> <field>`,
          "Read a scalar entity setting",
          Permission.ReadOnly,
          (c, { args }) =>
            c.getEntitySetting(kind, text(args, "job-id"), text(args, arg), text(args, "field")),
        ),
        leaf(
          `set <job-id> <${arg}> <field> <value>`,
          "Set a rule setting",
          Permission.Update,
          (c, { args }) =>
            c.setEntitySetting(
              kind,
              text(args, "job-id"),
              text(args, arg),
              text(args, "field"),
              text(args, "value"),
            ),
        ),
      ],
    );
  }
  function pluginParameters(kind: "steps" | "features") {
    const arg = kind === "steps" ? "step-id" : "feature-id";
    return command("parameters", "Manage plugin parameters", [
      leaf(
        `list <job-id> <${arg}>`,
        "List property values",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.listPluginParameters(kind, text(args, "job-id"), text(args, arg), fieldsFromOptions(options)),
        [fieldsOption],
      ),
      leaf(
        `show <job-id> <${arg}> <name>`,
        "Show a property value",
        Permission.ReadOnly,
        (c, { args }) =>
          c.getPluginParameter(kind, text(args, "job-id"), text(args, arg), text(args, "name")),
      ),
      leaf(
        `replace <job-id> <${arg}>`,
        "Replace all plugin parameters",
        Permission.Update,
        (c, { args, options }) =>
          c.replacePluginParameters(
            kind,
            text(args, "job-id"),
            text(args, arg),
            (options.property ?? []) as PlainProperty[],
            fieldsFromOptions(options),
            nativeInput(options),
          ),
        [propertyOption, fieldsOption, jsonOption("--item <json>", "Supply a native body")],
      ),
      leaf(
        `set <job-id> <${arg}> <name> <value>`,
        "Set a plugin property",
        Permission.Update,
        (c, { args }) =>
          c.setPluginParameter(
            kind,
            text(args, "job-id"),
            text(args, arg),
            text(args, "name"),
            text(args, "value"),
          ),
      ),
    ]);
  }
  function rules(kind: RuleKind) {
    const requirement = kind === "agent-requirements";
    const arg = requirement ? "requirement-id" : "dependency-id";
    const options = [
      jsonOption("--item <json>", "Supply a native rule body"),
      option("--disabled", "Disable this rule"),
      ...(requirement
        ? [
            option("--type <type>", "Set the requirement type"),
            option("--parameter <name>", "Select an agent parameter"),
            option("--value <value>", "Set the requirement value"),
          ]
        : [
            option("--source <job-id>", "Select an upstream job"),
            option("--rules <rules>", "Set artifact path rules"),
            option(
              "--revision <revision-name>",
              "Set the revision rule",
              false,
            ),
            option("--revision-value <value>", "Set the revision value"),
            option("--branch <branch>", "Select the source branch"),
            option("--clean", "Clean the destination directory"),
          ]),
    ];
    const input = (values: Record<string, unknown>): RuleInput =>
      requirement
        ? {
            kind: "agent-requirements",
            ...optionalText(values, "type"),
            ...optionalText(values, "parameter"),
            ...optionalText(values, "value"),
            ...(values.disabled === undefined ? {} : { disabled: values.disabled as boolean }),
          }
        : {
            kind: "artifact-dependencies",
            ...optionalText(values, "source"),
            ...optionalText(values, "rules"),
            ...optionalText(values, "revision"),
            ...optionalText(values, "revisionValue"),
            ...optionalText(values, "branch"),
            ...(values.clean === undefined ? {} : { clean: values.clean as boolean }),
            ...(values.disabled === undefined ? {} : { disabled: values.disabled as boolean }),
          };
    return command(kind, "Manage job rules", [
      bulk.replaceAll(kind),
      entityFields(kind),
      leaf(
        "list <job-id>",
        "List rules in server order",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.listRules(kind, args["job-id"], fieldsFromOptions(options)),
        [fieldsOption],

      ),
      leaf(
        `show <job-id> <${arg}>`,
        "Show a safe rule summary",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.getRule(kind, text(args, "job-id"), text(args, arg), fieldsFromOptions(options)),
        [fieldsOption],
      ),
      leaf(
        "create <job-id>",
        "Add a rule",
        Permission.Update,
        (c, { args, options }) => c.createRule(args["job-id"], input(options), fieldsFromOptions(options), nativeInput(options)),
        [...options, fieldsOption],
      ),
      leaf(
        `replace <job-id> <${arg}>`,
        "Replace all rule settings",
        Permission.Update,
        (c, { args, options }) =>
          c.replaceRule(text(args, "job-id"), text(args, arg), input(options), fieldsFromOptions(options), nativeInput(options)),
        [...options, fieldsOption],
      ),
      leaf(
        `delete <job-id> <${arg}>`,
        "Remove a job rule",
        Permission.Update,
        (c, { args, options }) => c.deleteRule(kind, text(args, "job-id"), text(args, arg)),
      ),
    ]);
  }
  const featureOptions = [option("--type <type>", "Set the project feature type"), propertyOption, jsonOption("--item <json>", "Supply a native feature body")];
  const features = command("features", "Manage project features", [
    bulk.replaceAll("projectFeatures"),
    leaf(
      "list <project-id>",
      "List project features",
      Permission.ReadOnly,
      (c, { args, options }) =>
        c.listProjectFeatures(
          args["project-id"],
          fieldsFromOptions(options),
          options.locator as string | undefined,
        ),
      [fieldsOption, { ...locatorOption, description: "Filter native TeamCity project features" }],

    ),
    leaf(
      "show <project-id> <feature-id>",
      "Show a project feature",
      Permission.ReadOnly,
      (c, { args, options }) =>
        c.getProjectFeature(args["project-id"], args["feature-id"], fieldsFromOptions(options)),
      [fieldsOption],
    ),
    leaf(
      "create <project-id>",
      "Create a project feature",
      Permission.Update,
      (c, { args, options }) =>
        c.createProjectFeature(
          args["project-id"],
          options.type as string | undefined,
          options.property as PlainProperty[] | undefined,
          fieldsFromOptions(options),
          nativeInput(options),
        ),
      [...featureOptions, fieldsOption],
    ),
    leaf(
      "replace <project-id> <feature-id>",
      "Replace all feature properties",
      Permission.Update,
      (c, { args, options }) =>
        c.replaceProjectFeature(
          args["project-id"],
          args["feature-id"],
          options.type as string | undefined,
          options.property as PlainProperty[] | undefined,
          fieldsFromOptions(options),
          nativeInput(options),
        ),
      [...featureOptions, fieldsOption],
    ),
    leaf(
      "delete <project-id> <feature-id>",
      "Delete one project feature",
      Permission.Update,
      (c, { args }) => c.deleteProjectFeature(args["project-id"], args["feature-id"]),
    ),
  ]);
  const templates = command("templates", "Create templates and manage the project default", [
    leaf("show <template-id>", "Show template configuration", Permission.ReadOnly, (c, { args }) =>
      c.getJobConfiguration(args["template-id"]),
    ),
    leaf(
      "list <project-id>",
      "List own templates",
      Permission.ReadOnly,
      (c, { args, options }) =>
        c.listProjectTemplates(args["project-id"], fieldsFromOptions(options)),
      [fieldsOption],

    ),
    leaf(
      "create <project-id> <template-id>",
      "Create an empty template",
      Permission.Update,
      (c, { args, options }) =>
        c.createProjectTemplate(
          args["project-id"],
          args["template-id"],
          options.name as string | undefined,
          fieldsFromOptions(options),
          nativeInput(options),
        ),
      [fieldsOption, option("--name <name>", "Set the template name"), jsonOption("--item <json>", "Supply a native template body")],
    ),
    command("default", "Manage the default template", [
      leaf(
        "show <project-id>",
        "Show the effective default template",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.getDefaultTemplate(args["project-id"], fieldsFromOptions(options)),
        [fieldsOption],
      ),
      leaf(
        "set <project-id>",
        "Set the default template",
        Permission.Update,
        (c, { args, options }) =>
          c.setDefaultTemplate(args["project-id"], options.template as string | undefined, fieldsFromOptions(options), nativeInput(options)),
        [fieldsOption, option("--template <template-id>", "Select an existing template"), jsonOption("--item <json>", "Supply a native body")],
      ),
      leaf(
        "clear <project-id>",
        "Remove the project default template",
        Permission.Update,
        (c, { args, options }) => c.clearDefaultTemplate(args["project-id"], fieldsFromOptions(options)),
        [fieldsOption],
      ),
    ]),
  ]);
  const fields = (owner: "projects" | "jobs") => {
    const arg = owner === "projects" ? "project-id" : "job-id";
    return command(
      "fields",
      "Read configuration fields",
      [
        leaf(
          `show <${arg}> <field>`,
          "Read a configuration field",
          Permission.ReadOnly,
          (c, { args }) => c.getOwnerField(owner, text(args, arg), text(args, "field")),
        ),
      ],
    );
  };
  return {
    entityFields,
    pluginParameters,
    projects: [
      features,
      templates,
      fields("projects"),
      leaf(
        "parent <project-id>",
        "Show parent project identity",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.getProjectParent(args["project-id"], fieldsFromOptions(options)),
        [fieldsOption],
      ),
    ],
    jobs: [
      command("configuration", "Inspect complete build configuration", [
        leaf("show <job-id>", "Show build configuration content", Permission.ReadOnly, (c, { args }) =>
          c.getJobConfiguration(args["job-id"]),
        ),
      ]),
      rules("agent-requirements"),
      rules("artifact-dependencies"),
      fields("jobs"),
      leaf(
        "aliases <job-id>",
        "List historical external IDs",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.listJobAliases(args["job-id"], options.field as string | undefined),
        [fieldOption],

      ),
      leaf(
        "branches <job-id>",
        "List branches",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.listJobBranches(args["job-id"], {
            limit: Number(options.limit),
            start: Number(options.start),
            fields: fieldsFromOptions(options),
          }),
        [...pageOptions, fieldsOption],
      ),
      withView(stringList, leaf(
        "tags <job-id>",
        "List tags used by this job's builds",
        Permission.ReadOnly,
        (c, { args, options }) => c.listJobTags(args["job-id"], options.field as string | undefined),
        [fieldOption],
      )),
    ],
  };
}
