import { nativeInput } from "./command-support.js";
import { fieldsOption, fieldsFromOptions } from "./projection.js";
import {
  command,
  Permission,
  type CommandContext,
  type CommandDefinition,
  type OptionDefinition,
} from "@eyeauras/cli-factory";
import type { TeamCityClient } from "./client.js";
import { locatorOption, clientLeaf, text, optionalText, option, propertyOption, jsonOption } from "./command-support.js";
import { createAdvancedAuthoringCommands } from "./advanced-authoring-commands.js";
import type { createBulkConfigurationCommands } from "./bulk-configuration-commands.js";
import type {
  ExtensionKind,
  ParameterOwner,
  PlainProperty,
  StepInput,
} from "./authoring-models.js";

function stepInput(options: Record<string, unknown>): StepInput {
  return {
    ...optionalText(options, "name"),
    ...optionalText(options, "type"),
    ...(options.property === undefined ? {} : { properties: options.property as PlainProperty[] }),
  };
}

export function createAuthoringCommands(
  clientFor: (context: CommandContext) => Promise<TeamCityClient>,
  pageOptions: readonly OptionDefinition[],
  bulk: ReturnType<typeof createBulkConfigurationCommands>,
) {
  const leaf = clientLeaf(clientFor);
  const advanced = createAdvancedAuthoringCommands(leaf, pageOptions, bulk);

  const nameOption = option("--name <name>", "Set the display name");
  const descriptionOption = option("--description <text>", "Set the description");
  const parentOption = option("--parent <id>", "Select the parent project");
  const projectOption = option("--project <id>", "Select a project", true);

  function parameters(owner: ParameterOwner): CommandDefinition {
    const projections = [fieldsOption];
    const fields = (options: Record<string, unknown>) => fieldsFromOptions(options);
    const ownerArg = owner === "projects" ? "project-id" : "job-id";
    const valueOption = option(
      "--value <value>",
      "Set the parameter value",
      false,
    );
    return command(
      owner === "output" ? "output-parameters" : "parameters",
      "Manage parameters",
      [
        ...bulk.parameters(owner),
        ...(owner === "jobs" ? [command(
          "set-password <job-id> <name>",
          "Replace a password parameter",
          async ({ args, options }, context) =>
            (await clientFor(context)).setPasswordParameter(
              args["job-id"], args.name, options.valueSecret as string | undefined, context.secrets, options.value as string | undefined,
            ),
          { permission: "Credentials", options: [option("--value <value>", "Set the parameter value"), option("--value-secret <alias>", "Select an input-secret alias")] },
        )] : []),
        leaf(
          `list <${ownerArg}>`,
          "List parameters in server order",
          Permission.ReadOnly,
          (c, { args, options }) =>
            c.listParameters(
              owner,
              text(args, ownerArg),
              fields(options),
              options.locator as string | undefined,
            ),
          [...projections, { ...locatorOption, description: "Filter native TeamCity parameters" }],
        ),
        leaf(
          `show <${ownerArg}> <name>`,
          "Show parameter metadata and a safe value",
          Permission.ReadOnly,
          (c, { args, options }) =>
            c.getParameter(owner, text(args, ownerArg), text(args, "name"), fields(options)),
          projections,
        ),
        leaf(
          `create <${ownerArg}> <name>`,
          "Create a parameter",
          Permission.Update,
          (c, { args, options }) =>
            c.createParameter(
              owner,
              text(args, ownerArg),
              text(args, "name"),
              options.value as string | undefined,
              fields(options),
            ),
          [valueOption, ...projections],
        ),
        leaf(
          `set <${ownerArg}> <name>`,
          "Set a parameter",
          Permission.Update,
          (c, { args, options }) =>
            c.setParameter(
              owner,
              text(args, ownerArg),
              text(args, "name"),
              options.value as string | undefined,
              fields(options),
            ),
          [valueOption, ...projections],
        ),
        leaf(
          `delete <${ownerArg}> <name>`,
          "Delete one named parameter",
          Permission.Update,
          (c, { args }) => c.deleteParameter(owner, text(args, ownerArg), text(args, "name")),
        ),
      ],
    );
  }

  const stepOptions = [
    nameOption,
    option("--type <runner-type>", "Set the runner type"),
    propertyOption,
    jsonOption("--item <json>", "Supply a native body"),
  ];
  const extensionOptions = [
    option("--type <type>", "Set the extension type"),
    option("--enabled", "Enable the extension"),
    propertyOption,
    jsonOption("--item <json>", "Supply a native body"),
  ];
  function extensions(kind: ExtensionKind): CommandDefinition {
    const idArg = kind === "triggers" ? "trigger-id" : "feature-id";
    const input = (options: Record<string, unknown>) => ({
      ...optionalText(options, "type"),
      ...(options.enabled === undefined ? {} : { enabled: options.enabled === true }),
      ...(options.property === undefined ? {} : { properties: options.property as PlainProperty[] }),
    });
    return command(kind, "Manage job extensions", [
      bulk.replaceAll(kind),
      advanced.entityFields(kind),
      ...(kind === "features" ? [advanced.pluginParameters(kind)] : []),
      leaf(
        "list <job-id>",
        "List in server order",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.listExtensions(kind, args["job-id"], fieldsFromOptions(options)),
        [fieldsOption],

      ),
      leaf(
        `show <job-id> <${idArg}>`,
        "Show a safe summary",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.getExtension(kind, text(args, "job-id"), text(args, idArg), fieldsFromOptions(options)),
        [fieldsOption],

      ),
      leaf(
        "create <job-id>",
        "Add an extension",
        Permission.Update,
        (c, { args, options }) =>
          c.createExtension(kind, args["job-id"], input(options), fieldsFromOptions(options), nativeInput(options)),
        [...extensionOptions, fieldsOption],
      ),
      leaf(
        `replace <job-id> <${idArg}>`,
        "Replace an extension",
        Permission.Update,
        (c, { args, options }) =>
          c.replaceExtension(
            kind,
            text(args, "job-id"),
            text(args, idArg),
            input(options),
            fieldsFromOptions(options),
            nativeInput(options),
          ),
        [...extensionOptions, fieldsOption],
      ),
      leaf(`delete <job-id> <${idArg}>`, "Delete one extension", Permission.Update, (c, { args }) =>
        c.deleteExtension(kind, text(args, "job-id"), text(args, idArg)),
      ),
    ]);
  }
  const snapshotOptions = [
    option("--source <upstream-job-id>", "Select an upstream job"),
    propertyOption,
    jsonOption("--item <json>", "Supply a native body"),
  ];
  const snapshotInput = (options: Record<string, unknown>) => ({
    ...optionalText(options, "source"),
    ...(options.property === undefined ? {} : { properties: options.property as PlainProperty[] }),
  });
  const snapshots = command(
    "snapshot-dependencies",
    "Manage upstream build dependencies",
    [
      bulk.replaceAll("snapshot-dependencies"),
      leaf(
        "list <job-id>",
        "List dependencies in server order",
        Permission.ReadOnly,
        (c, { args, options }) => c.listSnapshotDependencies(args["job-id"], fieldsFromOptions(options)),
        [fieldsOption],
      ),
      leaf(
        "show <job-id> <dependency-id>",
        "Show a dependency summary",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.getSnapshotDependency(args["job-id"], args["dependency-id"], fieldsFromOptions(options)),
        [fieldsOption],
      ),
      leaf(
        "create <job-id>",
        "Add an upstream dependency",
        Permission.Update,
        (c, { args, options }) =>
          c.createSnapshotDependency(args["job-id"], snapshotInput(options), fieldsFromOptions(options), nativeInput(options)),
        [...snapshotOptions, fieldsOption],
      ),
      leaf(
        "replace <job-id> <dependency-id>",
        "Replace an upstream dependency",
        Permission.Update,
        (c, { args, options }) =>
          c.replaceSnapshotDependency(
            args["job-id"],
            args["dependency-id"],
            snapshotInput(options),
            fieldsFromOptions(options),
            nativeInput(options),
          ),
        [...snapshotOptions, fieldsOption],
      ),
      leaf(
        "delete <job-id> <dependency-id>",
        "Remove an upstream dependency",
        Permission.Update,
        (c, { args }) =>
          c.deleteSnapshotDependency(args["job-id"], args["dependency-id"]),
      ),
    ],
  );
  const templates = command("templates", "Manage attachments to existing templates", [
    ...bulk.templates,
    leaf(
      "show <job-id> <template-id>",
      "Show one attached template",
      Permission.ReadOnly,
      (c, { args, options }) =>
        c.getAttachedTemplate(args["job-id"], args["template-id"], fieldsFromOptions(options)),
      [fieldsOption],
    ),
    leaf(
      "list <job-id>",
      "List attached templates in priority order",
      Permission.ReadOnly,
      (c, { args, options }) => c.listTemplates(args["job-id"], fieldsFromOptions(options)),
      [fieldsOption],
    ),
    leaf(
      "attach <job-id>",
      "Attach a template",
      Permission.Update,
      (c, { args, options }) =>
        c.attachTemplate(
          args["job-id"],
          options.template as string | undefined,
          options.optimizeSettings as boolean | undefined,
          fieldsFromOptions(options),
        ),
      [
        fieldsOption,
        option("--template <template-id>", "Select an existing template"),
        option(
          "--optimize-settings",
          "Remove duplicated local settings",
        ),
      ],
    ),
    leaf(
      "detach <job-id> <template-id>",
      "Detach a template",
      Permission.Update,
      (c, { args, options }) =>
        c.detachTemplate(
          args["job-id"],
          args["template-id"],
          options.inlineSettings as boolean | undefined,
        ),
      [
        option(
          "--inline-settings",
          "Copy inherited settings before detaching",
        ),
      ],
    ),
  ]);
  const steps = command("steps", "Manage ordered build steps", [
    bulk.replaceAll("steps"),
    advanced.entityFields("steps"),
    advanced.pluginParameters("steps"),
    leaf(
      "list <job-id>",
      "List steps in execution order",
      Permission.ReadOnly,
      (c, { args, options }) =>
        c.listSteps(args["job-id"], fieldsFromOptions(options)),
      [fieldsOption],

    ),
    leaf(
      "show <job-id> <step-id>",
      "Show a safe step summary",
      Permission.ReadOnly,
      (c, { args, options }) => c.getStep(args["job-id"], args["step-id"], fieldsFromOptions(options)),
      [fieldsOption],
    ),
    leaf(
      "create <job-id>",
      "Add a build step",
      Permission.Update,
      (c, { args, options }) => c.createStep(args["job-id"], stepInput(options), fieldsFromOptions(options), nativeInput(options)),
      [...stepOptions, fieldsOption],
    ),
    leaf(
      "replace <job-id> <step-id>",
      "Replace a build step",
      Permission.Update,
      (c, { args, options }) =>
        c.replaceStep(args["job-id"], args["step-id"], stepInput(options), fieldsFromOptions(options), nativeInput(options)),
      [...stepOptions, fieldsOption],
    ),
    leaf("delete <job-id> <step-id>", "Delete one build step", Permission.Update, (c, { args }) =>
      c.deleteStep(args["job-id"], args["step-id"]),
    ),
  ]);

  const checkoutOption = option(
    "--checkout-rules <rules>",
    "Set checkout rules",
    true,
  );
  const vcs = command("vcs", "Manage existing VCS root attachments", [
    bulk.replaceAll("vcs-root-entries"),
    leaf(
      "list <job-id>",
      "List attached roots",
      Permission.ReadOnly,
      (c, { args, options }) => c.listVcsEntries(args["job-id"], fieldsFromOptions(options)),
      [fieldsOption],
    ),
    leaf(
      "show <job-id> <root-id>",
      "Show one root attachment",
      Permission.ReadOnly,
      (c, { args, options }) => c.getVcsEntry(args["job-id"], args["root-id"], fieldsFromOptions(options)),
      [fieldsOption],
    ),
    leaf(
      "attach <job-id>",
      "Attach an existing VCS root",
      Permission.Update,
      (c, { args, options }) =>
        c.attachVcsRoot(
          args["job-id"],
          options.root as string | undefined,
          typeof options.checkoutRules === "string" ? options.checkoutRules : "",
          fieldsFromOptions(options),
        ),
      [
        fieldsOption,
        option("--root <root-id>", "Select an existing VCS root"),
        { ...checkoutOption, required: false },
      ],
    ),
    leaf(
      "replace <job-id> <root-id>",
      "Replace a VCS root attachment",
      Permission.Update,
      (c, { args, options }) =>
        c.replaceVcsEntry(
          args["job-id"],
          args["root-id"],
          text(options, "checkoutRules"),
          fieldsFromOptions(options),
        ),
      [checkoutOption, fieldsOption],
    ),
    leaf(
      "detach <job-id> <root-id>",
      "Detach a VCS root",
      Permission.Update,
      (c, { args }) => c.detachVcsRoot(args["job-id"], args["root-id"]),
    ),
    command("checkout-rules", "Inspect or update checkout rules", [
      leaf("show <job-id> <root-id>", "Show checkout rules", Permission.ReadOnly, (c, { args }) =>
        c.getCheckoutRules(args["job-id"], args["root-id"]),
      ),
      leaf(
        "set <job-id> <root-id>",
        "Replace checkout rules",
        Permission.Update,
        (c, { args, options }) =>
          c.setCheckoutRules(args["job-id"], args["root-id"], options.rules as string | undefined),
        [option("--rules <rules>", "Set checkout rules")],
      ),
    ]),
  ]);
  const roots = [
    leaf(
      "list",
      "List VCS roots",
      Permission.ReadOnly,
      (c, { options }) =>
        c.listVcsRoots({
          ...optionalText(options, "project"),
          fields: fieldsFromOptions(options),
          limit: Number(options.limit),
          start: Number(options.start),
        }),
      [{ ...projectOption, required: false }, ...pageOptions, fieldsOption],
    ),
    leaf(
      "show <id>",
      "Show a VCS root identity",
      Permission.ReadOnly,
      (c, { args, options }) => c.getVcsRoot(args.id, fieldsFromOptions(options)),
      [fieldsOption],
    ),
  ];

  const projects = [
    ...bulk.projects,
    ...advanced.projects,
    parameters("projects"),
    leaf(
      "create <id>",
      "Create a project",
      Permission.Update,
      (c, { args, options }) =>
        c.createProject(args.id, {
          ...optionalText(options, "name"),
          ...optionalText(options, "parent"),
          ...optionalText(options, "description"),
          ...nativeInput(options),
        }),
      [nameOption, { ...parentOption, required: false }, descriptionOption, jsonOption("--item <json>", "Supply a native project body")],
    ),
    leaf(
      "set <id> <field> <value>",
      "Set project identity fields",
      Permission.Update,
      (c, { args }) =>
        c.setProjectField(args.id, args.field, args.value),
    ),
    leaf(
      "move <id>",
      "Move a project to a parent",
      Permission.Update,
      (c, { args, options }) => c.moveProject(args.id, options.parent as string | undefined, fieldsFromOptions(options)),
      [fieldsOption, parentOption],
    ),
    leaf(
      "delete <id>",
      "Delete a project and its contents",
      Permission.Update,
      (c, { args }) => c.deleteProject(args.id),
    ),
  ];
  const jobs = [
    leaf("copy <source-id> <id>", "Copy a build configuration", "Credentials",
      (c, { args, options }) => c.copyJob(args["source-id"], args.id, {
        ...optionalText(options, "name"), project: text(options, "project"),
      }, nativeInput(options)), [nameOption, projectOption, jsonOption("--item <json>", "Supply a native copy body")]),
    ...bulk.jobs,
    ...advanced.jobs,
    parameters("output"),
    parameters("jobs"),
    steps,
    vcs,
    extensions("triggers"),
    extensions("features"),
    snapshots,
    templates,
    leaf(
      "create <id>",
      "Create a build configuration",
      Permission.Update,
      (c, { args, options }) =>
        c.createJob(args.id, {
          ...optionalText(options, "name"),
          ...optionalText(options, "project"),
          ...optionalText(options, "description"),
          ...nativeInput(options),
        },
          fieldsFromOptions(options)
        ),
      [nameOption, { ...projectOption, required: false }, descriptionOption, fieldsOption, jsonOption("--item <json>", "Supply a native job body")],
    ),
    leaf(
      "set <id> <field> <value>",
      "Set job identity fields",
      Permission.Update,
      (c, { args }) => c.setJobField(args.id, args.field, args.value),
    ),
    leaf(
      "move <id>",
      "Move a job to a project",
      Permission.Update,
      (c, { args, options }) => c.moveJob(args.id, options.project as string | undefined),
      [{ ...projectOption, required: false }],
    ),
    leaf(
      "delete <id>",
      "Delete a job and its history",
      Permission.Update,
      (c, { args }) => c.deleteJob(args.id),
    ),
  ];
  return { projects, jobs, roots };
}
