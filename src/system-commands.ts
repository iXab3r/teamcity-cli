import { fieldsOption, fieldsFromOptions } from "./projection.js";
import {
  command,
  Permission,
  type CommandContext,
  type CommandDefinition,
  type OptionDefinition,
} from "@eyeauras/cli-factory";
import type { TeamCityClient } from "./client.js";
import { clientLeaf, option, text, repeatOption, jsonOption, integerValue, locatorOption, booleanOption } from "./command-support.js";
export function createSystemCommands(
  clientFor: (c: CommandContext) => Promise<TeamCityClient>,
  pageOptions: readonly OptionDefinition[],
  avatarCommands: readonly CommandDefinition[],
) {
  const leaf = clientLeaf(clientFor),
    R = Permission.ReadOnly,
    U = Permission.Update;
  const optional = (o: Record<string, unknown>, k: string) =>
    typeof o[k] === "string" ? o[k] : undefined;
  const page = (o: Record<string, unknown>) => ({ limit: Number(o.limit), start: Number(o.start) });
  const confirm = option("--confirm", "Confirm the operation", true);
  const item = jsonOption("--item <json>", "Supply a configuration object");
  const project = option("--project <id>", "Select a project scope");
  const stateOptions = [
    option("--state <state>", "Set IN_PROGRESS, SUCCESSFUL, FAILED, CANCELLED or UNKNOWN", true),
    option("--date <timestamp>", "Set a YYYYMMDDTHHmmss+ZZZZ timestamp", true),
    option("--build <id>", "Select a related build"),
  ];
  const healthOptions = [project, option("--global", "Select server-wide health scope")];
  const healthScope = (o: Record<string, unknown>) => ({
    ...(optional(o, "project") ? { project: text(o, "project") } : {}),
    ...(o.global === true ? { global: true } : {}),
  });
  const deployments = command(
    "deployments",
    "Manage deployment dashboards and instance history",
    [
      leaf(
        "list",
        "Read one dashboard page",
        R,
        (c, { options }) =>
          c.listDashboards(
            { ...page(options), fields: fieldsFromOptions(options) },
            optional(options, "project"),
          ),
        [...pageOptions, project, fieldsOption],
      ),
      leaf(
        "create <id>",
        "Create a dashboard",
        U,
        (c, { args, options }) =>
          c.createDashboard(args.id, text(options, "name"), text(options, "project")),
        [option("--name <text>", "Set the name", true), { ...project, required: true }],
      ),
      leaf(
        "show <id>",
        "Read one dashboard",
        R,
        (c, { args, options }) => c.getDashboard(args.id, fieldsFromOptions(options)),
        [fieldsOption],
      ),
      leaf(
        "delete <id>",
        "Delete dashboard",
        U,
        (c, { args }) => c.deleteDashboard(args.id),
        [confirm],
      ),
      command("instances", "Manage dashboard instances", [
        leaf(
          "list <dashboard>",
          "Read one instance page",
          R,
          (c, { args, options }) =>
            c.listDeploymentInstances(
              args.dashboard,
              { ...page(options), fields: fieldsFromOptions(options) }
            ),
          [...pageOptions, fieldsOption],
        ),
        leaf(
          "upsert <dashboard> <id>",
          "Add or update an instance",
          U,
          (c, { args, options }) =>
            c.upsertDeploymentInstance(
              args.dashboard,
              args.id,
              text(options, "state"),
              text(options, "date"),
              optional(options, "build"),
            ),
          [...stateOptions, confirm],
        ),
        leaf(
          "show <dashboard> <id>",
          "Read one instance",
          R,
          (c, { args, options }) =>
            c.getDeploymentInstance(args.dashboard, args.id, fieldsFromOptions(options)),
          [fieldsOption],

        ),
        leaf(
          "append-state <dashboard> <id>",
          "Append one history entry",
          U,
          (c, { args, options }) =>
            c.appendDeploymentState(
              args.dashboard,
              args.id,
              text(options, "state"),
              text(options, "date"),
              optional(options, "build"),
            ),
          stateOptions,
        ),
        leaf(
          "delete <dashboard> <id>",
          "Remove selected instance",
          U,
          (c, { args }) => c.deleteDeploymentInstance(args.dashboard, args.id),
          [confirm],
        ),
      ]),
    ],
  );
  const roles = command("roles", "Manage server role definitions", [
    leaf(
      "list",
      "Read role definitions",
      R,
      (c, { options }) =>
        c.listRoleDefinitions(fieldsFromOptions(options)),
      [fieldsOption],
    ),
    leaf(
      "create",
      "Create a role definition",
      "Admin",
      (c, { options }) =>
        c.createRoleDefinition(
          text(options, "name"),
          (options.permission ?? []) as string[],
          (options.include ?? []) as string[],
          fieldsFromOptions(options),
        ),
      [
        fieldsOption,
        option("--name <text>", "Set the role name", true),
        repeatOption("--permission <id>", "Repeat permission IDs"),
        repeatOption("--include <id>", "Repeat included role IDs"),
      ],
    ),
    leaf(
      "show <id>",
      "Read role definition",
      R,
      (c, { args, options }) =>
        c.getRoleDefinition(args.id, fieldsFromOptions(options)),
      [fieldsOption],

    ),
    leaf(
      "delete <id>",
      "Delete role definition",
      "Admin",
      (c, { args }) => c.deleteRoleDefinition(args.id),
      [confirm],
    ),
    ...(["included", "permissions"] as const).map((kind) =>
      command(
        kind,
        "Edit selected role relation",
        (["add", "remove"] as const).map((action) =>
          leaf(
            `${action} <id> <child>`,
            `${action === "add" ? "Add" : "Remove"} one ${kind} entry`,
            "Admin",
            (c, { args, options }) =>
              c.editRoleDefinition(
                text(args, "id"),
                kind,
                text(args, "child"),
                action === "remove",
                fieldsFromOptions(options),
              ),
            [fieldsOption],

          ),
        ),
      ),
    ),
  ]);
  const server = [
    leaf("rest-info", "Read REST landing metadata", R, (c) => c.getRestInfo()),
    leaf(
      "rest-plugin",
      "Read REST plugin metadata",
      R,
      (c, { options }) => c.getRestPlugin(fieldsFromOptions(options)),
      [fieldsOption],
    ),
    command("authentication", "Manage authentication modules", [
      leaf("show", "Read authentication module settings", R, (c) => c.getAuthenticationSettings()),
      command(
        "replace",
        "Replace authentication modules",
        async ({ options }, context) =>
          (await clientFor(context)).replaceAuthenticationSettings(options.item, context.secrets),
        { permission: "Admin", options: [item, confirm] },
      ),
    ]),
    command("backup", "Inspect and schedule server backups", [
      leaf("status", "Read backup progress", R, (c) =>
        c.getBackupStatus(),
      ),
      leaf(
        "start <name>",
        "Schedule a configuration and database backup",
        "Admin",
        (c, { args, options }) =>
          c.startBackup(
            args.name,
            {
              addTimestamp: optional(options, "addTimestamp"),
              includeConfigs: optional(options, "includeConfigs"),
              includeDatabase: optional(options, "includeDatabase"),
              includeBuildLogs: optional(options, "includeBuildLogs"),
              includePersonalChanges: optional(options, "includePersonalChanges"),
              includeRunningBuilds: optional(options, "includeRunningBuilds"),
              includeSupplimentaryData: optional(options, "includeSupplementaryData"),
            },
          ),
        [
          confirm,
          booleanOption("--add-timestamp <boolean>", "Add a timestamp to the backup name"),
          booleanOption("--include-configs <boolean>", "Include server configuration"),
          booleanOption("--include-database <boolean>", "Include the database"),
          booleanOption("--include-build-logs <boolean>", "Include build logs"),
          booleanOption("--include-personal-changes <boolean>", "Include personal changes"),
          booleanOption("--include-running-builds <boolean>", "Include running builds"),
          booleanOption("--include-supplementary-data <boolean>", "Include supplementary data"),
        ],
      ),
    ]),
    command("cleanup", "Configure scheduled cleanup", [
      leaf("show", "Read cleanup schedule", R, (c) => c.getCleanup()),
      leaf(
        "configure",
        "Update cleanup settings",
        "Admin",
        (c, { options }) => c.configureCleanup(options.item),
        [item],
      ),
    ]),
    command("settings", "Manage global settings", [
      leaf("show", "Read safe settings", R, (c) => c.getGlobalSettings()),
      leaf(
        "set",
        "Update selected global settings",
        "Admin",
        (c, { options }) => c.setGlobalSettings(options.item),
        [item],
      ),
    ]),
    command("licenses", "Inspect and manage licenses", [
      leaf(
        "summary",
        "Read licensed capacities",
        R,
        (c, { options }) => c.getLicenseSummary(fieldsFromOptions(options)),
        [fieldsOption],
      ),
      leaf(
        "list",
        "Read license metadata",
        R,
        (c, { options }) => c.listLicenses(fieldsFromOptions(options)),
        [fieldsOption],
      ),
      command(
        "add",
        "Add a license key",
        async ({ options }, context) =>
          (await clientFor(context)).addLicense(
            options.secret as string | undefined,
            context.secrets,
            fieldsFromOptions(options),
            options.key as string | undefined,
          ),
        {
          permission: "Admin",
          options: [fieldsOption, option("--key <value>", "Supply a license key"), option("--secret <alias>", "Select an input-secret alias")],
        },
      ),
      command(
        "show [alias]",
        "Inspect a license",
        async ({ args, options }, context) =>
          (await clientFor(context)).getLicense(args.alias as string | undefined, context.secrets, fieldsFromOptions(options), options.key as string | undefined),
        { permission: R, options: [fieldsOption, option("--key <value>", "Supply a license key")] },
      ),
      command(
        "delete [alias]",
        "Remove a license",
        async ({ args, options }, context) =>
          (await clientFor(context)).deleteLicense(args.alias as string | undefined, context.secrets, options.key as string | undefined),
        { permission: "Admin", options: [confirm, option("--key <value>", "Supply a license key")] },
      ),
    ]),
    leaf(
      "metrics",
      "Read numeric metric series",
      R,
      (c, { options }) => c.getMetrics(fieldsFromOptions(options)),
      [fieldsOption],
    ),
    leaf(
      "plugins",
      "Read plugin metadata",
      R,
      (c, { options }) =>
        c.getPlugins(fieldsFromOptions(options), optional(options, "locator")),
      [fieldsOption, { ...locatorOption, description: "Filter native TeamCity plugins" }],

    ),
    leaf(
      "field <field>",
      "Read a server field",
      R,
      (c, { args }) => c.getServerField(args.field),
    ),
  ];
  const projects = [
    leaf(
      "default-value-sets <id>",
      "List named value-set types",
      R,
      (c, { args, options }) =>
        c.getDefaultValueSets(args.id, fieldsFromOptions(options)),
      [fieldsOption],

    ),
    command("deployments", "Inspect project dashboards", [
      leaf(
        "list <id>",
        "List project dashboards",
        R,
        (c, { args, options }) =>
          c.listProjectDashboards(args.id, fieldsFromOptions(options)),
        [fieldsOption],

      ),
      leaf(
        "show <project> <id>",
        "Read one child dashboard",
        R,
        (c, { args, options }) =>
          c.getProjectDashboard(args.project, args.id, fieldsFromOptions(options)),
        [fieldsOption],

      ),
    ]),
  ];
  const jobs = [
    leaf(
      "investigations <id>",
      "Read scoped investigations",
      R,
      (c, { args, options }) =>
        c.getJobInvestigations(args.id, fieldsFromOptions(options)),
      [fieldsOption],

    ),
    leaf(
      "vcs-instances <id>",
      "Read attached VCS instances",
      R,
      (c, { args, options }) =>
        c.getJobVcsInstances(args.id, fieldsFromOptions(options)),
      [fieldsOption],

    ),
  ];
  const users = [
    command("avatar", "Manage avatar images", [
      ...avatarCommands,
      leaf(
        "replace <id>",
        "Upload a selected avatar file",
        U,
        (c, { args, options }) => c.replaceAvatar(args.id, text(options, "file")),
        [option("--file <path>", "Select a local image path", true)],
      ),
      leaf("delete <id>", "Remove avatar", U, (c, { args }) => c.deleteAvatar(args.id)),
    ]),
  ];
  const pools = [
    command("tokens", "Create agent-registration credentials", [
      command(
        "create <id>",
        "Create and store agent-registration tokens",
        async ({ args, options }, context) =>
          (await clientFor(context)).createPoolTokens(
            args.id,
            Number(options.ttl),
            options.storeAs as string[],
            context.secrets,
          ),
        {
          permission: "Credentials",
          options: [
            { ...option("--ttl <seconds>", "Set token lifetime in seconds", true), parse: integerValue },
            repeatOption(
              "--store-as <alias>",
              "Choose new token aliases; repeat for more",
              true,
            ),
          ],
        },
      ),
    ]),
  ];
  const mutes = [
    leaf(
      "delete-many",
      "Delete selected mutes",
      U,
      (c, { options }) => c.deleteMutes(options.id as string[], fieldsFromOptions(options)),
      [repeatOption("--id <id>", "Select mute IDs; repeat for more", true), confirm, fieldsOption],
    ),
  ];
  const roots = [
    deployments,
    roles,
    command("audit", "Inspect audit events", [
      leaf(
        "list",
        "List results",
        R,
        (c, { options }) =>
          c.listAudit({ ...page(options), fields: fieldsFromOptions(options) }, optional(options, "project")),
        [...pageOptions, project, fieldsOption],
      ),
      leaf(
        "show <id>",
        "Read one audit event",
        R,
        (c, { args, options }) => c.getAudit(args.id, fieldsFromOptions(options)),
        [fieldsOption],
      ),
    ]),
    command("health", "Inspect server health items", [
      leaf(
        "list",
        "Read health items within a scope",
        R,
        (c, { options }) =>
          c.listHealth(healthScope(options), { ...page(options), fields: fieldsFromOptions(options) }),
        [...healthOptions, ...pageOptions, fieldsOption],
      ),
      leaf(
        "show",
        "Read a scoped health category match",
        R,
        (c, { options }) =>
          c.getHealth(
            { ...healthScope(options), category: text(options, "category") },
            fieldsFromOptions(options),
          ),
        [fieldsOption, ...healthOptions, option("--category <id>", "Select a health category", true)],
      ),
      command("categories", "Discover native health categories", [
        leaf(
          "list",
          "Read category metadata",
          R,
          (c, { options }) => c.listHealthCategories(fieldsFromOptions(options), optional(options, "locator")),
          [fieldsOption, { ...locatorOption, description: "Filter native TeamCity health categories" }],
        ),
        leaf(
          "show <id>",
          "Read one category",
          R,
          (c, { args, options }) =>
            c.getHealthCategory(args.id, fieldsFromOptions(options)),
          [fieldsOption],

        ),
      ]),
    ]),
  ];
  return { server, projects, jobs, users, pools, mutes, roots };
}
