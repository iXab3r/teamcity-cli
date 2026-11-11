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
import {
  booleanOption,
  textOption,
  clientLeaf,
  option,
  text,
  repeatOption,
  propertyOption,
  jsonOption,
} from "./command-support.js";
import type { PlainProperty } from "./authoring-models.js";
import type { CloudImageId, CloudInstanceId } from "./infrastructure-models.js";
import { importInputSecret, forgetInputSecret } from "./credential-inputs.js";

export function createInfrastructureCommands(
  clientFor: (context: CommandContext) => Promise<TeamCityClient>,
  pageOptions: readonly OptionDefinition[],
  instanceCommands: readonly CommandDefinition[],
) {
  const leaf = clientLeaf(clientFor);
  const optional = (options: Record<string, unknown>, key: string) =>
    typeof options[key] === "string" ? options[key] : undefined;
  const page = (options: Record<string, unknown>) => ({
    limit: Number(options.limit),
    start: Number(options.start),
  });
  const confirm = option("--confirm", "Confirm the operation", true);
  const imageOptions = [
    option("--cloud-profile <id>", "Select a remote cloud profile", true),
    option("--image <id>", "Select a cloud image", true),
  ];
  const instanceOptions = [
    ...imageOptions,
    option("--instance <id>", "Select a cloud instance", true),
  ];
  const image = (options: Record<string, unknown>): CloudImageId => ({
    profile: text(options, "cloudProfile"),
    image: text(options, "image"),
  });
  const instance = (options: Record<string, unknown>): CloudInstanceId => ({
    ...image(options),
    instance: text(options, "instance"),
  });
  const cloudLists = (kind: "profiles" | "images" | "instances") =>
    leaf(
      "list",
      "List cloud resources",
      Permission.ReadOnly,
      (c, { options }) =>
        c.listCloud(
          kind,
          { ...page(options), fields: fieldsFromOptions(options) },
          optional(options, "project"),
          optional(options, "cloudProfile"),
        ),
      [
        ...pageOptions, fieldsOption,
        option("--project <id>", "Select a project scope"),
        option("--cloud-profile <id>", "Select a remote cloud profile"),
      ],
    );
  const cloud = command("cloud", "Manage remote cloud capacity", [
    command("profiles", "Inspect remote cloud profiles", [
      cloudLists("profiles"),
      leaf(
        "show <id>",
        "Show cloud profile metadata",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.getCloudProfile(args.id, fieldsFromOptions(options)),
        [fieldsOption],

      ),
    ]),
    command("images", "Inspect cloud images", [
      cloudLists("images"),
      leaf(
        "show",
        "Show one composite cloud image",
        Permission.ReadOnly,
        (c, { options }) => c.getCloudImage(image(options), fieldsFromOptions(options)),
        [...imageOptions, fieldsOption],
      ),
    ]),
    command("instances", "Manage cloud instances", [
      cloudLists("instances"),
      leaf(
        "show",
        "Read instance state",
        Permission.ReadOnly,
        (c, { options }) => c.getCloudInstance(instance(options), fieldsFromOptions(options)),
        [...instanceOptions, fieldsOption],
      ),
      leaf(
        "start",
        "Start a cloud instance",
        Permission.Update,
        (c, { options }) => c.startCloudInstance({ ...(options.cloudProfile === undefined ? {} : { profile: text(options, "cloudProfile") }), ...(options.image === undefined ? {} : { image: text(options, "image") }) }, fieldsFromOptions(options), nativeInput(options)),
        [...imageOptions.map(option => ({ ...option, required: false })), fieldsOption, jsonOption("--item <json>", "Supply a native body")],
      ),
      ...(["delete", "force-stop", "stop"] as const).map((action) =>
        leaf(
          action,
          action === "stop"
            ? "Schedule stop when free"
            : "Force instance termination",
          Permission.Update,
          (c, { options }) => c.stopCloudInstance(instance(options), action, fieldsFromOptions(options)),
          [...instanceOptions, ...(action === "stop" ? [] : [confirm]), fieldsOption],
        ),
      ),
    ]),
  ]);
  const roots = [
    leaf(
      "create <id>",
      "Create a Git root",
      Permission.Update,
      (c, { args, options }) =>
        c.createAnonymousGitRoot(
          args.id,
          options.name as string | undefined,
          options.project as string | undefined,
          options.url as string | undefined,
          options.branch as string | undefined,
          fieldsFromOptions(options),
          nativeInput(options),
        ),
      [
        option("--name <text>", "Set the name"),
        option("--project <id>", "Select the owner project"),
        option("--url <url>", "Set the Git repository URL"),
        option("--branch <ref>", "Set the Git branch ref"),
        fieldsOption,
        jsonOption("--item <json>", "Supply a native VCS root body"),
      ],
    ),
    leaf(
      "delete <id>",
      "Delete a VCS root configuration",
      Permission.Update,
      (c, { args, options }) => c.deleteVcsRoot(args.id, fieldsFromOptions(options)), [fieldsOption]
    ),
    leaf(
      "instances <id>",
      "List VCS root instances",
      Permission.ReadOnly,
      (c, { args, options }) =>
        c.getVcsRootInstances(args.id, fieldsFromOptions(options)),
      [fieldsOption],

    ),
    command("properties", "Manage VCS root properties", [
      leaf(
        "list <id>",
        "List property values",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.listVcsRootProperties(args.id, fieldsFromOptions(options)),
        [fieldsOption],

      ),
      leaf(
        "replace <id>",
        "Replace all VCS root properties",
        Permission.Update,
        (c, { args, options }) =>
          c.replaceVcsRootProperties(
            args.id,
            (options.property ?? []) as PlainProperty[],
            fieldsFromOptions(options),
            nativeInput(options),
          ),
        [propertyOption, fieldsOption, jsonOption("--item <json>", "Supply a native body")],
      ),
      leaf(
        "clear <id>",
        "Delete all VCS root properties",
        Permission.Update,
        (c, { args, options }) => c.clearVcsRootProperties(args.id, fieldsFromOptions(options)),
        [confirm, fieldsOption],
      ),
      leaf(
        "exists <id> <name>",
        "Check property existence",
        Permission.ReadOnly,
        (c, { args, options }) => c.checkVcsRootProperty(args.id, args.name, fieldsFromOptions(options)), [fieldsOption]
      ),
      leaf(
        "set <id> <name> <value>",
        "Set a VCS root property",
        Permission.Update,
        (c, { args, options }) =>
          c.setVcsRootProperty(args.id, args.name, args.value, fieldsFromOptions(options)), [fieldsOption]
      ),
      leaf("delete <id> <name>", "Delete one property", Permission.Update, (c, { args, options }) =>
        c.deleteVcsRootProperty(args.id, args.name, fieldsFromOptions(options)), [fieldsOption]
      ),
    ]),
    command("fields", "Read and write root fields", [
      leaf(
        "get <id> <field>",
        "Read a root field",
        Permission.ReadOnly,
        (c, { args, options }) => c.getVcsRootField(args.id, args.field, fieldsFromOptions(options)), [fieldsOption]
      ),
      leaf("set <id> <field> <value>", "Set a root field", Permission.Update, (c, { args, options }) =>
        c.setVcsRootField(args.id, args.field, args.value, fieldsFromOptions(options)), [fieldsOption]
      ),
    ]),
  ];
  const instances = command("instances", "Inspect/change VCS instance detection state", [
    ...instanceCommands,
    leaf(
      "list",
      "List results",
      Permission.ReadOnly,
      (c, { options }) =>
        c.listVcsInstances(
          { ...page(options), fields: fieldsFromOptions(options) },
          optional(options, "root")
        ),
      [...pageOptions, option("--root <id>", "Select a VCS root"), fieldsOption],
    ),
    leaf(
      "check-changes <id>",
      "Request a VCS change check",
      Permission.Update,
      (c, { args, options }) =>
        c.checkVcsInstanceChanges(args.id, optional(options, "requestor"), fieldsFromOptions(options)),
      [textOption("--requestor <text>", "Set the change-check requestor"), fieldsOption],
    ),
    leaf(
      "notify-commit <id>",
      "Notify a VCS root instance",
      Permission.Update,
      (c, { args, options }) => c.notifyVcsCommit(args.id, optional(options, "okOnNothingFound"), fieldsFromOptions(options)),
      [booleanOption("--ok-on-nothing-found <boolean>", "Set whether unmatched notifications succeed"), fieldsOption],
    ),
    leaf(
      "show <id>",
      "Read identity/polling metadata",
      Permission.ReadOnly,
      (c, { args, options }) =>
        c.getVcsInstance(args.id, fieldsFromOptions(options)),
      [fieldsOption],

    ),
    leaf(
      "properties <id>",
      "List parameter values",
      Permission.ReadOnly,
      (c, { args, options }) =>
        c.listVcsInstanceProperties(args.id, fieldsFromOptions(options)),
      [fieldsOption],

    ),
    command("state", "Manage saved branch revisions", [
      leaf(
        "show <id>",
        "Read branch/revision entries",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.getVcsRepositoryState(args.id, fieldsFromOptions(options)),
        [fieldsOption],

      ),
      leaf(
        "replace <id>",
        "Replace all saved branch revisions",
        Permission.Update,
        (c, { args, options }) =>
          c.replaceVcsRepositoryState(
            args.id,
            (options.revision ?? []) as PlainProperty[],
            fieldsFromOptions(options),
            nativeInput(options),
          ),
        [
          {
            ...propertyOption,
            flags: "--revision <branch=revision>",
            description: "Supply branch and revision pairs; repeat",
          },
          fieldsOption,
          jsonOption("--item <json>", "Supply a native body"),
        ],
      ),
      leaf(
        "reset <id>",
        "Reset saved detection state",
        Permission.Update,
        (c, { args, options }) => c.resetVcsRepositoryState(args.id, fieldsFromOptions(options)),
        [confirm, fieldsOption],
      ),
      leaf(
        "created <id>",
        "Read saved-state creation timestamp",
        Permission.ReadOnly,
        (c, { args, options }) => c.getVcsRepositoryStateCreated(args.id, fieldsFromOptions(options)), [fieldsOption]
      ),
    ]),
    command("fields", "Read and write instance fields", [
      leaf(
        "get <id> <field>",
        "Read an instance field",
        Permission.ReadOnly,
        (c, { args, options }) => c.getVcsInstanceField(args.id, args.field, fieldsFromOptions(options)), [fieldsOption]
      ),
      leaf(
        "set <id> <field> <value>",
        "Set a VCS instance field",
        Permission.Update,
        (c, { args, options }) =>
          c.setVcsInstanceField(args.id, args.field, args.value, fieldsFromOptions(options)), [fieldsOption]
      ),
      leaf(
        "clear <id> <field>",
        "Clear a VCS instance field",
        Permission.Update,
        (c, { args, options }) => c.clearVcsInstanceField(args.id, args.field, fieldsFromOptions(options)), [fieldsOption]
      ),
    ]),
  ]);
  const versioned = command("versioned-settings", "Manage versioned project settings", [
    leaf(
      "affected <id>",
      "Read affected project identities",
      Permission.ReadOnly,
      (c, { args, options }) =>
        c.getVersionedAffectedProjects(args.id, fieldsFromOptions(options)),
      [fieldsOption],

    ),
    leaf(
      "check-changes <id>",
      "Request a settings check",
      Permission.Update,
      (c, { args, options }) => c.checkVersionedSettings(args.id, fieldsFromOptions(options)), [fieldsOption]
    ),
    leaf(
      "commit <id>",
      "Commit current settings to external VCS",
      Permission.Update,
      (c, { args, options }) => c.commitVersionedSettings(args.id, fieldsFromOptions(options)),
      [confirm, fieldsOption],
    ),
    command("config", "Manage versioned settings configuration", [
      leaf(
        "show <id>",
        "Read project configuration",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.getVersionedConfig(args.id, fieldsFromOptions(options)),
        [fieldsOption],

      ),
      leaf(
        "effective <id>",
        "Read inherited project/config pair",
        Permission.ReadOnly,
        (c, { args, options }) => c.getEffectiveVersionedConfig(args.id, fieldsFromOptions(options)),
        [fieldsOption],
      ),
      leaf(
        "replace <id>",
        "Replace versioned settings configuration",
        Permission.Update,
        (c, { args, options }) => c.replaceVersionedConfig(args.id, options.item ?? {}, fieldsFromOptions(options)),
        [jsonOption("--item <json>", "Supply versioned settings configuration"), fieldsOption],
      ),
      command("fields", "Manage versioned settings fields", [
        leaf(
          "get <id> <field>",
          "Read a configuration field",
          Permission.ReadOnly,
          (c, { args, options }) => c.getVersionedConfigField(args.id, args.field, fieldsFromOptions(options)), [fieldsOption]
        ),
        leaf(
          "set <id> <field> <value>",
          "Set a configuration field",
          Permission.Update,
          (c, { args, options }) =>
            c.setVersionedConfigField(args.id, args.field, args.value, fieldsFromOptions(options)), [fieldsOption]
        ),
        leaf(
          "reset <id> <field>",
          "Reset the versioned VCS root",
          Permission.Update,
          (c, { args, options }) => c.resetVersionedConfigField(args.id, args.field, fieldsFromOptions(options)),
          [confirm, fieldsOption],
        ),
      ]),
    ]),
    command("context", "Manage DSL context parameters", [
      leaf(
        "list <id>",
        "List DSL context parameter values",
        Permission.ReadOnly,
        (c, { args, options }) => c.listVersionedContext(args.id, fieldsFromOptions(options)), [fieldsOption]
      ),
      leaf(
        "replace <id>",
        "Replace all DSL context parameters",
        Permission.Update,
        (c, { args, options }) =>
          c.replaceVersionedContext(args.id, (options.property ?? []) as PlainProperty[], nativeInput(options), fieldsFromOptions(options)),
        [propertyOption, jsonOption("--item <json>", "Supply a native body"), fieldsOption],
      ),
    ]),
    leaf(
      "load <id>",
      "Load current configuration from VCS",
      Permission.Update,
      (c, { args, options }) => c.loadVersionedSettings(args.id, fieldsFromOptions(options)),
      [confirm, fieldsOption],
    ),
    leaf(
      "status <id>",
      "Read synchronization state",
      Permission.ReadOnly,
      (c, { args, options }) => c.getVersionedStatus(args.id, fieldsFromOptions(options)),
      [fieldsOption],
    ),
    command("tokens", "Manage versioned secure-value mappings", [
      leaf(
        "list <id>",
        "List secure-value mapping names",
        Permission.ReadOnly,
        (c, { args, options }) =>
          c.listVersionedTokenNames(args.id, optional(options, "status"), fieldsFromOptions(options)),
        [option("--status <status>", "Filter the token status"), fieldsOption],
      ),
      command(
        "set <id>",
        "Set secure-value mappings",
        async ({ args, options }, context) =>
          (await clientFor(context)).setVersionedTokens(
            args.id,
            (options.mapping ?? []) as string[],
            context.secrets,
            (options.property ?? []) as PlainProperty[],
            nativeInput(options), fieldsFromOptions(options)
          ),
        {
          permission: "Credentials",
          options: [
            jsonOption("--item <json>", "Supply a native body"),
            propertyOption,
            repeatOption(
              "--mapping <remote-name=alias>",
              "Supply alias mappings; direct properties take precedence",
            ), fieldsOption],
        },
      ),
      leaf(
        "delete <id>",
        "Delete unused secure-value mappings",
        "Credentials",
        (c, { args, options }) =>
          c.deleteVersionedTokens(args.id, options.name as string[], nativeInput(options), fieldsFromOptions(options)),
        [repeatOption("--name <name>", "Select remote mappings; repeat for more"), jsonOption("--item <json>", "Supply a native body"), fieldsOption],
      ),
    ]),
  ]);
  const server = [
    leaf(
      "rest-version",
      "Read the REST plugin version",
      Permission.ReadOnly,
      (c, { options }) => c.getRestVersion(fieldsFromOptions(options)), [fieldsOption]
    ),
  ];
  const credentials = command(
    "credentials",
    "Manage profile secret inputs",
    [
      command(
        "import <alias>",
        "Import a secret from an environment variable",
        async ({ args, options }, context) =>
          importInputSecret(context.secrets, args.alias, text(options, "env")),
        {
          permission: "Credentials",
          options: [
            option("--env <variable>", "Select the environment variable name", true),
          ],
        },
      ),
      command(
        "forget <alias>",
        "Forget a local secret input",
        async ({ args }, context) => forgetInputSecret(context.secrets, args.alias),
        { permission: "Credentials" },
      ),
    ],
  );
  return { roots, instances, projects: [versioned], server, rootsCommands: [cloud, credentials] };
}
