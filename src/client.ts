import { teamCityUrl } from "./server-url.js";
import { fieldsProjection, knownCredentialMask, type Projected } from "./projection.js";
import * as triage from "./triage-models.js";
import * as admin from "./admin-models.js";
import * as infrastructure from "./infrastructure-models.js";
import * as system from "./system-models.js";
import {
  requireInputSecret,
  inputValue,
  inputSecretKey,
  preflightSecretKeys,
  persistSecretKeys,
} from "./credential-inputs.js";
import {
  CliError,
  HttpError,
  diagnosticCause,
  fetchWithRedirects,
  normalizeBearerToken,
  readResponseBody,
  type ScopedSecrets,
} from "@eyeauras/cli-factory";
import * as files from "./file-models.js";
import { saveDownload, type DownloadOptions } from "./downloads.js";
import {
  branchDimension,
  locatorValue,
  idPath,
  joinLocator,
  nestedId,
  normalizePage,
  pageDimensions,
  integerId,
  requiredText,
} from "./locator.js";
import { readPages, type TeamCityPage } from "./paging.js";
import {
  propertyFields,
  stepFields,
  rootFields,
  entryFields,
  plainProperty,
  safeProperty,
  isSecretProperty,
  readableConfiguration,
  stepBody,
  safeStep,
  safeRoot,
  safeEntry,
  pathSegment,
  literalIdPath,
  extensionFields,
  extensionBody,
  safeExtension,
  snapshotFields,
  snapshotBody,
  safeSnapshot,
  identityFields,
  safeIdentity,
  propertiesBody,
  inputProperties,
  type ExtensionKind,
  type ExtensionInput,
  type RawExtension,
  type SnapshotDependencyInput,
  type RawSnapshotDependency,
  type BuildTypeIdentity,
  type ParameterOwner,
  type RawProperty,
  type PlainProperty,
  type StepInput,
  type RawStep,
  type VcsRoot,
  type RawVcsEntry,
} from "./authoring-models.js";
import {
  booleanText,
  ruleBody,
  type RuleInput,
  type RuleKind,
  type EntitySettingsKind,
} from "./advanced-authoring-models.js";
import {
  textIds,
  settingsItems,
  safeApproval,
  approvalFields,
  type ApprovalSummary,
  type ParameterPart,
  type SettingsCollection,
} from "./bulk-configuration-models.js";
import type {
  TeamCityAgent,
  TeamCityBuild,
  TeamCityBuildState,
  TeamCityBuildStatus,
  TeamCityBuildSummary,
  TeamCityChange,
  TeamCityClientOptions,
  TeamCityFailedTest,
  TeamCityJob,
  TeamCityPageOptions,
  TeamCityProblemOccurrence,
  TeamCityProject,
  TeamCityServer,
  TeamCityTestOccurrence,
  TeamCityTestStatus,
  TeamCityTriState,
  TeamCityUser,
} from "./models.js";
import {
  poolNumber,
  safeNamed,
  safeComment,
  safeBooleanStatus,
  safePolicy,
  safeOperationBuild,
  safeChange,
  queuePosition,
  publicTags,
  statistic,
  operationBuildFields,
  booleanStatusFields,
  policyFields,
  changeSummaryFields,
  type AgentPoolSummary,
  type OperationComment,
  type BooleanStatus,
  type RawAgentPolicy,
  type OperationBuild,
  type ChangeSummary,
} from "./operator-models.js";

const userFields = "id,username,name,email";
const serverFields =
  "version,versionMajor,versionMinor,buildNumber,startTime,currentTime,role,webUrl";
const projectFields = "id,name,parentProjectId,archived,description,webUrl";
const jobFields = "id,name,projectId,projectName,paused,description,webUrl";
const buildFields =
  "id,buildTypeId,number,state,status,statusText,branchName,defaultBranch,personal," +
  "failedToStart,canceledInfo(timestamp)," +
  "queuedDate,startDate,finishDate,percentageComplete,queuePosition,waitReason,webUrl," +
  "agent(id,name)";
const summaryFields =
  `${buildFields},testOccurrences(count,passed,failed,newFailed,ignored,muted),` +
  "problemOccurrences(count,newFailed)";
const failedTestFields = "id,name,status,newFailure,muted,currentlyMuted,ignored";
const testOccurrenceFields =
  "id,name,status,duration,ignored,newFailure,muted," +
  "currentlyMuted,currentlyInvestigated,details";
const problemOccurrenceFields =
  "id,type,identity,newFailure,currentlyMuted,currentlyInvestigated,logAnchor,details," +
  "problem(id,type,identity,description)";
const changeFields =
  "id,version,internalVersion,date,commitDate,comment,webUrl,commiter(vcsUsername)";
const agentFields =
  "id,name,connected,enabled,authorized,uptodate,webUrl," +
  "build(id,buildTypeId,number,state,status)";

interface BuildsResponse {
  build?: TeamCityBuild[];
}

interface RawTeamCityChange extends Omit<TeamCityChange, "committer"> {
  commiter?: { vcsUsername?: string };
}

export interface ListProjectsOptions<F extends string | undefined = undefined> extends TeamCityPageOptions {
  fields?: F;
  parent?: string;
  includeArchived?: boolean;
  archived?: string;
}

export interface ListJobsOptions<F extends string | undefined = string | undefined> extends TeamCityPageOptions {
  fields?: F;
  project?: string;
  templateFlag?: string;
}

export interface ListBuildsOptions<F extends string | undefined = string | undefined> extends TeamCityPageOptions {
  fields?: F;
  job?: string;
  project?: string;
  branch?: string;
  state?: TeamCityBuildState;
  status?: TeamCityBuildStatus;
  defaultFilter?: string;
  lookupLimit?: number;
}

export interface ListBuildTestsOptions<F extends string | undefined = string | undefined> extends TeamCityPageOptions {
  fields?: F;
  status?: TeamCityTestStatus;
}

export interface ListQueueOptions<F extends string | undefined = string | undefined> extends TeamCityPageOptions {
  fields?: F;
  job?: string;
  project?: string;
}

export interface ListAgentsOptions<F extends string | undefined = string | undefined> extends TeamCityPageOptions {
  fields?: F;
  connected?: TeamCityTriState;
  enabled?: TeamCityTriState;
  authorized?: TeamCityTriState;
}

export interface RunJobOptions {
  [key: string]: unknown;
  moveToTop?: string;
  branch?: string;
  comment?: string | Record<string, unknown>;
  /** Clear this build's entire checkout and fetch its sources again. */
  cleanSources?: boolean;
  /** One-off parameters for this build only; the job configuration is unchanged. */
  properties?: readonly PlainProperty[] | Record<string, unknown> | null;
}

export interface CancelBuildOptions<F extends string | undefined = string | undefined> {
  fields?: F;
  comment?: string;
  requeue?: boolean;
}

export interface CreateProjectOptions {
  [key: string]: unknown;
  name?: string;
  parent?: string;
  description?: string;
}

export interface CreateJobOptions {
  [key: string]: unknown;
  name?: string;
  project?: string | Record<string, unknown>;
  description?: string;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ResponseOptions {
  accept?: string;
  discard?: boolean;
  expectedStatus?: number;
  status?: (status: number) => void;
}

function decodeJson<T>(contents: string): T {
  try {
    return JSON.parse(contents) as T;
  } catch (cause) {
    throw new Error("TeamCity response was not valid JSON.", {
      cause: diagnosticCause(cause, [], "Invalid JSON syntax."),
    });
  }
}

/** The queued build in a queue response, or `undefined` when it has no usable build ID. */
function queuedBuild(contents: string): TeamCityBuild | undefined {
  let value: unknown;
  try {
    value = JSON.parse(contents);
  } catch (cause) {
    throw new TeamCityUnknownOutcomeError(
      "TeamCity returned invalid JSON after the queue request.",
      diagnosticCause(cause, [], "Invalid JSON syntax."),
    );
  }
  const id = (value as { id?: unknown } | null)?.id;
  return typeof id === "number" && Number.isSafeInteger(id)
    ? (value as TeamCityBuild)
    : undefined;
}

function projectPath(id: string): string {
  return `/app/rest/projects/${idPath(id, "Project ID")}`;
}

function jobPath(id: string): string {
  return `/app/rest/buildTypes/${idPath(id, "Job ID")}`;
}

function extensionPath(kind: ExtensionKind, jobId: string, id: string): string {
  return `${jobPath(jobId)}/${kind}/${kind === "triggers" ? literalIdPath(id) : pathSegment(id)}`;
}

function snapshotPath(jobId: string, id: string): string {
  return `${jobPath(jobId)}/snapshot-dependencies/${literalIdPath(id)}`;
}

function parametersPath(owner: ParameterOwner, id: string): string {
  return `${owner === "projects" ? projectPath(id) : jobPath(id)}/${owner === "output" ? "output-parameters" : "parameters"}`;
}

function entityPath(kind: EntitySettingsKind, jobId: string, id: string): string {
  const segment =
    kind === "triggers"
      ? literalIdPath(id)
      : kind === "agent-requirements" || kind === "artifact-dependencies"
        ? idPath(id, "Entity ID")
        : pathSegment(id);
  return `${jobPath(jobId)}/${kind}/${segment}`;
}

function ruleFields(kind: RuleKind): string {
  return kind === "artifact-dependencies" ? snapshotFields : extensionFields;
}

function entryPath(jobId: string, rootId: string): string {
  return `${jobPath(jobId)}/vcs-root-entries/${idPath(rootId, "VCS root ID")}`;
}

function poolPath(id: number): string {
  return `/app/rest/agentPools/id:${poolNumber(id)}`;
}
function agentPath(id: number): string {
  return `/app/rest/agents/id:${integerId(id, "Agent ID")}`;
}
function buildPath(id: number, owner: "builds" | "queue" = "builds"): string {
  return `/app/rest/${owner === "queue" ? "buildQueue" : "builds"}/id:${integerId(id, "Build ID")}`;
}

/** The request may or may not have reached TeamCity; mutations must not be repeated blindly. */
export class TeamCityUnknownOutcomeError extends CliError {
  public constructor(message: string, cause?: unknown) {
    super(message, { code: "request.unknownOutcome", cause });
    this.name = "TeamCityUnknownOutcomeError";
  }
}

export class TeamCityClient {
  readonly #baseUrl: string;
  readonly #token: string | undefined;
  readonly #knownSecrets = new Set<string>();
  readonly #guest: boolean;
  readonly #fetch: typeof globalThis.fetch;
  readonly #signal: AbortSignal | undefined;

  public constructor(options: TeamCityClientOptions) {
    const baseUrl = teamCityUrl(options.baseUrl);
    const token = options.token === undefined ? undefined : normalizeBearerToken(options.token);
    if (options.guest === true && token) {
      throw new Error("TeamCity guest access and token authentication are mutually exclusive.");
    }
    if (options.guest !== true && !token) {
      throw new Error("TeamCity token authentication requires a non-empty token.");
    }
    this.#baseUrl = baseUrl;
    this.#token = token;
    if (token) this.#knownSecrets.add(token);
    this.#guest = options.guest === true;
    this.#fetch = options.fetch ?? globalThis.fetch;
    this.#signal = options.signal;
  }

  public currentUser(): Promise<TeamCityUser> {
    return this.#requestJson<TeamCityUser>("GET", "/app/rest/users/current", {
      fields: userFields,
    });
  }

  public getServerStatus<F extends string | undefined = undefined>(
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/server",
      { fields: serverFields },
      value => value as TeamCityServer,
      fields,
    );
  }

  public listProjects<F extends string | undefined = undefined>(
    options: ListProjectsOptions<F> = {}
  ) {
    return this.#list(
      "/app/rest/projects",
      [
        options.parent !== undefined
          ? nestedId("project", options.parent, "TeamCity parent project ID")
          : undefined,
        options.archived === undefined ? options.includeArchived === undefined ? undefined : `archived:${options.includeArchived ? "any" : "false"}` : `archived:${locatorValue(options.archived, "Archived filter")}`,
      ],
      "project",
      projectFields,
      (item) => item as TeamCityProject,
      options,
    );
  }

  public getProject<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ): Promise<Projected<TeamCityProject, F>> {
    return this.#projectedJson(
      "GET",
      `/app/rest/projects/${idPath(id, "TeamCity project ID")}`,
      { fields: projectFields },
      value => value as TeamCityProject,
      fields,
    );
  }

  public async getJobConfiguration<F extends string | undefined = undefined>(id: string, fields?: F) {
    const properties = `property(${propertyFields})`;
    const defaultFields = [
      "id,name,projectId,projectName,description,paused,templateFlag,type",
      `settings(${properties}),parameters(${properties}),output-parameters(${properties})`,
      `steps(step(${stepFields})),features(feature(${extensionFields})),triggers(trigger(${extensionFields}))`,
      `agent-requirements(agent-requirement(${extensionFields}))`,
      `snapshot-dependencies(snapshot-dependency(${snapshotFields}))`,
      `artifact-dependencies(artifact-dependency(${snapshotFields}))`,
      `vcs-root-entries(vcs-root-entry(vcs-root(${rootFields},properties(${properties})),checkout-rules))`,
      `templates(buildType(${identityFields}))`,
    ].join(",");
    const value = await this.#requestJson<unknown>("GET", jobPath(id), { fields: fields ?? defaultFields });
    return this.#projectedValue(value, fields ?? defaultFields, readableConfiguration);
  }

  public async listAgentParameters<F extends string | undefined = undefined>(id: number, fields?: F) {
    const nativeResponse = await this.#requestJson<{ properties?: { property?: RawProperty[] } }>(
      "GET",
      agentPath(id),
      { ...({ fields: `properties(property(${propertyFields}))` }), ...(fields === undefined ? {} : { fields }) },
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      const result = nativeResponse;
      return (result.properties?.property ?? []).map((item) => safeProperty(item));
    });
  }

  public listJobs<F extends string | undefined = undefined>(
    options: ListJobsOptions<F> = {}
  ) {

    return this.#list(
      "/app/rest/buildTypes",
      [
        options.templateFlag === undefined ? undefined : `templateFlag:${locatorValue(options.templateFlag, "Template filter")}`,
        options.project !== undefined ? nestedId("project", options.project, "TeamCity project ID") : undefined,
      ],
      "buildType",
      jobFields,
      (item) => item as TeamCityJob,
      options,
    );
  }

  public getJob<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ): Promise<Projected<TeamCityJob, F>> {
    return this.#projectedJson(
      "GET",
      `/app/rest/buildTypes/${idPath(id, "TeamCity job ID")}`,
      { fields: jobFields },
      value => value as TeamCityJob,
      fields,
    );
  }

  /**
   * The first finished, non-personal build of one job in TeamCity's order (newest start first),
   * on one branch or on all branches. Any result counts, including failed and canceled builds.
   */
  public async getLatestFinishedBuild<F extends string | undefined = undefined>(
    job: string,
    branch?: string,
    fields?: F,
  ): Promise<Projected<TeamCityBuild | undefined, F>> {
    const response = await this.#requestJson<BuildsResponse>("GET", "/app/rest/builds", {
      locator: joinLocator(
        "defaultFilter:false",
        nestedId("buildType", job, "TeamCity job ID"),
        branchDimension(branch) ?? "branch:default:any",
        "state:finished",
        "personal:false",
        "count:1",
      ),
      fields: `build(${fields === undefined ? buildFields : fieldsProjection(fields)})`,
    });
    return this.#projectedValue(response.build?.[0], fields, value => value as TeamCityBuild | undefined);
  }

  public listBuilds<F extends string | undefined = undefined>(
    options: ListBuildsOptions<F> = {}
  ): Promise<TeamCityPage<Projected<TeamCityBuild, F>>> {
    return this.#list(
      "/app/rest/builds",
      [
        `defaultFilter:${locatorValue(options.defaultFilter ?? "false", "Default filter")}`,
        options.branch === "@default" ? "branch:(default:true)" : branchDimension(options.branch) ?? "branch:(default:any)",
        options.job !== undefined ? nestedId("buildType", options.job, "TeamCity job ID") : undefined,
        options.project !== undefined
          ? nestedId("affectedProject", options.project, "TeamCity project ID")
          : undefined,
        options.state === undefined ? undefined : `state:${locatorValue(options.state, "Build state")}`,
        options.status === undefined ? undefined : `status:${locatorValue(options.status, "Build status")}`,
      ],
      "build",
      buildFields,
      (item) => item as TeamCityBuild,
      options,
      options.job === undefined ? options.lookupLimit ?? 5000 : undefined,
    );
  }

  public getBuild<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ): Promise<Projected<TeamCityBuild, F>> {
    return this.#projectedJson(
      "GET",
      `/app/rest/builds/id:${integerId(id, "TeamCity build ID")}`,
      { fields: buildFields },
      value => value as TeamCityBuild,
      fields,
    );
  }

  /** One build with its test and problem counters, for a bounded diagnosis. */
  public getBuildSummary<F extends string | undefined = undefined>(id: number, fields?: F): Promise<Projected<TeamCityBuildSummary, F>> {
    return this.#projectedJson(
      "GET",
      `/app/rest/builds/id:${integerId(id, "TeamCity build ID")}`,
      { fields: summaryFields },
      value => value as TeamCityBuildSummary,
      fields,
    );
  }

  /** Failed test identities only: no stack traces or other details. */
  public listFailedTests<F extends string | undefined = undefined>(id: number, limit: number, fields?: F): Promise<TeamCityPage<Projected<TeamCityFailedTest, F>>> {
    return this.#list(
      "/app/rest/testOccurrences",
      [`build:(id:${integerId(id, "TeamCity build ID")})`, "status:failure"],
      "testOccurrence",
      failedTestFields,
      (item) => item as TeamCityFailedTest,
      { limit, fields },
    );
  }

  public listBuildTests<F extends string | undefined = undefined>(
    id: number,
    options: ListBuildTestsOptions<F> = {},
  ): Promise<TeamCityPage<Projected<TeamCityTestOccurrence, F>>> {
    return this.#list(
      "/app/rest/testOccurrences",
      [
        `build:(id:${integerId(id, "TeamCity build ID")})`,
        options.status === undefined ? undefined : `status:${locatorValue(options.status, "Test status")}`,
      ],
      "testOccurrence",
      testOccurrenceFields,
      (item) => item as TeamCityTestOccurrence,
      options,
    );
  }

  public listBuildProblems<F extends string | undefined = undefined>(
    id: number,
    options: TeamCityPageOptions & { fields?: F } = {},
  ): Promise<TeamCityPage<Projected<TeamCityProblemOccurrence, F>>> {
    return this.#list(
      "/app/rest/problemOccurrences",
      [`build:(id:${integerId(id, "TeamCity build ID")})`],
      "problemOccurrence",
      problemOccurrenceFields,
      (item) => item as TeamCityProblemOccurrence,
      options,
    );
  }

  public listBuildChanges<F extends string | undefined = undefined>(
    id: number,
    options: TeamCityPageOptions & { fields?: F } = {},
  ): Promise<TeamCityPage<Projected<TeamCityChange, F>>> {
    return this.#list(
      "/app/rest/changes",
      [`build:(id:${integerId(id, "TeamCity build ID")})`],
      "change",
      changeFields,
      (item) => {
        const change = item as RawTeamCityChange;
        return {
          id: change.id,
          version: change.version,
          date: change.date,
          ...(change.internalVersion === undefined
            ? {}
            : { internalVersion: change.internalVersion }),
          ...(change.commitDate === undefined ? {} : { commitDate: change.commitDate }),
          ...(change.comment === undefined ? {} : { comment: change.comment }),
          ...(change.webUrl === undefined ? {} : { webUrl: change.webUrl }),
          ...(change.commiter?.vcsUsername === undefined
            ? {}
            : { committer: change.commiter.vcsUsername }),
        };
      },
      options,
    );
  }

  public listQueue<F extends string | undefined = undefined>(
    options: ListQueueOptions<F> = {}
  ): Promise<TeamCityPage<Projected<TeamCityBuild, F>>> {
    return this.#list(
      "/app/rest/buildQueue",
      [
        options.job !== undefined ? nestedId("buildType", options.job, "TeamCity job ID") : undefined,
        options.project !== undefined ? nestedId("project", options.project, "TeamCity project ID") : undefined,
      ],
      "build",
      buildFields,
      (item) => item as TeamCityBuild,
      options,
    );
  }

  public listAgents<F extends string | undefined = undefined>(
    options: ListAgentsOptions<F> = {}
  ): Promise<TeamCityPage<Projected<TeamCityAgent, F>>> {
    return this.#list(
      "/app/rest/agents",
      [
        options.connected === undefined ? undefined : `connected:${locatorValue(options.connected, "Connected filter")}`,
        options.enabled === undefined ? undefined : `enabled:${locatorValue(options.enabled, "Enabled filter")}`,
        `authorized:${locatorValue(options.authorized ?? "any", "Authorized filter")}`,
      ],
      "agent",
      agentFields,
      (item) => item as TeamCityAgent,
      options,
    );
  }

  public getAgent<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ): Promise<Projected<TeamCityAgent, F>> {
    return this.#projectedJson(
      "GET",
      `/app/rest/agents/id:${integerId(id, "TeamCity agent ID")}`,
      { fields: agentFields },
      raw => raw as TeamCityAgent,
      fields,
    );
  }

  /**
   * Queue one build. A lost or unreadable response, or a 5xx from TeamCity or a proxy, may hide an
   * accepted build, so each of them is an unknown outcome rather than a plain failure.
   */
  public async runJob<F extends string | undefined = undefined>(id: string, options: RunJobOptions = {}, body: Record<string, unknown> = {}, fields?: F): Promise<Projected<TeamCityBuild, F>> {
    const jobId = requiredText(id, "TeamCity job ID");
    const { moveToTop, branch, comment, cleanSources, properties: compactProperties, ...native } = options;
    const input = body.properties === undefined ? compactProperties : body.properties;
    const properties = input === undefined ? undefined : inputProperties(input);
    const requestedProperties = properties == null ? [] : triage.array(properties.property) as PlainProperty[];
    if (options.cleanSources !== undefined && typeof options.cleanSources !== "boolean") {
      throw new Error("Clean sources must be a boolean.");
    }
    let contents: string;
    try {
      contents = await this.#request(
        "POST",
        "/app/rest/buildQueue",
        {
          fields: fields ?? `${buildFields}${requestedProperties.length ? ",properties(property(name))" : ""}`,
          ...(options.moveToTop === undefined ? {} : { moveToTop: options.moveToTop }),
        },
        {
          buildType: { id: jobId },
          ...(options.cleanSources === undefined
            ? {}
            : { triggeringOptions: { cleanSources: options.cleanSources } }),
          ...(options.branch === undefined
            ? {}
            : { branchName: requiredText(options.branch, "TeamCity branch name") }),
          ...(options.comment === undefined
            ? {}
            : { comment: typeof options.comment === "string" ? { text: options.comment } : options.comment }),
          ...(properties === undefined ? {} : { properties }),
          ...native,
          ...body,
        },
      );
    } catch (error) {
      if (!(error instanceof HttpError) || error.status < 500) throw error;
      throw new TeamCityUnknownOutcomeError(
        error.message,
        error,
      );
    }
    if (fields !== undefined) {
      let value: unknown;
      try {
        value = JSON.parse(contents);
      } catch (cause) {
        throw new TeamCityUnknownOutcomeError("TeamCity returned invalid JSON after the queue request.",
          diagnosticCause(cause, [], "Invalid JSON syntax."));
      }
      return this.#projectedValue(value, fields, raw => raw as TeamCityBuild);
    }
    const build = queuedBuild(contents);
    if (build === undefined) {
      throw new TeamCityUnknownOutcomeError(
        "TeamCity returned no readable build ID.",
      );
    }
    // The server can return extra fields: retain no parameter values even then.
    const { properties: returnedProperties, ...summary } = build as TeamCityBuild & {
      properties?: { property?: { name?: unknown }[] };
    };
    if (!requestedProperties.length) return summary as Projected<TeamCityBuild, F>;
    const requested = new Set(requestedProperties.map((property) => property.name));
    const returned = Array.isArray(returnedProperties?.property) ? returnedProperties.property : [];
    const parameterNames = [...new Set(returned
      .map((property) => property?.name).filter(
        (name): name is string => typeof name === "string" && requested.has(name),
      )
    )];
    return { ...summary, parameterNames } as Projected<TeamCityBuild, F>;
  }

  public cancelBuild<F extends string | undefined = undefined>(
    id: number,
    options: CancelBuildOptions<F> = {},
    native: Record<string, unknown> = {}
  ): Promise<Projected<TeamCityBuild, F>> {
    return this.#cancel(`/app/rest/builds/id:${integerId(id, "TeamCity build ID")}`, options, native);
  }

  public cancelQueuedBuild<F extends string | undefined = undefined>(
    id: number,
    options: CancelBuildOptions<F> = {},
    native: Record<string, unknown> = {},
  ): Promise<Projected<TeamCityBuild, F>> {
    return this.#cancel(
      `/app/rest/buildQueue/id:${integerId(id, "TeamCity queued build ID")}`,
      options,
      native,
    );
  }

  public createProject<F extends string | undefined = undefined>(id: string, options: CreateProjectOptions, fields?: F): Promise<Projected<TeamCityProject, F>> {
    return this.#requestJson<TeamCityProject>("POST", "/app/rest/projects", { fields: projectFields }, {
        id: requiredText(id, "Project ID"),
        ...(options.name === undefined ? {} : { name: requiredText(options.name, "Project name") }),
        ...(options.parent === undefined ? {} : { parentProject: { id: requiredText(options.parent, "Parent project ID") } }),
        ...Object.fromEntries(Object.entries(options).filter(([key]) => key !== "parent")),
      }).then(value => this.#projectedValue(value, fields, () => value));
  }

  public createJob<F extends string | undefined = undefined>(
    id: string,
    options: CreateJobOptions,
    fields?: F
  ): Promise<Projected<TeamCityJob, F>> {
    return this.#projectedJson(
      "POST",
      "/app/rest/buildTypes",
      { fields: jobFields },
      value => value as TeamCityJob,
      fields,
      {
        id: requiredText(id, "Job ID"),
        ...(options.project === undefined ? {} : { project: typeof options.project === "string" ? { id: requiredText(options.project, "Project ID") } : options.project }),
        ...Object.fromEntries(Object.entries(options).filter(([key]) => key !== "project")),
      },
    );
  }

  public async copyJob<F extends string | undefined = undefined>(source: string, id: string, options: CreateJobOptions, native: Record<string, unknown> = {}, fields?: F) {
    const nativeResponse = await this.#requestJson<TeamCityJob>("POST", `${projectPath(triage.inputText(options.project, "Project ID"))}/buildTypes`, { fields: fields ?? "id,name,projectId" }, {
        id: requiredText(id, "Job ID"),
        sourceBuildType: { id: requiredText(source, "Source job ID") },
        ...Object.fromEntries(Object.entries(options).filter(([key]) => key !== "project")),
        ...native,
      });
    return this.#projectedValue(nativeResponse, fields, () => {
      const copied = nativeResponse;
      return { id: copied.id, name: copied.name, projectId: copied.projectId };
    });
  }

  public setProjectField<F extends string | undefined = undefined>(id: string, field: string, value: string, fields?: F) {
    return this.#setField(projectPath(id), id, field, value, fields);
  }

  public setJobField<F extends string | undefined = undefined>(id: string, field: string, value: string, fields?: F) {
    return this.#setField(jobPath(id), id, field, value, fields);
  }

  async #setField<F extends string | undefined>(path: string, id: string, field: string, value: string, fields?: F) {
    plainProperty(field, value);
    if (field === "name") value = requiredText(value, "Name");
    const contents = await this.#requestText("PUT", `${path}/${pathSegment(field)}`, value);
    return this.#projectedValue(contents, fields, () => ({ id: id, field, value }));
  }

  public async moveProject<F extends string | undefined = undefined>(
    id: string,
    parent: string | undefined,
    fields?: F,
    native: Record<string, unknown> = {}
  ) {
    const parentProjectId = parent === undefined ? undefined : requiredText(parent, "Parent project ID");
    const contents = await this.#request(
      "PUT",
      `${projectPath(id)}/parentProject`,
      fields === undefined ? {} : { fields: fieldsProjection(fields) },
      { ...(parentProjectId === undefined ? {} : { id: parentProjectId }), ...native },
    );
    return this.#projectedAcknowledgement(contents, fields, { id: id, parentProjectId, moved: true });
  }

  public async moveJob<F extends string | undefined = undefined>(id: string, project: string | undefined, fields?: F) {
    const projectId = project === undefined ? undefined : requiredText(project, "Project ID");
    const nativeResponse = await this.#request(
      "POST",
      `${jobPath(id)}/move`,
      projectId === undefined ? {} : { targetProjectId: projectId },
    );
    return this.#projectedAcknowledgement(nativeResponse, fields, { id: id, projectId, moved: true });
  }

  public async deleteProject<F extends string | undefined = undefined>(id: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", projectPath(id));
    return this.#projectedAcknowledgement(nativeResponse, fields, { id: id, deleted: true });
  }

  public async deleteJob<F extends string | undefined = undefined>(id: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", jobPath(id));
    return this.#projectedAcknowledgement(nativeResponse, fields, { id: id, deleted: true });
  }

  public async listParameters<F extends string | undefined = undefined>(
    owner: ParameterOwner,
    id: string,
    fields?: F,
    locator?: string,
  ) {
    return this.#projectedJson(
      "GET",
      parametersPath(owner, id),
      { fields: `property(${propertyFields})`, ...(locator === undefined ? {} : { locator }) },
      value => ((value as { property?: RawProperty[] }).property ?? []).map(p => safeProperty(p)),
      fields,
    );
  }

  public async getParameter<F extends string | undefined = undefined>(
    owner: ParameterOwner,
    id: string,
    name: string,
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      `${parametersPath(owner, id)}/${pathSegment(name)}`,
      { fields: propertyFields },
      value => safeProperty(value as RawProperty),
      fields,
    );
  }

  public createParameter<F extends string | undefined = undefined>(
    owner: ParameterOwner,
    id: string,
    name: string,
    value: string | undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#writeParameter("POST", owner, id, name, value, fields, native);
  }

  public setParameter<F extends string | undefined = undefined>(
    owner: ParameterOwner,
    id: string,
    name: string,
    value: string | undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#writeParameter("PUT", owner, id, name, value, fields, native);
  }

  public async setPasswordParameter<F extends string | undefined = undefined>(jobId: string, name: string, alias: string | undefined, secrets: ScopedSecrets, plainValue?: string, native: Record<string, unknown> = {}, fields?: F) {
    secrets = this.#rememberSecrets(secrets);
    const collection = parametersPath("jobs", jobId);
    pathSegment(name);
    const path = `${collection}/${pathSegment(name)}`;
    const value = native.value === undefined ? await inputValue(secrets, alias, plainValue) : native.value;
    let existing: RawProperty | undefined;
    try {
      existing = await this.#requestJson<RawProperty>("GET", path, { fields: "name,inherited,type(rawValue)" });
    } catch {
      this.#signal?.throwIfAborted();
    }
    let contents: string;
    try {
      // Metadata is used only to retain password type and hide a scalar echo.
      contents = await this.#request("PUT", path, {}, { name, value, ...native, type: native.type ?? existing?.type ?? { rawValue: "password" } },
        "application/json", { discard: fields === undefined });
    } catch (cause) {
      const fromAlias = native.value === undefined && plainValue === undefined && typeof value === "string";
      throw new Error("Password parameter update failed.", { cause: diagnosticCause(cause, fromAlias ? [value] : []) });
    }
    return this.#projectedAcknowledgement(contents, fields, { jobId: jobId, name, stored: true },
      { name, type: (native.type ?? existing?.type ?? { rawValue: "password" }) as NonNullable<RawProperty["type"]> });
  }

  async #writeParameter<F extends string | undefined = undefined>(
    method: "POST" | "PUT",
    owner: ParameterOwner,
    id: string,
    name: string,
    value: string | undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    const body = { name: requiredText(name, "Property name"), ...(value === undefined ? {} : plainProperty(name, value)) };
    const collection = parametersPath(owner, id);
    const path = method === "POST" ? collection : `${collection}/${pathSegment(body.name)}`;
    return this.#projectedJson(
      method,
      path,
      { fields: propertyFields },
      value => safeProperty(value as RawProperty),
      fields,
      { ...body, ...native },
    );
  }

  public async deleteParameter<F extends string | undefined = undefined>(owner: ParameterOwner, id: string, name: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", `${parametersPath(owner, id)}/${pathSegment(name)}`);
    return this.#projectedAcknowledgement(nativeResponse, fields, { owner, id: id, name: name, deleted: true });
  }

  public async listSteps<F extends string | undefined = undefined>(
    jobId: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${jobPath(jobId)}/steps`,
      { fields: `step(${stepFields})` },
      value => ((value as { step?: RawStep[] }).step ?? []).map(safeStep),
      fields,
    );
  }

  public async getStep<F extends string | undefined = undefined>(
    jobId: string,
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${jobPath(jobId)}/steps/${pathSegment(id)}`,
      { fields: stepFields },
      value => safeStep(value as RawStep),
      fields,
    );
  }

  public async createStep<F extends string | undefined = undefined>(
    jobId: string,
    input: StepInput,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "POST",
      `${jobPath(jobId)}/steps`,
      { fields: stepFields },
      value => safeStep(value as RawStep),
      fields,
      { ...stepBody(input), ...native },
    );
  }

  public async replaceStep<F extends string | undefined = undefined>(
    jobId: string,
    id: string,
    input: StepInput,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "PUT",
      `${jobPath(jobId)}/steps/${pathSegment(id)}`,
      { fields: stepFields },
      value => safeStep(value as RawStep),
      fields,
      { ...stepBody(input), ...native },
    );
  }

  public async deleteStep<F extends string | undefined = undefined>(jobId: string, id: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", `${jobPath(jobId)}/steps/${pathSegment(id)}`);
    return this.#projectedAcknowledgement(nativeResponse, fields, { jobId: jobId, id: id, deleted: true });
  }

  public async listExtensions<F extends string | undefined = undefined>(
    kind: ExtensionKind,
    jobId: string,
    fields?: F,
  ) {
    const key = kind === "triggers" ? "trigger" : "feature";
    return this.#projectedJson(
      "GET",
      `${jobPath(jobId)}/${kind}`,
      { fields: `${key}(${extensionFields})` },
      value =>
        ((value as { trigger?: RawExtension[]; feature?: RawExtension[] })[key] ?? []).map(safeExtension),
      fields
    );
  }

  public async getExtension<F extends string | undefined = undefined>(
    kind: ExtensionKind,
    jobId: string,
    id: string,
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      extensionPath(kind, jobId, id),
      { fields: extensionFields },
      value => safeExtension(value as RawExtension),
      fields,
    );
  }

  public async createExtension<F extends string | undefined = undefined>(
    kind: ExtensionKind,
    jobId: string,
    input: ExtensionInput,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "POST",
      `${jobPath(jobId)}/${kind}`,
      { fields: extensionFields },
      value => safeExtension(value as RawExtension),
      fields,
      { ...extensionBody(input), ...native },
    );
  }

  public async replaceExtension<F extends string | undefined = undefined>(
    kind: ExtensionKind,
    jobId: string,
    id: string,
    input: ExtensionInput,
    fields?: F,
    native: Record<string, unknown> = {},

  ) {
    return this.#projectedJson(
      "PUT",
      extensionPath(kind, jobId, id),
      { fields: extensionFields },
      value => safeExtension(value as RawExtension),
      fields,
      { ...extensionBody(input), ...native },
    );
  }

  public async deleteExtension<F extends string | undefined = undefined>(kind: ExtensionKind, jobId: string, id: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", extensionPath(kind, jobId, id));
    return this.#projectedAcknowledgement(nativeResponse, fields, { jobId: jobId, id: id, deleted: true });
  }

  public async listSnapshotDependencies<F extends string | undefined = undefined>(
    jobId: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${jobPath(jobId)}/snapshot-dependencies`,
      { fields: `snapshot-dependency(${snapshotFields})` },
      value =>
        ((value as { "snapshot-dependency"?: RawSnapshotDependency[] })["snapshot-dependency"] ?? []).map(
          safeSnapshot,
        ),
      fields,
    );
  }

  public async getSnapshotDependency<F extends string | undefined = undefined>(
    jobId: string,
    id: string,
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      snapshotPath(jobId, id),
      { fields: snapshotFields },
      value => safeSnapshot(value as RawSnapshotDependency),
      fields,
    );
  }

  public async createSnapshotDependency<F extends string | undefined = undefined>(
    jobId: string,
    input: SnapshotDependencyInput,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "POST",
      `${jobPath(jobId)}/snapshot-dependencies`,
      { fields: snapshotFields },
      value => safeSnapshot(value as RawSnapshotDependency),
      fields,
      { ...snapshotBody(jobId, input), ...native },
    );
  }

  public async replaceSnapshotDependency<F extends string | undefined = undefined>(
    jobId: string,
    id: string,
    input: SnapshotDependencyInput,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "PUT",
      snapshotPath(jobId, id),
      { fields: snapshotFields },
      value => safeSnapshot(value as RawSnapshotDependency),
      fields,
      { ...snapshotBody(jobId, input), ...native },
    );
  }

  public async deleteSnapshotDependency<F extends string | undefined = undefined>(jobId: string, id: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", snapshotPath(jobId, id));
    return this.#projectedAcknowledgement(nativeResponse, fields, { jobId: jobId, id: id, deleted: true });
  }

  public async listTemplates<F extends string | undefined = undefined>(
    jobId: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${jobPath(jobId)}/templates`,
      { fields: `buildType(${identityFields})` },
      value => ((value as { buildType?: BuildTypeIdentity[] }).buildType ?? []).map(safeIdentity),
      fields,
    );
  }

  public async attachTemplate<F extends string | undefined = undefined>(
    jobId: string,
    templateId: string | undefined,
    optimizeSettings?: boolean,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "POST",
      `${jobPath(jobId)}/templates`,
      { fields: identityFields, ...(optimizeSettings === undefined ? {} : { optimizeSettings: String(optimizeSettings) }) },
      value => safeIdentity(value as BuildTypeIdentity),
      fields,
      { id: templateId === undefined ? undefined : requiredText(templateId, "Template ID"), ...native },
    );
  }

  public async detachTemplate<F extends string | undefined = undefined>(jobId: string, templateId: string, inlineSettings?: boolean, fields?: F) {
    const nativeResponse = await this.#request("DELETE", `${jobPath(jobId)}/templates/${idPath(templateId, "Template ID")}`, {
        ...(inlineSettings === undefined ? {} : { inlineSettings: String(inlineSettings) }),
      });
    return this.#projectedAcknowledgement(nativeResponse, fields, { jobId: jobId, templateId: templateId, detached: true, inlineSettings: inlineSettings ?? false });
  }

  public async listRules<F extends string | undefined = undefined>(
    kind: RuleKind,
    jobId: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${jobPath(jobId)}/${kind}`,
      {
        fields: `${kind === "agent-requirements" ? "agent-requirement" : "artifact-dependency"}(${ruleFields(kind)})`,
      },
      value =>
        ((value as Record<string, RawSnapshotDependency[]>)[
          kind === "agent-requirements" ? "agent-requirement" : "artifact-dependency"
        ] ?? []).map(
          safeSnapshot,
        ),
      fields,
    );
  }

  public async getRule<F extends string | undefined = undefined>(
    kind: RuleKind,
    jobId: string,
    id: string,
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      entityPath(kind, jobId, id),
      { fields: ruleFields(kind) },
      value => safeSnapshot(value as RawSnapshotDependency),
      fields,
    );
  }

  public async createRule<F extends string | undefined = undefined>(
    jobId: string,
    input: RuleInput,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "POST",
      `${jobPath(jobId)}/${input.kind}`,
      { fields: ruleFields(input.kind) },
      value => safeSnapshot(value as RawSnapshotDependency),
      fields,
      ruleBody(jobId, input, native),
    );
  }

  public async replaceRule<F extends string | undefined = undefined>(
    jobId: string,
    id: string,
    input: RuleInput,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "PUT",
      entityPath(input.kind, jobId, id),
      { fields: ruleFields(input.kind) },
      value => safeSnapshot(value as RawSnapshotDependency),
      fields,
      ruleBody(jobId, input, native),
    );
  }

  public async deleteRule<F extends string | undefined = undefined>(kind: RuleKind, jobId: string, id: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", entityPath(kind, jobId, id));
    return this.#projectedAcknowledgement(nativeResponse, fields, { ownerId: jobId, id: id, deleted: true });
  }

  public async getEntitySetting<F extends string | undefined = undefined>(
    kind: EntitySettingsKind,
    jobId: string,
    id: string,
    field: string, fields?: F
  ) {
    requiredText(field, "Field name");
    const value = await this.#requestText("GET", `${entityPath(kind, jobId, id)}/${pathSegment(field)}`);
    return this.#projectedValue(value, fields, () => ({ jobId: jobId, id: id, field, value }));
  }

  public async setEntitySetting<F extends string | undefined = undefined>(
    kind: EntitySettingsKind,
    jobId: string,
    id: string,
    field: string,
    value: string, fields?: F
  ) {
    plainProperty(field, value);
    const result = await this.#requestText("PUT", `${entityPath(kind, jobId, id)}/${pathSegment(field)}`, value);
    return this.#projectedValue(result, fields, () => ({ jobId: jobId, id: id, field, value: result }));
  }

  public async listPluginParameters<F extends string | undefined = undefined>(
    kind: "steps" | "features",
    jobId: string,
    id: string,
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      `${entityPath(kind, jobId, id)}/parameters`,
      { fields: `property(${propertyFields})` },
      value => ((value as { property?: RawProperty[] }).property ?? []).map(p => safeProperty(p)),
      fields
    );

  }

  public async replacePluginParameters<F extends string | undefined = undefined>(
    kind: "steps" | "features",
    jobId: string,
    id: string,
    properties: readonly PlainProperty[],
    fields?: F,
    native: Record<string, unknown> = {},

  ) {
    return this.#projectedJson(
      "PUT",
      `${entityPath(kind, jobId, id)}/parameters`,
      { fields: `property(${propertyFields})` },
      value => ((value as { property?: RawProperty[] }).property ?? []).map(p => safeProperty(p, false)),
      fields,
      { ...propertiesBody(properties), ...native }
    );
  }

  public async getPluginParameter<F extends string | undefined = undefined>(
    kind: "steps" | "features",
    jobId: string,
    id: string,
    name: string,
    fields?: F,
  ) {
    // The collection carries password type metadata that the scalar endpoint omits.
    const properties = await this.listPluginParameters(kind, jobId, id);
    const property = properties.find((item) => item.name === name);
    if (property === undefined) throw new HttpError(404, "TeamCity property was not found.");
    if (property.redacted) return this.#projectedValue(property, fields, () => property);
    const value = await this.#requestText(
      "GET", `${entityPath(kind, jobId, id)}/parameters/${pathSegment(name)}`,
    );
    return this.#projectedValue(value, fields, () => ({ ...property, ...safeProperty({ name, value, type: { rawValue: property.type } }) }));
  }

  public async setPluginParameter<F extends string | undefined = undefined>(
    kind: "steps" | "features",
    jobId: string,
    id: string,
    name: string,
    value: string, fields?: F
  ) {
    const property = plainProperty(name, value);
    const nativeResponse = await this.#requestText(
      "PUT",
      `${entityPath(kind, jobId, id)}/parameters/${pathSegment(property.name)}`,
      value,
    );
    return this.#projectedValue(nativeResponse, fields, () => (safeProperty({ name: property.name }, false)), { name });
  }

  public async listProjectFeatures<F extends string | undefined = undefined>(
    projectId: string,
    fields?: F,
    locator?: string,
  ) {
    return this.#projectedJson(
      "GET",
      `${projectPath(projectId)}/projectFeatures`,
      {
        fields: `projectFeature(${extensionFields})`,
        ...(locator === undefined ? {} : { locator: requiredText(locator, "Locator") }),
      },
      value => ((value as { projectFeature?: RawExtension[] }).projectFeature ?? []).map(safeExtension),
      fields,
    );
  }

  public async getProjectFeature<F extends string | undefined = undefined>(
    projectId: string,
    id: string,
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      `${projectPath(projectId)}/projectFeatures/${idPath(id, "Feature ID")}`,
      { fields: extensionFields },
      value => safeExtension(value as RawExtension),
      fields,
    );
  }

  public async createProjectFeature<F extends string | undefined = undefined>(
    projectId: string,
    type: string | undefined,
    properties: readonly PlainProperty[] | undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "POST",
      `${projectPath(projectId)}/projectFeatures`,
      { fields: extensionFields },
      value => safeExtension(value as RawExtension),
      fields,
      { ...(type === undefined ? {} : { type: requiredText(type, "Feature type") }), ...(properties === undefined ? {} : { properties: propertiesBody(properties) }), ...native },
    );
  }

  public async replaceProjectFeature<F extends string | undefined = undefined>(
    projectId: string,
    id: string,
    type: string | undefined,
    properties: readonly PlainProperty[] | undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "PUT",
      `${projectPath(projectId)}/projectFeatures/${idPath(id, "Feature ID")}`,
      { fields: extensionFields },
      value => safeExtension(value as RawExtension),
      fields,
      { ...(type === undefined ? {} : { type: requiredText(type, "Feature type") }), ...(properties === undefined ? {} : { properties: propertiesBody(properties) }), ...native },
    );
  }

  public async deleteProjectFeature<F extends string | undefined = undefined>(projectId: string, id: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", `${projectPath(projectId)}/projectFeatures/${idPath(id, "Feature ID")}`);
    return this.#projectedAcknowledgement(nativeResponse, fields, { ownerId: projectId, id: id, deleted: true });
  }

  public async listProjectTemplates<F extends string | undefined = undefined>(
    projectId: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${projectPath(projectId)}/templates`,
      { fields: `buildType(${identityFields})` },
      value => ((value as { buildType?: BuildTypeIdentity[] }).buildType ?? []).map(safeIdentity),
      fields,
    );
  }

  public async createProjectTemplate<F extends string | undefined = undefined>(
    projectId: string,
    id: string,
    name: string | undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "POST",
      `${projectPath(projectId)}/templates`,
      { fields: identityFields },
      value => safeIdentity(value as BuildTypeIdentity),
      fields,
      { id: requiredText(id, "Template ID"), ...(name === undefined ? {} : { name: requiredText(name, "Template name") }), ...native },
    );
  }

  public async getDefaultTemplate<F extends string | undefined = undefined>(
    projectId: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${projectPath(projectId)}/defaultTemplate`,
      { fields: identityFields },
      value => safeIdentity(value as BuildTypeIdentity),
      fields,
    );
  }

  public async setDefaultTemplate<F extends string | undefined = undefined>(
    projectId: string,
    id: string | undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "PUT",
      `${projectPath(projectId)}/defaultTemplate`,
      { fields: identityFields },
      value => safeIdentity(value as BuildTypeIdentity),
      fields,
      { id: id === undefined ? undefined : requiredText(id, "Template ID"), ...native },
    );
  }

  public async clearDefaultTemplate<F extends string | undefined = undefined>(
    projectId: string,
    fields?: F
  ) {
    const contents = await this.#request(
      "DELETE",
      `${projectPath(projectId)}/defaultTemplate`,
      fields === undefined ? {} : { fields: fieldsProjection(fields) },
      undefined,
    );
    return this.#projectedAcknowledgement(contents, fields, { projectId: projectId, cleared: true });
  }

  public async getAttachedTemplate<F extends string | undefined = undefined>(
    jobId: string,
    id: string,
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      `${jobPath(jobId)}/templates/${idPath(id, "Template ID")}`,
      { fields: identityFields },
      value => safeIdentity(value as BuildTypeIdentity),
      fields,
    );
  }

  public async getProjectParent<F extends string | undefined = undefined>(
    projectId: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${projectPath(projectId)}/parentProject`,
      { fields: "id,name" },
      value => {
        const result = value as BuildTypeIdentity;
        return { id: result.id, ...(result.name === undefined ? {} : { name: result.name }) };
      },
      fields,
    );
  }

  public async getOwnerField<F extends string | undefined = undefined>(owner: "projects" | "jobs", id: string, field: string, fields?: F) {
    requiredText(field, "Field name");
    const value = await this.#requestText("GET", `${owner === "projects" ? projectPath(id) : jobPath(id)}/${pathSegment(field)}`);
    return this.#projectedValue(value, fields, () => ({ id: id, field, value }));
  }

  public async listJobAliases<F extends string | undefined = undefined>(
    jobId: string,
    field?: string, fields?: F
  ) {
    const nativeResponse = await this.#requestJson<{ item?: string[] }>(
      "GET",
      `${jobPath(jobId)}/aliases`,
      field === undefined ? {} : { field },
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      const result = nativeResponse;
      return result.item ?? [];
    });
  }

  public listJobBranches<F extends string | undefined = undefined>(
    jobId: string,
    options: TeamCityPageOptions & { fields?: F } = {},
  ) {
    return this.#list(`${jobPath(jobId)}/branches`, ["policy:ALL_BRANCHES"], "branch", "name,default,active", (item) => {
      const { name, default: isDefault, active } =
        item as { name: string; default?: boolean; active?: boolean };
      return {
        name,
        ...(isDefault === undefined ? {} : { default: isDefault }),
        ...(active === undefined ? {} : { active }),
      };
    }, options);
  }

  public async listJobTags<F extends string | undefined = undefined>(
    jobId: string,
    field?: string, fields?: F
  ) {
    const nativeResponse = await this.#requestJson<{ tag?: { name: string }[] }>(
      "GET",
      `${jobPath(jobId)}/buildTags`,
      { field: field ?? "tag(name)" },
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      const result = nativeResponse;
      return (result.tag ?? []).map((tag) => tag.name);
    });
  }

  public listVcsRoots<F extends string | undefined = undefined>(
    options: TeamCityPageOptions & { project?: string; fields?: F } = {},
  ) {
    return this.#list(
      "/app/rest/vcs-roots",
      [options.project === undefined ? undefined : nestedId("project", options.project, "Project ID")],
      "vcs-root",
      rootFields,
      (item) => safeRoot(item as VcsRoot),
      options,
    );
  }

  public async getVcsRoot<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `/app/rest/vcs-roots/${idPath(id, "VCS root ID")}`,
      { fields: rootFields },
      value => safeRoot(value as VcsRoot),
      fields,
    );
  }

  public async listVcsEntries<F extends string | undefined = undefined>(
    jobId: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${jobPath(jobId)}/vcs-root-entries`,
      { fields: `vcs-root-entry(${entryFields})` },
      value => ((value as { "vcs-root-entry"?: RawVcsEntry[] })["vcs-root-entry"] ?? []).map(safeEntry),
      fields,
    );
  }

  public async getVcsEntry<F extends string | undefined = undefined>(
    jobId: string,
    rootId: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      entryPath(jobId, rootId),
      { fields: entryFields },
      value => safeEntry(value as RawVcsEntry),
      fields,
    );
  }

  public async attachVcsRoot<F extends string | undefined = undefined>(
    jobId: string,
    rootId: string | undefined,
    rules: string | undefined = undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "POST",
      `${jobPath(jobId)}/vcs-root-entries`,
      { fields: entryFields },
      value => safeEntry(value as RawVcsEntry),
      fields,
      { ...(rootId === undefined ? {} : { "vcs-root": { id: requiredText(rootId, "VCS root ID") } }), ...(rules === undefined ? {} : { "checkout-rules": rules }), ...native },
    );
  }

  public async replaceVcsEntry<F extends string | undefined = undefined>(
    jobId: string,
    rootId: string,
    rules: string | undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "PUT",
      entryPath(jobId, rootId),
      { fields: entryFields },
      value => safeEntry(value as RawVcsEntry),
      fields,
      { "vcs-root": { id: rootId }, "checkout-rules": rules, ...native },
    );
  }

  public async detachVcsRoot<F extends string | undefined = undefined>(jobId: string, rootId: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", entryPath(jobId, rootId));
    return this.#projectedAcknowledgement(nativeResponse, fields, { jobId: jobId, rootId: rootId, detached: true });
  }

  public async getCheckoutRules<F extends string | undefined = undefined>(jobId: string, rootId: string, fields?: F) {
    const rules = await this.#requestText("GET", `${entryPath(jobId, rootId)}/checkout-rules`);
    return this.#projectedValue(rules, fields, () => ({ jobId: jobId, rootId: rootId, rules }));
  }

  public async setCheckoutRules<F extends string | undefined = undefined>(jobId: string, rootId: string, rules: string | undefined, fields?: F) {
    const nativeResponse = await this.#requestText("PUT", `${entryPath(jobId, rootId)}/checkout-rules`, rules);
    return this.#projectedValue(nativeResponse, fields, () => ({ jobId: jobId, rootId: rootId, rules }));
  }

  public listPools<F extends string | undefined = undefined>(
    options: TeamCityPageOptions & { fields?: F } = {},
  ) {
    return this.#list("/app/rest/agentPools", ["orphanedPool:any"], "agentPool", "id,name",
      (item) => safeNamed(item as AgentPoolSummary), options);
  }

  public async createPool<F extends string | undefined = undefined>(name: string | undefined, native: Record<string, unknown> = {}, fields?: F) {
    const nativeResponse = await this.#requestJson<AgentPoolSummary>(
      "POST",
      "/app/rest/agentPools",
      {},
      { name: name === undefined ? undefined : requiredText(name, "Pool name"), ...native },
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      return safeNamed(
        nativeResponse,
      );
    });
  }

  public async getPool<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      poolPath(id),
      { fields: "id,name" },
      value => safeNamed(value as AgentPoolSummary),
      fields,
    );
  }

  public async deletePool<F extends string | undefined = undefined>(id: number, fields?: F) {
    const nativeResponse = await this.#request("DELETE", poolPath(id));
    return this.#projectedAcknowledgement(nativeResponse, fields, { poolId: id, deleted: true });
  }

  public async getPoolField<F extends string | undefined = undefined>(id: number, field: string, fields?: F) {
    requiredText(field, "Field name");
    const value = await this.#requestText("GET", `${poolPath(id)}/${pathSegment(field)}`);
    return this.#projectedValue(value, fields, () => ({ poolId: id, field, value }));
  }

  public async setPoolField<F extends string | undefined = undefined>(id: number, field: string, value: string, fields?: F) {
    plainProperty(field, "");
    requiredText(value, "Pool name");
    const result = await this.#requestText("PUT", `${poolPath(id)}/${pathSegment(field)}`, value);
    return this.#projectedValue(result, fields, () => ({ poolId: id, field, value: result }));
  }

  public listPoolAgents<F extends string | undefined = undefined>(
    id: number,
    options: TeamCityPageOptions & { fields?: F } = {},
  ) {
    return this.#list(`${poolPath(id)}/agents`, [], "agent", "id,name",
      (item) => safeNamed(item as AgentPoolSummary), options);
  }

  public async assignPoolAgent<F extends string | undefined = undefined>(
    poolId: number,
    id: number,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    integerId(id, "Agent ID");
    return this.#projectedJson(
      "POST",
      `${poolPath(poolId)}/agents`,
      { fields: "id,name" },
      value => safeNamed(value as AgentPoolSummary),
      fields,
      { id, ...native },
    );
  }

  public async listPoolProjects<F extends string | undefined = undefined>(
    poolId: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${poolPath(poolId)}/projects`,
      { fields: "project(id,name)" },
      value => ((value as { project?: BuildTypeIdentity[] }).project ?? []).map(safeIdentity),
      fields,
    );
  }

  public async assignPoolProject<F extends string | undefined = undefined>(poolId: number, id: string, native: Record<string, unknown> = {}, fields?: F) {
    const nativeResponse = await this.#requestJson<BuildTypeIdentity>(
      "POST",
      `${poolPath(poolId)}/projects`,
      {},
      { id: requiredText(id, "Project ID"), ...native },
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      return safeIdentity(
        nativeResponse,
      );
    });
  }

  public async unassignPoolProject<F extends string | undefined = undefined>(poolId: number, projectId: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", `${poolPath(poolId)}/projects/${idPath(projectId, "Project ID")}`);
    return this.#projectedAcknowledgement(nativeResponse, fields, { poolId, projectId: projectId, unassigned: true });
  }

  public async deleteAgent<F extends string | undefined = undefined>(id: number, fields?: F) {
    const nativeResponse = await this.#request("DELETE", agentPath(id));
    return this.#projectedAcknowledgement(nativeResponse, fields, { agentId: id, deleted: true });
  }

  public async getAgentStatus<F extends string | undefined = undefined>(
    id: number,
    kind: "enabled" | "authorized",
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      `${agentPath(id)}/${kind}Info`,
      {
        fields: booleanStatusFields,
      },
      raw => safeBooleanStatus(raw as BooleanStatus),
      fields,
    );
  }

  public async setAgentStatus<F extends string | undefined = undefined>(
    id: number,
    kind: "enabled" | "authorized",
    status: boolean,
    comment?: string,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "PUT",
      `${agentPath(id)}/${kind}Info`,
      { fields: booleanStatusFields },
      raw => safeBooleanStatus(raw as BooleanStatus),
      fields,
      { ...this.#statusBody(status, comment), ...native },

    );
  }

  public async getAgentPolicy<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${agentPath(id)}/compatibilityPolicy`,
      {
        fields: policyFields,
      },
      raw => safePolicy(raw as RawAgentPolicy),
      fields,
    );
  }

  public async setAgentPolicy<F extends string | undefined = undefined>(
    id: number,
    policy: string,
    jobs: readonly string[] | undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    requiredText(policy, "Policy");
    const ids = jobs?.map((job) => requiredText(job, "Job ID"));
    return this.#projectedJson(
      "PUT",
      `${agentPath(id)}/compatibilityPolicy`,
      { fields: policyFields },
      raw => safePolicy(raw as RawAgentPolicy),
      fields,
      { policy, ...(ids === undefined ? {} : { buildTypes: { buildType: ids.map((id) => ({ id })) } }), ...native },

    );
  }

  public async listAgentCompatibleJobs<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${agentPath(id)}/compatibleBuildTypes`,
      { fields: `buildType(${identityFields})` },
      raw => ((raw as { buildType?: BuildTypeIdentity[] }).buildType ?? []).map(safeIdentity),
      fields,

    );
  }

  public async listAgentIncompatibleJobs<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${agentPath(id)}/incompatibleBuildTypes`,
      { fields: `compatibility(compatible,buildType(${identityFields}))` },
      raw =>
        ((raw as { compatibility?: { compatible: boolean; buildType: BuildTypeIdentity }[] }).compatibility ?? []).map(
          (entry) => ({
            compatible: entry.compatible,
            buildType: safeIdentity(entry.buildType),
          })
        ),
      fields,

    );
  }

  public async getAgentPool<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    const result = await this.#optionalJson<AgentPoolSummary>(
      `${agentPath(id)}/pool`,
      fields === undefined ? "id,name" : fieldsProjection(fields),
    );
    return this.#projectedValue(
      result,
      fields,
      value => value === null ? null : safeNamed(value as AgentPoolSummary)
    );
  }

  public async setAgentPool<F extends string | undefined = undefined>(
    id: number,
    poolId: number,
    fields?: F,
    native: Record<string, unknown> = {}
  ) {
    return this.#projectedJson(
      "PUT",
      `${agentPath(id)}/pool`,
      { fields: "id,name" },
      raw => safeNamed(raw as AgentPoolSummary),
      fields,
      { id: poolNumber(poolId), ...native },

    );
  }

  public async getAgentField<F extends string | undefined = undefined>(id: number, field: string, fields?: F) {
    requiredText(field, "Field name");
    const value = await this.#requestText("GET", `${agentPath(id)}/${pathSegment(field)}`);
    return this.#projectedValue(value, fields, () => ({ agentId: id, field, value }));
  }

  public async setAgentField<F extends string | undefined = undefined>(id: number, field: string, value: string, fields?: F) {
    plainProperty(field, value);
    const result = await this.#requestText("PUT", `${agentPath(id)}/${pathSegment(field)}`, value);
    return this.#projectedValue(result, fields, () => ({ agentId: id, field, value: result }));
  }

  public async getQueuedBuild<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${buildPath(id, "queue")}`,
      {
        fields: operationBuildFields,
      },
      value => safeOperationBuild(value as OperationBuild),
      fields,
    );
  }

  public async listQueueCompatibleAgents<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${buildPath(id, "queue")}/compatibleAgents`,
      { fields: "agent(id,name)" },
      value => ((value as { agent?: AgentPoolSummary[] }).agent ?? []).map(safeNamed),
      fields,
    );
  }

  public async getQueuePosition<F extends string | undefined = undefined>(
    position: string,
    fields?: F
  ) {
    return this.#projectedJson(
        "GET",
        `/app/rest/buildQueue/order/${queuePosition(position)}`,
        { fields: operationBuildFields },
      value => safeOperationBuild(value as OperationBuild),
      fields,
    );
  }

  public async setQueuePosition<F extends string | undefined = undefined>(
    position: string,
    id: number | undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    if (id !== undefined) integerId(id, "Build ID");
    return this.#projectedValue(
      await this.#requestJson<OperationBuild>(
        "PUT",
        `/app/rest/buildQueue/order/${queuePosition(position)}`,
        { fields: fields === undefined ? operationBuildFields : fieldsProjection(fields) },
        { id, ...native },
      ),
      fields,
      (value) => safeOperationBuild(value as OperationBuild),
    );
  }

  public async deleteBuild<F extends string | undefined = undefined>(id: number, fields?: F) {
    const nativeResponse = await this.#request("DELETE", buildPath(id));
    return this.#projectedAcknowledgement(nativeResponse, fields, { buildId: id, deleted: true });
  }

  public async setBuildComment<F extends string | undefined = undefined>(id: number, text: string | undefined, fields?: F) {
    if (text !== undefined) plainProperty("comment", text);
    const nativeResponse = await this.#requestText("PUT", `${buildPath(id)}/comment`, text);
    return this.#projectedValue(nativeResponse, fields, () => ({ buildId: id, commentUpdated: true }));
  }

  public async clearBuildComment<F extends string | undefined = undefined>(id: number, fields?: F) {
    const nativeResponse = await this.#request("DELETE", `${buildPath(id)}/comment`);
    return this.#projectedAcknowledgement(nativeResponse, fields, { buildId: id, commentCleared: true });
  }

  public async getBuildScalar<F extends string | undefined = undefined>(id: number, field: string, fields?: F) {
    requiredText(field, "Field name");
    const value = await this.#requestText("GET", `${buildPath(id)}/${pathSegment(field)}`);
    return this.#projectedValue(value, fields, () => ({ buildId: id, field, value }));
  }

  public async setBuildScalar<F extends string | undefined = undefined>(id: number, field: string, value: string, fields?: F) {
    plainProperty(field, "");
    plainProperty(field, requiredText(value, "Value"));
    const result = await this.#requestText("PUT", `${buildPath(id)}/${pathSegment(field)}`, value);
    return this.#projectedValue(result, fields, () => ({ buildId: id, field, value: result }));
  }

  public async getBuildPin<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${buildPath(id)}/pinInfo`,
      {
        fields: booleanStatusFields,
      },
      value => safeBooleanStatus(value as BooleanStatus),
      fields,
    );
  }

  public async setBuildPin<F extends string | undefined = undefined>(
    id: number,
    status: boolean,
    comment?: string,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
        "PUT",
        `${buildPath(id)}/pinInfo`,
        { fields: booleanStatusFields },
      (value) => safeBooleanStatus(value as BooleanStatus),
      fields,
        { ...this.#statusBody(status, comment), ...native },
    );
  }

  public async listTags<F extends string | undefined = undefined>(
    owner: "builds" | "queue",
    id: number,
    fields?: F,
    locator?: string,
  ) {
    return this.#projectedJson(
      "GET",
      `${buildPath(id, owner)}/tags`,
      { fields: "tag(name)", locator: locator ?? "private:any" },
      (value) => ((value as { tag?: { name: string }[] }).tag ?? []).map((tag) => tag.name),
      fields,
    );
  }

  public async addTags<F extends string | undefined = undefined>(
    owner: "builds" | "queue",
    id: number,
    tags: readonly string[],
    fields?: F,
    native: Record<string, unknown> = {},

  ) {
    const body = publicTags(tags);
    const contents = await this.#request(
      "POST",
      `${buildPath(id, owner)}/tags`,
      fields === undefined || owner === "queue" ? {} : { fields: fieldsProjection(fields) },
      { ...body, ...native },

    );
    return this.#projectedAcknowledgement(
      contents,
      fields,
      { buildId: id, tags: body.tag.map((tag) => tag.name), added: true },

    );
  }

  public async replaceBuildTags<F extends string | undefined = undefined>(
    id: number,
    tags: readonly string[],
    fields?: F,
    locator?: string,
    native: Record<string, unknown> = {},

  ) {
    return this.#projectedJson(
      "PUT",
      `${buildPath(id)}/tags`,
      { fields: "tag(name)", ...(locator === undefined ? {} : { locator }) },
      (value) => ((value as { tag?: { name: string }[] }).tag ?? []).map((tag) => tag.name),
      fields,
      { ...publicTags(tags, true), ...native },
    );
  }

  public async listBuildStatistics<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${buildPath(id)}/statistics`,
      { fields: "property(name,value)" },
      value =>
        ((value as { property?: { name: string; value: string }[] }).property ?? []).map(
          p => statistic(p.name, p.value),
        ),
      fields,

    );
  }

  public async getBuildStatistic<F extends string | undefined = undefined>(id: number, name: string, fields?: F) {
    const value = await this.#requestText("GET", `${buildPath(id)}/statistics/${pathSegment(name)}`);
    return this.#projectedValue(value, fields, () => (statistic(name, value)));
  }

  public async getBuildCanceledInfo<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    const result = await this.#optionalJson<OperationComment>(
      `${buildPath(id)}/canceledInfo`,
      fields === undefined ? "text,timestamp" : fieldsProjection(fields),
    );
    return this.#projectedValue(
      result,
      fields,
      value => value === null ? null : safeComment(value as OperationComment),
    );
  }

  public async getChange<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `/app/rest/changes/id:${integerId(id, "Change ID")}`,
      { fields: changeSummaryFields },
      raw => safeChange(raw as ChangeSummary),
      fields,

    );
  }

  public async listChangeParents<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `/app/rest/changes/id:${integerId(id, "Change ID")}/parentChanges`,
      { fields: `change(${changeSummaryFields})` },
      raw => ((raw as { change?: ChangeSummary[] }).change ?? []).map(safeChange),
      fields,
    );
  }

  public async replaceAllParameters<F extends string | undefined = undefined>(
    owner: ParameterOwner,
    id: string,
    properties: readonly PlainProperty[],
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    const body = propertiesBody(properties);
    const path = parametersPath(owner, id);
    return this.#projectedJson(
      "PUT",
      path,
      { fields: `property(${propertyFields})` },
      value => ((value as { property?: RawProperty[] }).property ?? []).map(p => safeProperty(p)),
      fields,
      { ...body, ...native },
    );
  }

  public async clearParameters<F extends string | undefined = undefined>(owner: ParameterOwner, id: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", parametersPath(owner, id));
    return this.#projectedAcknowledgement(nativeResponse, fields, { ownerId: id, cleared: true });
  }

  public getParameterPart<F extends string | undefined = undefined>(owner: ParameterOwner, id: string, name: string, part: ParameterPart, fields?: F) {
    return this.#parameterPart("GET", owner, id, name, part, undefined, {}, fields);
  }

  public setParameterPart<F extends string | undefined = undefined>(
    owner: ParameterOwner,
    id: string,
    name: string,
    part: ParameterPart,
    value: string,
    native: Record<string, unknown> = {},
    fields?: F,
  ) {
    plainProperty(name, value);
    return this.#parameterPart("PUT", owner, id, name, part, value, native, fields);
  }

  async #parameterPart<F extends string | undefined>(
    method: "GET" | "PUT",
    owner: ParameterOwner,
    id: string,
    name: string,
    part: ParameterPart,
    value?: string,
    native: Record<string, unknown> = {},
    fields?: F,
  ) {
    const path = `${parametersPath(owner, id)}/${pathSegment(name)}`;
    const metadata = method === "GET"
      ? await this.#requestJson<RawProperty>("GET", path, { fields: "name,inherited,type(rawValue)" })
      : { name };
    if (method === "GET" && isSecretProperty({ ...metadata, value: "" })) {
      return this.#projectedValue(safeProperty(metadata, false), fields, value => value);
    }
    if (part === "value") {
      const response = method === "GET"
        ? await this.#returnedText(`${path}/value`)
        : await this.#requestText(method, `${path}/value`, value);
      return this.#projectedValue(response, fields, () => safeProperty({
        name: name,
        ...(metadata.type === undefined ? {} : { type: metadata.type }),
        ...(response === undefined ? {} : { value: response }),
      }), metadata);
    }
    const type =
      part === "type"
        ? await this.#requestJson<{ rawValue?: string }>(
            method,
            `${path}/type`,
            {},
            method === "PUT" ? { ...(value === undefined ? {} : { rawValue: value }), ...native } : undefined,
          )
        : {
            rawValue: await this.#requestText(method, `${path}/type/rawValue`, value),
          };
    const result = safeProperty({ name: name, type, value: "" });
    return this.#projectedValue(part === "type" ? type : type.rawValue, fields, () => ({ name: result.name, type: result.type, redacted: result.redacted }));
  }

  public async replaceAllSettings<F extends string | undefined = undefined>(
    kind: SettingsCollection,
    id: string,
    input: readonly unknown[] | Record<string, unknown>,
    projection?: F,
  ) {
    const collectionKey = {
      "vcs-root-entries": "vcs-root-entry",
      steps: "step",
      features: "feature",
      triggers: "trigger",
      projectFeatures: "projectFeature",
      "agent-requirements": "agent-requirement",
      "artifact-dependencies": "artifact-dependency",
      "snapshot-dependencies": "snapshot-dependency",
    }[kind];
    const single = Array.isArray(input) && input.length === 1 ? triage.apiInputRecord(input[0], []) : undefined;
    const envelope = Array.isArray(input)
      ? single !== undefined && collectionKey in single ? single : undefined
      : triage.apiInputRecord(input, []);
    const items = envelope === undefined ? settingsItems(kind, id, input as readonly unknown[]) : [];
    const path = `${kind === "projectFeatures" ? projectPath(id) : jobPath(id)}/${kind}`;
    if (kind === "vcs-root-entries") {
      return this.#projectedJson(
        "PUT",
        path,
        { fields: `vcs-root-entry(${entryFields})` },
        value => ((value as { "vcs-root-entry"?: RawVcsEntry[] })["vcs-root-entry"] ?? []).map(safeEntry),
        projection,
        { "vcs-root-entry": items, ...envelope }
      );
    }
    const dependency = kind === "artifact-dependencies" || kind === "snapshot-dependencies";
    const fields = kind === "steps" ? stepFields : dependency ? snapshotFields : extensionFields;
    return this.#projectedJson(
      "PUT",
      path,
      { fields: `${collectionKey}(${fields})` },
      value =>
      (((value as Record<string, RawStep[]>)[collectionKey] ?? []).map(
        (item) =>
          kind === "steps" ? safeStep(item) : dependency ? safeSnapshot(item) : safeExtension(item)
      )),
      projection,
      { [collectionKey]: items, ...envelope }
    );
  }

  public async replaceTemplates<F extends string | undefined = undefined>(
    jobId: string,
    ids: readonly string[],
    optimizeSettings?: boolean,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "PUT",
      `${jobPath(jobId)}/templates`,
      { fields: `buildType(${identityFields})`, ...(optimizeSettings === undefined ? {} : { optimizeSettings: String(optimizeSettings) }) },
      value => ((value as { buildType?: BuildTypeIdentity[] }).buildType ?? []).map(safeIdentity),
      fields,
      { buildType: textIds(ids).map((id) => ({ id })), ...native },
    );
  }

  public async clearTemplates<F extends string | undefined = undefined>(jobId: string, inlineSettings?: boolean, fields?: F) {
    const nativeResponse = await this.#request("DELETE", `${jobPath(jobId)}/templates`, {
      ...(inlineSettings === undefined ? {} : { inlineSettings: String(inlineSettings) }),
    });
    return this.#projectedAcknowledgement(nativeResponse, fields, { jobId: jobId, cleared: true });
  }

  public async listJobBuilds<F extends string | undefined = undefined>(
    jobId: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${jobPath(jobId)}/builds`,
      { locator: "defaultFilter:false,branch:(default:any)", fields: `build(${operationBuildFields})` },
      value => ((value as { build?: OperationBuild[] }).build ?? []).map(safeOperationBuild),
      fields
    );
  }

  public async listProjectPools<F extends string | undefined = undefined>(
    projectId: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${projectPath(projectId)}/agentPools`,
      { fields: "agentPool(id,name)" },
      value => ((value as { agentPool?: AgentPoolSummary[] }).agentPool ?? []).map(safeNamed),
      fields,
    );
  }

  public async assignProjectPool<F extends string | undefined = undefined>(projectId: string, id: number, native: Record<string, unknown> = {}, fields?: F) {
    const nativeResponse = await this.#requestJson<AgentPoolSummary>(
      "POST",
      `${projectPath(projectId)}/agentPools`,
      { fields: "id,name" },
      { id: poolNumber(id), ...native },
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      return safeNamed(
        nativeResponse,
      );
    });
  }

  public async replaceProjectPools<F extends string | undefined = undefined>(
    projectId: string,
    ids: readonly number[],
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    const body = {
      agentPool: textIds(ids.map((id) => String(poolNumber(id)))).map((id) => ({
        id: Number(id),
      })),
    };
    return this.#projectedJson(
      "PUT",
      `${projectPath(projectId)}/agentPools`,
      { fields: "agentPool(id,name)" },
      value => ((value as { agentPool?: AgentPoolSummary[] }).agentPool ?? []).map(safeNamed),
      fields,
      { ...body, ...native },
    );
  }

  public async unassignProjectPool<F extends string | undefined = undefined>(projectId: string, poolId: number, fields?: F) {
    const nativeResponse = await this.#request("DELETE", `${projectPath(projectId)}/agentPools/id:${poolNumber(poolId)}`);
    return this.#projectedAcknowledgement(nativeResponse, fields, { projectId: projectId, poolId, unassigned: true });
  }

  public listProjectBranches<F extends string | undefined = undefined>(
    projectId: string,
    options: TeamCityPageOptions & { fields?: F } = {},
  ) {
    return this.#list(`${projectPath(projectId)}/branches`, ["policy:ALL_BRANCHES"], "branch", "name,default", (item) => {
      const branch = item as { name: string; default?: boolean };
      return {
        name: branch.name,
        ...(branch.default === undefined ? {} : { default: branch.default }),
      };
    }, options);
  }

  public async createProjectJob<F extends string | undefined = undefined>(
    projectId: string,
    id: string,
    name: string | undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "POST",
      `${projectPath(projectId)}/buildTypes`,
      { fields: identityFields },
      value => safeIdentity(value as BuildTypeIdentity),
      fields,
      { id: requiredText(id, "Job ID"), name: name === undefined ? undefined : requiredText(name, "Job name"), ...native },
    );
  }

  public getProjectOrder<F extends string | undefined = undefined>(
    projectId: string,
    kind: "jobs" | "projects",
    field?: string,
    fields?: F
  ) {
    return this.#projectOrder("GET", projectId, kind, undefined, field, {}, fields);
  }

  public setProjectOrder<F extends string | undefined = undefined>(
    projectId: string,
    kind: "jobs" | "projects",
    ids: readonly string[],
    field?: string,
    native: Record<string, unknown> = {},
    fields?: F
  ) {
    return this.#projectOrder("PUT", projectId, kind, textIds(ids), field, native, fields);
  }

  async #projectOrder<F extends string | undefined>(
    method: "GET" | "PUT",
    projectId: string,
    kind: "jobs" | "projects",
    ids?: readonly string[],
    field?: string,
    native: Record<string, unknown> = {},
    fields?: F
  ) {
    const key = kind === "jobs" ? "buildType" : "project";
    const result = await this.#requestJson<Record<string, BuildTypeIdentity[]>>(
      method,
      `${projectPath(projectId)}/order/${kind === "jobs" ? "buildTypes" : "projects"}`,
      { field: field === undefined ? `${key}(id,name${kind === "jobs" ? ",projectId" : ""})` : field },
      ids === undefined ? undefined : { [key]: ids.map((id) => ({ id })), ...native },
    );
    return this.#projectedValue(result, fields, () => (result[key] ?? []).map(safeIdentity));
  }

  public async replacePoolProjects<F extends string | undefined = undefined>(poolId: number, ids: readonly string[], native: Record<string, unknown> = {}, fields?: F) {
    const body = { project: textIds(ids).map((id) => ({ id })) };
    const nativeResponse = await this.#requestJson<{ project?: BuildTypeIdentity[] }>(
      "PUT",
      `${poolPath(poolId)}/projects`,
      { fields: "project(id,name)" },
      { ...body, ...native },
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      const result = nativeResponse;
      return (result.project ?? []).map(safeIdentity);
    });
  }

  public async clearPoolProjects<F extends string | undefined = undefined>(poolId: number, fields?: F) {
    const nativeResponse = await this.#request("DELETE", `${poolPath(poolId)}/projects`);
    return this.#projectedAcknowledgement(nativeResponse, fields, { poolId, cleared: true });
  }

  public async deleteQueuePage<F extends string | undefined = undefined>(
    jobId: string | undefined,
    options: TeamCityPageOptions = {},
    fields?: F,
  ) {
    const contents = await this.#request(
      "DELETE",
      "/app/rest/buildQueue",
      {
      locator: joinLocator(jobId === undefined ? undefined : nestedId("buildType", jobId, "Job ID"), ...pageDimensions(options)),
        ...(fields === undefined ? {} : { fields: fieldsProjection(fields) }),
    });
    return this.#projectedAcknowledgement(contents, fields, { jobId: jobId, pageDeleted: true });
  }

  public async reorderQueue<F extends string | undefined = undefined>(
    ids: readonly number[],
    fields?: F,
    native: Record<string, unknown> = {}
  ) {
    const body = {
      build: textIds(ids.map((id) => integerId(id, "Build ID"))).map((id) => ({
        id: Number(id),
      })),
    };
    const result = await this.#requestJson<{ build?: OperationBuild[] }>(
      "PUT",
      "/app/rest/buildQueue/order",
      {
        fields: fields === undefined ? `build(${operationBuildFields})` : fieldsProjection(fields),
      },
      { ...body, ...native },
    );
    return this.#projectedValue(
      result,
      fields,
      (value) =>
        ((value as { build?: OperationBuild[] }).build ?? []).map(safeOperationBuild),

    );
  }

  public async setQueuePaused<F extends string | undefined = undefined>(paused: boolean, reason?: string, native: Record<string, unknown> = {}, fields?: F) {
    if (typeof paused !== "boolean") throw new Error("Paused must be a boolean.");
    const nativeResponse = await this.#request(
      "PUT",
      "/app/rest/buildQueue/pausedState",
      {},
      { paused, ...(reason === undefined ? {} : { reason: plainProperty("reason", reason).value }), ...native },
    );
    return this.#projectedAcknowledgement(nativeResponse, fields, { paused, updated: true });
  }

  public async getQueueApproval<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${buildPath(id, "queue")}/approvalInfo`,
      {
        fields: approvalFields,
      },
      value => safeApproval(value as ApprovalSummary),
      fields,
    );
  }

  public async approveQueuedBuild<F extends string | undefined = undefined>(
    id: number,
    fields?: F,
    approveAll?: string,
  ) {
    return this.#projectedValue(
      await this.#requestJson<ApprovalSummary>("POST", `${buildPath(id, "queue")}/approve`, {
        fields: fields === undefined ? approvalFields : fieldsProjection(fields),
        ...(approveAll === undefined ? {} : { approveAll }),
      }),
      fields,
      (value) => safeApproval(value as ApprovalSummary),
    );
  }

  public async deleteQueuedBuild<F extends string | undefined = undefined>(id: number, fields?: F) {
    const nativeResponse = await this.#request("DELETE", buildPath(id, "queue"));
    return this.#projectedAcknowledgement(nativeResponse, fields, { buildId: id, deleted: true });
  }

  public async getAgentType<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `/app/rest/agentTypes/id:${integerId(id, "Agent type ID")}`,
      { fields: "id,name,isCloud" },
      raw => {
        const value = raw as AgentPoolSummary & { isCloud?: boolean };
        return {
          ...safeNamed(value),
          ...(value.isCloud === undefined ? {} : { isCloud: value.isCloud }),
        };
      },
      fields,

    );
  }

  public async getBuildBatchStatus<F extends string | undefined = undefined>(ids: readonly number[], fields?: F) {
    const status = await this.#requestText("GET", `/app/rest/builds/aggregated/${triage.buildUnion(ids)}/status`);
    return this.#projectedValue(status, fields, () => ({ status }));
  }

  public async getBuildBatch<F extends string | undefined = undefined>(
    ids: readonly number[],
    fields?: F
  ) {
    const value = await this.#requestJson<{ build?: unknown[] }>(
      "GET",
      `/app/rest/builds/multiple/${triage.buildUnion(ids)}`,
      {
        fields:
          fields === undefined
            ? `count,nextHref,build(${triage.evidenceBuildFields})`
            : fieldsProjection(fields),
      },
    );
    return this.#projectedValue(
      value,
      fields,
      (raw) =>
        ((raw as { build?: unknown[] }).build ?? []).map(triage.safeEvidenceBuild),

    );
  }

  public async cancelBuildBatch<F extends string | undefined = undefined>(
    ids: readonly number[],
    comment: string | undefined,
    fields?: F,
    requeue?: boolean,
    native: Record<string, unknown> = {},
  ) {
    return this.#buildBatch("POST", ids, "", { ...(comment === undefined ? {} : { comment: triage.inputText(comment, "Comment") }),
      ...(requeue === undefined ? {} : { readdIntoQueue: requeue }), ...native },
      "application/json",
      fields,
    );
  }

  public async deleteBuildBatch<F extends string | undefined = undefined>(
    ids: readonly number[],
    fields?: F
  ) {
    return this.#buildBatch("DELETE", ids, "", undefined, "application/json", fields);
  }

  public async setBuildBatchComment<F extends string | undefined = undefined>(
    ids: readonly number[],
    comment: string | undefined,
    fields?: F,
  ) {
    return this.#buildBatch(
      "PUT",
      ids,
      "/comment",
      comment === undefined ? undefined : triage.inputText(comment, "Comment"),
      "text/plain",
      fields,
    );
  }

  public async clearBuildBatchComment<F extends string | undefined = undefined>(
    ids: readonly number[],
    fields?: F,
  ) {
    return this.#buildBatch("DELETE", ids, "/comment", undefined, "application/json", fields);
  }

  public async pinBuildBatch<F extends string | undefined = undefined>(
    ids: readonly number[],
    status: boolean | undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#buildBatch("PUT", ids, "/pinInfo", { ...this.#statusBody(status), ...native },
      "application/json",
      fields,
    );
  }

  public async tagBuildBatch<F extends string | undefined = undefined>(
    ids: readonly number[],
    tags: readonly string[],
    remove = false,
    fields?: F,
    native: Record<string, unknown> = {},

  ) {
    return this.#buildBatch(remove ? "DELETE" : "POST", ids, "/tags", { ...publicTags(tags), ...native },
      "application/json",
      fields,
    );
  }

  async #buildBatch<F extends string | undefined = undefined>(
    method: HttpMethod,
    ids: readonly number[],
    suffix: string,
    body?: unknown,
    mediaType = "application/json",
    fields?: F,
  ) {
    const contents = await this.#request(
      method,
      `/app/rest/builds/multiple/${triage.buildUnion(ids)}${suffix}`,
      { fields: fields === undefined ? triage.multipleFields : fieldsProjection(fields) },
      body,
      mediaType,
      { accept: "application/json" },
    );
    const value = decodeJson(contents);
    const raw = value as { count?: number; errorCount?: number } | null;
    return this.#projectedMutation(
      value,
      fields,
      triage.safeMultiple,
      Number(raw?.errorCount) > 0 ? {
        code: "batch.partial", message: `${raw?.errorCount} of ${raw?.count} builds failed; see items.`,
      } : undefined,

    );
  }

  public async getArtifactDependencyChanges<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${buildPath(id)}/artifactDependencyChanges`,
      {
        fields: `count,buildChange(nextBuild(${triage.evidenceBuildFields}),prevBuild(${triage.evidenceBuildFields}))`,
      },
      raw => {
        const value = raw as { buildChange?: unknown[] };
    return (value.buildChange ?? []).map((item) => {
      const change = triage.object(item);
      return {
        ...(change.nextBuild === undefined
          ? {}
          : { nextBuild: triage.safeEvidenceBuild(change.nextBuild) }),
        ...(change.prevBuild === undefined
          ? {}
          : { prevBuild: triage.safeEvidenceBuild(change.prevBuild) }),
      };
    });
      },
      fields,
    );
  }

  public async resetBuildFinishCache<F extends string | undefined = undefined>(id: number, fields?: F) {
    const nativeResponse = await this.#request("DELETE", `${buildPath(id)}/caches/finishProperties`);
    return this.#projectedAcknowledgement(nativeResponse, fields, { buildId: id, cacheReset: true });
  }

  public async finishBuild<F extends string | undefined = undefined>(id: number, timestamp?: string, fields?: F) {
    const body = timestamp === undefined ? undefined : triage.inputText(timestamp, "Finish time");
    const acceptedFinishTime = await this.#requestText("PUT", `${buildPath(id)}/${timestamp === undefined ? "finish" : "finishDate"}`, body);
    return this.#projectedValue(acceptedFinishTime, fields, () => ({ buildId: id, acceptedFinishTime }));
  }

  public async appendBuildLog<F extends string | undefined = undefined>(
    id: number,
    message: string | undefined,
    fields?: F,
  ) {
    const body = message === undefined ? undefined : triage.inputText(message, "Log message");
    const contents = fields === undefined
      ? await this.#requestText("POST", `${buildPath(id)}/log`, body)
      : await this.#request("POST", `${buildPath(id)}/log`, { fields: fieldsProjection(fields) }, body, "text/plain");
    return this.#projectedAcknowledgement(contents, fields, { buildId: id, appended: true });
  }

  public async listBuildOccurrences<F extends string | undefined = undefined>(
    id: number,
    kind: "test" | "problem",
    projection?: F,
  ) {
    const key = kind + "Occurrence";
    const fields = kind === "test" ? triage.testOccurrenceFields : triage.problemOccurrenceFields;
    return this.#projectedJson(
      "GET",
      `${buildPath(id)}/${key}s`,
      { fields: `count,${key}(${fields})` },
      raw => {
        const value = raw as Record<string, unknown>;
    return triage.array(value[key]).map((item) => triage.safeOccurrence(item, kind));
      },
      projection,
    );
  }

  public async addBuildProblem<F extends string | undefined = undefined>(
    id: number,
    description: string | undefined,
    fields?: F,
  ) {
    const body = description === undefined ? undefined : triage.inputText(description, "Description");
    return this.#projectedValue(
      await this.#textJson(
        "POST",
        `${buildPath(id)}/problemOccurrences`,
        {
          fields: fields === undefined ? triage.problemOccurrenceFields : fieldsProjection(fields),
        },
        body,
      ),
      fields,
      (value) => triage.safeOccurrence(value, "problem"),
    );
  }

  public async getBuildRelatedIssues<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${buildPath(id)}/relatedIssues`,
      { fields: "count,issueUsage(issue(id))" },
      value =>
        ((value as { issueUsage?: unknown[] }).issueUsage ?? []).flatMap(
          item => {
      const issue = triage.object(item).issue;
      return issue === undefined ? [] : [triage.safeScalars(issue, ["id"])];
          }
        ),
      fields,
    );
  }

  public async startAgentlessBuild<F extends string | undefined = undefined>(
    id: number,
    requestor: string | undefined,
    fields?: F,
  ) {
    return this.#projectedValue(
      await this.#textJson(
        "PUT",
        `${buildPath(id)}/runningData`,
        { fields: fields === undefined ? triage.evidenceBuildFields : fieldsProjection(fields) },
        requestor === undefined ? undefined : triage.inputText(requestor, "Requestor"),
      ),
      fields,
      triage.safeEvidenceBuild,
    );
  }

  public async setBuildStatus<F extends string | undefined = undefined>(
    id: number,
    status: string,
    comment: string | undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    const body = {
      status: plainProperty("status", status).value,
      ...(comment === undefined ? {} : { comment: triage.inputText(comment, "Comment") }),
    };
    const value = await this.#requestJson<{ build?: unknown; errors?: { item?: unknown[] } }>(
      "POST",
      `${buildPath(id)}/status`,
      {
        fields:
          fields === undefined
            ? `build(${triage.evidenceBuildFields}),errors(item)`
            : fieldsProjection(fields),
      },
      { ...body, ...native },
    );
    return this.#projectedMutation(
      value,
      fields,
      () => {
        const errorCount = triage.array(value.errors?.item).length;
        if (value.build === undefined && errorCount === 0)
          throw new Error("Missing build status result; success is unknown.");
        return {
          ...(value.build === undefined ? {} : { build: triage.safeEvidenceBuild(value.build) }),
          errorCount,
          partialFailure: errorCount > 0,
        };
      },
      (value?.errors?.item?.length ?? 0) > 0 ? {
        code: "build.statusPartial", message: "The status changed with errors; see errorCount.",
      } : undefined,
    );
  }

  public async getBuildVcsLabels<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `${buildPath(id)}/vcsLabels`,
      { fields: triage.labelFields },
      value => this.#vcsLabels(value),
      fields,

    );
  }

  public async addBuildVcsLabel<F extends string | undefined = undefined>(
    id: number,
    label: string | undefined,
    rootInstance: string | undefined,
    fields?: F,
  ) {
    const value = await this.#textJson(
      "POST",
      `${buildPath(id)}/vcsLabels`,
      {
        fields: fields === undefined ? triage.labelFields : fieldsProjection(fields),
        ...(rootInstance === undefined ? {} : { locator: idPath(rootInstance, "Root instance ID") }),
      },
      label === undefined ? undefined : triage.inputText(label, "Label"),
    );
    const failed = triage.array((value as { vcsLabel?: unknown[] } | null)?.vcsLabel)
      .some(
        item => (item as { status?: unknown } | null)?.status === "FAILED",
      );
    return this.#projectedMutation(
      value,
      fields,
      raw => this.#vcsLabels(raw),
      failed ? { code: "labels.partial", message: "Some VCS labels failed; see their status." } : undefined,

    );
  }

  #vcsLabels(value: unknown) {
    return triage
      .array(triage.object(value).vcsLabel)
      .map((item) => triage.safeScalars(item, ["text", "status", "buildId"]));
  }

  async #textJson(method: HttpMethod, path: string, query: Record<string, string>, body: string | undefined) {
    return decodeJson(
      await this.#request(method, path, query, body, "text/plain", { accept: "application/json" }),
    );
  }

  public async getChangeDuplicates<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `/app/rest/changes/id:${integerId(id, "Change ID")}/duplicates`,
      { fields: `change(${changeSummaryFields})` },
      raw => ((raw as { change?: ChangeSummary[] }).change ?? []).map(safeChange),
      fields,
    );
  }

  public async getChangeFirstBuilds<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `/app/rest/changes/id:${integerId(id, "Change ID")}/firstBuilds`,
      { fields: `build(${triage.evidenceBuildFields})` },
      raw => ((raw as { build?: unknown[] }).build ?? []).map(triage.safeEvidenceBuild),
      fields,
    );
  }

  public async getChangeIssues<F extends string | undefined = undefined>(id: number, fields?: F) {
    const nativeResponse = await this.#requestJson<{ issue?: unknown[] }>(
      "GET",
      `/app/rest/changes/id:${integerId(id, "Change ID")}/issues`,
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      const value = nativeResponse;
      return (value.issue ?? []).map((item) => triage.safeScalars(item, ["id"]));
    });
  }

  public async getChangeParentRevisions<F extends string | undefined = undefined>(id: number, fields?: F) {
    const nativeResponse = await this.#requestJson<{ item?: unknown[] }>(
      "GET",
      `/app/rest/changes/id:${integerId(id, "Change ID")}/parentRevisions`,
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      const value = nativeResponse;
      return value.item ?? [];
    });
  }

  public async getChangeRootInstance<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `/app/rest/changes/id:${integerId(id, "Change ID")}/vcsRootInstance`,
      { fields: "id,name,vcs-root-id" },
      raw => triage.safeScalars(raw, ["id", "name", "vcs-root-id"]),
      fields,

    );
  }

  public async getChangeField<F extends string | undefined = undefined>(id: number, field: string, fields?: F) {
    requiredText(field, "Field name");
    const value = await this.#requestText("GET", `/app/rest/changes/id:${integerId(id, "Change ID")}/${pathSegment(field)}`);
    return this.#projectedValue(value, fields, () => ({ changeId: id, field, value }));
  }

  public listInvestigations<F extends string | undefined = undefined>(
    page: TeamCityPageOptions & { fields?: F } = {},
  ) {
    return this.#list("/app/rest/investigations", [], "investigation", triage.investigationFields,
      (item) => triage.safeAssignment(item, true), page);
  }

  public async createInvestigation<F extends string | undefined = undefined>(
    input: unknown,
    replace = false,
    fields?: F,
  ) {
    const { body } = triage.investigationBody(input);
    return this.#projectedJson(
      replace ? "PUT" : "POST",
      "/app/rest/investigations" + (replace ? "/" + triage.investigationLocator(body) : ""),
      { fields: triage.investigationFields },
      value => triage.safeAssignment(value, true),
      fields,
      body,
    );
  }

  public async createInvestigations<F extends string | undefined = undefined>(
    inputs: readonly unknown[],
    fields?: F,
  ) {
    const body = triage.collectionEnvelope(inputs, "investigation") ??
      { investigation: triage.typedItems(inputs).map(item => triage.investigationBody(item).body) };
    return this.#projectedJson(
      "POST",
      "/app/rest/investigations/multiple",
      { fields: `count,investigation(${triage.investigationFields})` },
      value =>
        ((value as { investigation?: unknown[] }).investigation ?? []).map(
          item => triage.safeAssignment(item, true),
        ),
      fields,
      body
    );
  }

  public async getInvestigation<F extends string | undefined = undefined>(
    target: unknown,
    fields?: F
  ) {
    const { locator } = triage.investigationTarget(target);
    return this.#projectedJson(
      "GET",
      "/app/rest/investigations/" + locator,
      { fields: triage.investigationFields },
      value => triage.safeAssignment(value, true),
      fields,
    );
  }

  public async deleteInvestigation<F extends string | undefined = undefined>(target: unknown, fields?: F) {
    const nativeResponse = await this.#request("DELETE", "/app/rest/investigations/" + triage.investigationTarget(target).locator);
    return this.#projectedAcknowledgement(nativeResponse, fields, { deleted: true });
  }

  public listMutes<F extends string | undefined = undefined>(
    page: TeamCityPageOptions & { fields?: F } = {}
  ) {
    return this.#list("/app/rest/mutes", [], "mute", triage.muteFields,
      (item) => triage.safeAssignment(item, false), page);
  }

  public async createMute<F extends string | undefined = undefined>(
    input: unknown,
    fields?: F
  ) {
    return this.#projectedJson(
      "POST",
      "/app/rest/mutes",
      { fields: triage.muteFields },
      value => triage.safeAssignment(value, false),
      fields,
      triage.muteBody(input),
    );
  }

  public async createMutes<F extends string | undefined = undefined>(
    inputs: readonly unknown[],
    fields?: F
  ) {
    const body = triage.collectionEnvelope(inputs, "mute") ??
      { mute: triage.typedItems(inputs).map(triage.muteBody) };
    return this.#projectedJson(
      "POST",
      "/app/rest/mutes/multiple",
      { fields: `count,mute(${triage.muteFields})` },
      value => ((value as { mute?: unknown[] }).mute ?? []).map(item => triage.safeAssignment(item, false)),
      fields,
      body
    );
  }

  public async getMute<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `/app/rest/mutes/id:${integerId(id, "Mute ID")}`,
      { fields: triage.muteFields },
      value => triage.safeAssignment(value, false),
      fields,
    );
  }

  public async deleteMute<F extends string | undefined = undefined>(id: number, comment?: string, fields?: F) {
    const body = comment === undefined ? undefined : triage.inputText(comment, "Comment");
    const nativeResponse = await this.#requestText("DELETE", `/app/rest/mutes/id:${integerId(id, "Mute ID")}`, body);
    return this.#projectedValue(nativeResponse, fields, () => ({ muteId: id, deleted: true }));
  }

  public listTriageEntities<F extends string | undefined = undefined>(
    kind: "test" | "problem",
    page: TeamCityPageOptions & { fields?: F } = {},
  ) {
    return this.#list(`/app/rest/${kind}s`, [], kind,
      kind === "test" ? "id,name" : triage.problemFields,
      (item) => triage.safeEntity(item, kind), page);
  }

  public async getTriageEntity<F extends string | undefined = undefined>(
    kind: "test" | "problem",
    id: string,
    projection?: F,
  ) {
    const fields = kind === "test" ? "id,name" : triage.problemFields;
    return this.#projectedJson(
      "GET",
      `/app/rest/${kind}s/${idPath(id, "ID")}`,
      { fields },
      raw => triage.safeEntity(raw, kind),
      projection,
    );
  }

  public async getTriageOccurrence<F extends string | undefined = undefined>(
    kind: "test" | "problem",
    id: string,
    buildId: number,
    projection?: F,
  ) {
    const locator = joinLocator(
      nestedId("build", integerId(buildId, "Build ID"), "Build ID"),
      nestedId(kind, id, "Target ID"),
    );
    const fields = kind === "test" ? triage.testOccurrenceFields : triage.problemOccurrenceFields;
    return this.#projectedJson(
      "GET",
      `/app/rest/${kind}Occurrences/${locator}`,
      { fields },
      raw => triage.safeOccurrence(raw, kind),
      projection,
    );
  }

  public async listBuildRuntimeParameters<F extends string | undefined = undefined>(
    id: number,
    kind: "output-parameters" | "resulting-properties",
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      `${buildPath(id)}/${kind}`,
      { fields: `count,property(${propertyFields})` },
      raw => ((raw as { property?: RawProperty[] }).property ?? []).map((item) => safeProperty(item)), fields,

    );
  }

  public async checkBuildRuntimeParameter<F extends string | undefined = undefined>(
    id: number,
    kind: "output-parameters" | "resulting-properties",
    name: string, fields?: F
  ) {
    const nativeResponse = await this.#requestText(
      "GET",
      `${buildPath(id)}/${kind}/${pathSegment(name)}`,
      undefined,
      { discard: fields === undefined },
    );
    return this.#projectedValue(nativeResponse, fields, () => ({ name, exists: true }), { name });
  }

  public async listChangeAttributeNames<F extends string | undefined = undefined>(
    id: number,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      `/app/rest/changes/id:${integerId(id, "Change ID")}/attributes`,
      { fields: "count,entry(name)" },
      raw =>
        ((raw as { entry?: unknown[] }).entry ?? []).map((item) => triage.safeScalars(item, ["name"]).name),
      fields,
    );
  }

  public listAccountUsers<F extends string | undefined = undefined>(
    page: TeamCityPageOptions & { fields?: F } = {},
  ) {
    return this.#list("/app/rest/users", [], "user", admin.accountUserFields,
      admin.safeAccountUser, page);
  }

  public async getAccountUser<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      admin.accountPath("users", id),
      { fields: admin.accountUserFields },
      admin.safeAccountUser,
      fields,
    );
  }

  public async createAccountUser<F extends string | undefined = undefined>(
    username: string,
    name?: string,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    const body = {
      username: triage.inputText(username, "Username"),
      ...(name === undefined ? {} : { name: triage.inputText(name, "Name") }),
    };
    return this.#projectedJson(
      "POST",
      "/app/rest/users",
      { fields: admin.accountUserFields },
      admin.safeAccountUser,
      fields,
      { ...body, ...native },
    );
  }

  public async updateAccountUser<F extends string | undefined = undefined>(
    id: string,
    input: Record<string, unknown>,
    fields?: F,
  ) {
    triage.apiInputRecord(input, []);
    const body = {
      ...input,
      ...(input.username === undefined
        ? {}
        : { username: triage.inputText(input.username, "Username") }),
      ...(input.name === undefined ? {} : { name: triage.inputText(input.name, "Name") }),
    };
    return this.#projectedJson(
      "PUT",
      admin.accountPath("users", id),
      { fields: admin.accountUserFields },
      admin.safeAccountUser,
      fields,
      body,
    );
  }

  public async deleteAccountUser<F extends string | undefined = undefined>(id: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", admin.accountPath("users", id));
    return this.#projectedAcknowledgement(nativeResponse, fields, { userId: id, deleted: true });
  }

  public async forgetRememberedSessions<F extends string | undefined = undefined>(id: string, fields?: F) {
    const nativeResponse = await this.#requestText("DELETE", admin.accountPath("users", id) + "/debug/rememberMe");
    return this.#projectedValue(nativeResponse, fields, () => ({ userId: id, rememberedLoginsCleared: true }));
  }

  public async terminateAccountSessions<F extends string | undefined = undefined>(id: string, fields?: F) {
    const nativeResponse = await this.#request("POST", admin.accountPath("users", id) + "/logout");
    return this.#projectedAcknowledgement(nativeResponse, fields, { userId: id, sessionsTerminated: true });
  }

  public async listAccountGroups<F extends string | undefined = undefined>(
    kind: admin.AccountKind,
    id: string,
    fields?: F,
  ) {
    const suffix = kind === "users" ? "/groups" : "/parent-groups";
    return this.#projectedJson(
      "GET",
      admin.accountPath(kind, id) + suffix,
      { fields: `count,group(${admin.groupFields})` },
      raw => {
        const value = raw as { group?: unknown[] };
        return (value.group ?? []).map(admin.safeGroup);
      },
      fields,
    );
  }

  public async replaceAccountGroups<F extends string | undefined = undefined>(
    kind: admin.AccountKind,
    id: string,
    keys: readonly string[],
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    const body = admin.groupKeys(keys);
    return this.#projectedJson(
      "PUT",
      admin.accountPath(kind, id) + (kind === "users" ? "/groups" : "/parent-groups"),
      { fields: `count,group(${admin.groupFields})` },
      raw => {
        const value = raw as { group?: unknown[] };
        return (value.group ?? []).map(admin.safeGroup);
      },
      fields,
      { ...body, ...native },
    );
  }

  public async getAccountUserGroup<F extends string | undefined = undefined>(
    id: string,
    key: string,
    fields?: F,
  ) {
    const suffix = "/" + admin.groupLocator(key);
    return this.#projectedJson(
      "GET",
      admin.accountPath("users", id) + "/groups" + suffix,
      { fields: admin.groupFields },
      admin.safeGroup,
      fields,
    );
  }

  public async removeAccountUserGroup<F extends string | undefined = undefined>(
    id: string,
    key: string,
    fields?: F,
  ) {
    const suffix = "/" + admin.groupLocator(key);
    const contents = await this.#request(
      "DELETE",
      admin.accountPath("users", id) + "/groups" + suffix,
      fields === undefined ? {} : { fields: fieldsProjection(fields) },
    );
    return this.#projectedAcknowledgement(contents, fields, { userId: id, group: key, removed: true });
  }

  public async listAccountPermissions<F extends string | undefined = undefined>(
    id: string,
    project?: string,
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      admin.accountPath("users", id) + "/permissions",
      {
        ...(project === undefined ? {} : { locator: nestedId("project", project, "Project ID") }),
        fields: "count,permissionAssignment(permission(id),project(id),isGlobalScope)",
      },
      raw => {
        const value = raw as { permissionAssignment?: unknown[] };
        return (value.permissionAssignment ?? []).map(
          (item) => {
            const raw = triage.object(item);
            return {
              ...triage.safeScalars(raw, ["isGlobalScope"]),
              ...(raw.permission === undefined
                ? {}
                : { permission: triage.safeScalars(raw.permission, ["id"]) }),
              ...(raw.project === undefined ? {} : { project: triage.safeScalars(raw.project, ["id"]) }),
            };
          }
        );
      },
      fields,
    );
  }

  public async listAccountPropertyNames<F extends string | undefined = undefined>(
    kind: admin.AccountKind,
    id: string,
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      admin.accountPath(kind, id) + "/properties",
      { fields: "count,property(name)" },
      raw => {
        const value = raw as { property?: unknown[] };
        return (value.property ?? []).map((item) => triage.safeScalars(item, ["name"]).name);
      },
      fields,
    );
  }

  public async checkAccountProperty<F extends string | undefined = undefined>(kind: admin.AccountKind, id: string, name: string, fields?: F) {
    const nativeResponse = await this.#requestText(
      "GET",
      admin.accountPath(kind, id) + "/properties/" + pathSegment(name),
      undefined,
      { discard: fields === undefined },
    );
    return this.#projectedValue(nativeResponse, fields, () => ({ name, exists: true }), { name });
  }

  public async setAccountProperty<F extends string | undefined = undefined>(
    kind: admin.AccountKind,
    id: string,
    name: string,
    value: string, fields?: F
  ) {
    const property = plainProperty(name, value);
    const nativeResponse = await this.#requestText(
      "PUT",
      admin.accountPath(kind, id) + "/properties/" + pathSegment(property.name),
      property.value,
      { discard: fields === undefined },
    );
    return this.#projectedValue(nativeResponse, fields, () => ({ name: property.name, updated: true }), { name });
  }

  public async deleteAccountProperty<F extends string | undefined = undefined>(kind: admin.AccountKind, id: string, name: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", admin.accountPath(kind, id) + "/properties/" + pathSegment(name));
    return this.#projectedAcknowledgement(nativeResponse, fields, { name, deleted: true });
  }

  public async listAccountRoles<F extends string | undefined = undefined>(kind: admin.AccountKind, id: string, fields?: F) {
    const nativeResponse = await this.#requestJson<{ role?: unknown[] }>("GET", admin.accountPath(kind, id) + "/roles");
    return this.#projectedValue(nativeResponse, fields, () => {
      const value = nativeResponse;
      return (value.role ?? []).map(admin.safeRole);
    });
  }

  public async addAccountRole<F extends string | undefined = undefined>(kind: admin.AccountKind, id: string, input: admin.RoleInput, native: Record<string, unknown> = {}, fields?: F) {
    const nativeResponse = await this.#requestJson(
      "POST",
      admin.accountPath(kind, id) + "/roles",
      {},
      { ...admin.roleBody(input), ...native },
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      return admin.safeRole(
        nativeResponse,
      );
    });
  }

  public async replaceAccountRoles<F extends string | undefined = undefined>(
    kind: admin.AccountKind,
    id: string,
    inputs: readonly unknown[], fields?: F
  ) {
    const nativeResponse = await this.#requestJson<{ role?: unknown[] }>(
      "PUT",
      admin.accountPath(kind, id) + "/roles",
      {},
      admin.roleBodies(inputs),
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      const value = nativeResponse;
      return (value.role ?? []).map(admin.safeRole);
    });
  }

  public async getAccountRole<F extends string | undefined = undefined>(kind: admin.AccountKind, id: string, input: admin.RoleInput, fields?: F) {
    const nativeResponse = await this.#requestJson("GET", admin.accountPath(kind, id) + "/roles" + admin.roleSuffix(input).suffix);
    return this.#projectedValue(nativeResponse, fields, () => {
      return admin.safeRole(
        nativeResponse,
      );
    });
  }

  public async grantAccountRole<F extends string | undefined = undefined>(kind: admin.AccountKind, id: string, input: admin.RoleInput, fields?: F) {
    const nativeResponse = await this.#requestJson(
      kind === "users" ? "PUT" : "POST",
      admin.accountPath(kind, id) + "/roles" + admin.roleSuffix(input).suffix,
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      return admin.safeRole(
        nativeResponse,
      );
    });
  }

  public async revokeAccountRole<F extends string | undefined = undefined>(kind: admin.AccountKind, id: string, input: admin.RoleInput, fields?: F) {
    const { role, suffix } = admin.roleSuffix(input);
    const nativeResponse = await this.#request("DELETE", admin.accountPath(kind, id) + "/roles" + suffix);
    return this.#projectedAcknowledgement(nativeResponse, fields, { ...role, revoked: true });
  }

  public async listCurrentUserTokens<F extends string | undefined = undefined>(
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/users/current/tokens",
      { fields: `count,token(${admin.tokenFields})` },
      raw => {
        const value = raw as { token?: unknown[] };
        return (value.token ?? []).map(admin.safeToken);
      },
      fields
    );
  }

  public async createCurrentUserToken<F extends string | undefined = undefined>(
    input: admin.TokenCreationOptions,
    secrets: ScopedSecrets,
    fields?: F,
  ) {
    secrets = this.#rememberSecrets(secrets);
    const body = admin.tokenBody(input);
    const key = admin.issuedTokenKey(input.alias);
    if ((await admin.readIssuedToken(secrets, input.alias)) !== undefined)
      throw new Error("Issued-token alias already exists; no HTTP was attempted.");
    const value = await this.#requestJson<unknown>(
      "POST",
      "/app/rest/users/current/tokens",
      { fields: fields === undefined ? admin.tokenFields + ",value" : fieldsProjection(fields) },
      body,
    );
    const raw = fields === undefined ? triage.object(value)
      : value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
    if (fields !== undefined && (typeof raw.value !== "string" || !raw.value.trim()))
      return this.#projectedValue(
        value,
        fields,
        () => ({ ...admin.safeToken(raw), alias: input.alias, stored: false }),
      );
    if ((fields === undefined && raw.name !== body.name) || typeof raw.value !== "string" || !raw.value.trim())
      throw new Error(
        "Token may have been created, but its one-time result was invalid; inspect/revoke the named remote token.",
      );
    const metadata = admin.safeToken(raw);
    this.#knownSecrets.add(raw.value);
    try {
      await secrets.set(key, JSON.stringify({ name: body.name, value: raw.value }));
    } catch (cause) {
      throw new Error(
        "Remote token was created but secure persistence failed; revoke the named remote token. No retry was made.",
        { cause: diagnosticCause(cause, [raw.value]) },
      );
    }
    return this.#projectedValue(value, fields, () => ({ ...metadata, alias: input.alias, stored: true }));
  }

  public async deleteCurrentUserToken<F extends string | undefined = undefined>(name: string, secrets: ScopedSecrets, alias?: string, fields?: F) {
    secrets = this.#rememberSecrets(secrets);
    const tokenName = requiredText(name, "Token name");
    if (alias !== undefined) {
      const contents = await admin.readIssuedToken(secrets, alias);
      if (contents === undefined || admin.issuedTokenName(contents) !== tokenName)
        throw new Error(
          "Issued-token alias does not match the named remote token; no HTTP was attempted.",
        );
    }
    const nativeResponse = await this.#request("DELETE", "/app/rest/users/current/tokens/" + pathSegment(tokenName));
    if (alias !== undefined) {
      try {
        await secrets.delete(admin.issuedTokenKey(alias));
      } catch (cause) {
        throw new Error(
          "Remote token was revoked but local secure-record cleanup failed; forget the alias explicitly.",
          { cause: diagnosticCause(cause) },
        );
      }
    }
    return this.#projectedAcknowledgement(nativeResponse, fields, { name: tokenName, revoked: true });
  }

  public async getAccountUserField<F extends string | undefined = undefined>(id: string, field: string, fields?: F) {
    requiredText(field, "Field name");
    const value = await this.#requestText("GET", admin.accountPath("users", id) + "/" + pathSegment(field));
    return this.#projectedValue(value, fields, () => ({ userId: id, field, value }));
  }

  public async setAccountUserField<F extends string | undefined = undefined>(id: string, field: string, value: string, fields?: F) {
    plainProperty(field, "");
    const nativeResponse = await this.#requestText(
      "PUT",
      admin.accountPath("users", id) + "/" + pathSegment(field),
      triage.inputText(value, field),
      { discard: fields === undefined },
    );
    return this.#projectedValue(nativeResponse, fields, () => ({ userId: id, field, updated: true }));
  }

  public async clearAccountUserField<F extends string | undefined = undefined>(id: string, field: string, fields?: F) {
    plainProperty(field, "");
    const nativeResponse = await this.#request("DELETE", admin.accountPath("users", id) + "/" + pathSegment(field));
    return this.#projectedAcknowledgement(nativeResponse, fields, { userId: id, field, cleared: true });
  }

  public async listAccountGroupsAll<F extends string | undefined = undefined>(
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/userGroups",
      { fields: `count,group(${admin.groupFields})` },
      raw => {
        const value = raw as { group?: unknown[] };
        return (value.group ?? []).map(admin.safeGroup);
      },
      fields,
    );
  }

  public async createAccountGroup<F extends string | undefined = undefined>(
    key: string,
    name: string | undefined,
    description?: string,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    const body = {
      key: triage.inputText(key, "Group key"),
      name: name === undefined ? undefined : triage.inputText(name, "Name"),
      ...(description === undefined
        ? {}
        : { description: triage.inputText(description, "Description") }),
    };
    return this.#projectedJson(
      "POST",
      "/app/rest/userGroups",
      { fields: admin.groupFields },
      admin.safeGroup,
      fields,
      { ...body, ...native },
    );
  }

  public async getAccountGroup<F extends string | undefined = undefined>(
    key: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      admin.accountPath("groups", key),
      { fields: admin.groupFields },
      admin.safeGroup,
      fields,
    );
  }

  public async deleteAccountGroup<F extends string | undefined = undefined>(key: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", admin.accountPath("groups", key));
    return this.#projectedAcknowledgement(nativeResponse, fields, { group: key, deleted: true });
  }

  public async listServerNodes<F extends string | undefined = undefined>(
    role?: string,
    state?: string,
    fields?: F,
  ) {
    const locator = joinLocator(
      role === undefined
        ? undefined
        : "role:" + locatorValue(role, "Node role"),
      state === undefined
        ? undefined
        : "state:" + locatorValue(state, "Node state"),
    );
    return this.#projectedJson(
      "GET",
      "/app/rest/server/nodes",
      {
      ...(locator ? { locator } : {}),
      fields: `count,node(${admin.nodeFields})`,
      },
      value => ((value as { node?: unknown[] }).node ?? []).map(admin.safeNode),
      fields
    );
  }

  public async getServerNode<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/server/nodes/" + idPath(id, "Node ID"),
      { fields: admin.nodeFields },
      admin.safeNode,
      fields,
    );
  }

  public async getNodeResponsibilities<F extends string | undefined = undefined>(
    id: string,
    kind: "enabled" | "disabled" | "effective",
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/server/nodes/" + idPath(id, "Node ID") + "/" + kind + "Responsibilities",
      { fields: admin.responsibilityFields },
      admin.responsibilities,
      fields,
    );
  }

  public async setNodeResponsibility<F extends string | undefined = undefined>(id: string, name: string, enabled: string, fields?: F) {
    plainProperty(name, "");
    const nativeResponse = await this.#textJson(
      "PUT",
      "/app/rest/server/nodes/" + idPath(id, "Node ID") + "/enabledResponsibilities/" + pathSegment(name),
      {},
      booleanText(enabled),
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      return admin.responsibilities(
        nativeResponse,
      );
    });
  }

  public async getApiVersion<F extends string | undefined = undefined>(fields?: F) {
    const nativeResponse = await this.#requestText("GET", "/app/rest/apiVersion");
    return this.#projectedValue(nativeResponse, fields, () => {
      return {
        version: nativeResponse,
      };
    });
  }

  public async listCloud<F extends string | undefined = undefined>(
    kind: infrastructure.CloudKind,
    page: TeamCityPageOptions & { fields?: F } = {},
    project?: string,
    profile?: string,
  ) {
    return this.#list(
      "/app/rest/cloud/" + kind,
      [
        project === undefined ? undefined : nestedId("project", project, "Project ID"),
        profile === undefined ? undefined : nestedId("profile", profile, "Cloud profile ID"),
      ],
      infrastructure.cloudCollection[kind],
      infrastructure.cloudFields[kind],
      (item) => infrastructure.safeCloud(item, kind),
      page,
    );
  }

  public async getCloudProfile<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/cloud/profiles/" + idPath(id, "Cloud profile ID"),
      { fields: infrastructure.cloudFields.profiles },
      value => infrastructure.safeCloud(value, "profiles"),
      fields,
    );
  }

  public async getCloudImage<F extends string | undefined = undefined>(
    input: infrastructure.CloudImageId,
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/cloud/images/" + idPath(infrastructure.cloudComposite(input), "Image ID"),
      { fields: infrastructure.cloudFields.images },
      value => infrastructure.safeCloud(value, "images"),
      fields,
    );
  }

  public async getCloudInstance<F extends string | undefined = undefined>(
    input: infrastructure.CloudInstanceId,
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/cloud/instances/" + idPath(infrastructure.cloudComposite(input), "Instance ID"),
      { fields: infrastructure.cloudFields.instances },
      value => infrastructure.safeCloud(value, "instances"),
      fields,
    );
  }

  public async startCloudInstance<F extends string | undefined = undefined>(
    input: Partial<infrastructure.CloudImageId>,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    const dimensions = [
      ...(input.profile === undefined ? [] : ["profileId:" + locatorValue(input.profile, "Cloud profile ID")]),
      ...(input.image === undefined ? [] : ["id:" + locatorValue(input.image, "Cloud image ID")]),
    ];
    const imageId = dimensions.length === 0 ? undefined : dimensions.join(",");
    const contents = await this.#request(
      "POST",
      "/app/rest/cloud/instances",
      fields === undefined ? {} : { fields: fieldsProjection(fields) },
      { ...(imageId === undefined ? {} : { image: { id: imageId } }), ...native },
    );
    return this.#projectedAcknowledgement(contents, fields, { imageId, startRequested: true });
  }

  public async stopCloudInstance<F extends string | undefined = undefined>(
    input: infrastructure.CloudInstanceId,
    action: "delete" | "force-stop" | "stop", fields?: F
  ) {
    const instanceId = infrastructure.cloudComposite(input);
    const suffix =
      action === "delete" ? "" : action === "stop" ? "/actions/stop" : "/actions/forceStop";
    const nativeResponse = await this.#request(
      action === "delete" ? "DELETE" : "POST",
      "/app/rest/cloud/instances/" + idPath(instanceId, "Instance ID") + suffix,
    );
    return this.#projectedAcknowledgement(nativeResponse, fields, {
      instanceId,
      ...(action === "stop" ? { stopWhenFreeRequested: true } : { forcedStopRequested: true }),
    });
  }

  public async createAnonymousGitRoot<F extends string | undefined = undefined>(
    id: string,
    name: string | undefined,
    project: string | undefined,
    url: string | undefined,
    branch: string | undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    const body = infrastructure.anonymousGitRoot(id, name, project, url, branch);
    return this.#projectedJson(
      "POST",
      "/app/rest/vcs-roots",
      { fields: infrastructure.vcsRootFields },
      infrastructure.safeInfrastructureRoot,
      fields,
      { ...body, ...native },
    );
  }

  public async deleteVcsRoot<F extends string | undefined = undefined>(id: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", infrastructure.vcsRootPath(id));
    return this.#projectedAcknowledgement(nativeResponse, fields, { rootId: id, deleted: true });
  }

  public async getVcsRootInstances<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      infrastructure.vcsRootPath(id) + "/instances",
      { fields: `count,vcs-root-instance(${infrastructure.vcsInstanceFields})` },
      value =>
        triage.array((value as Record<string, unknown>)["vcs-root-instance"])
          .map(
            infrastructure.safeVcsInstance,
          ),
      fields
    );
  }

  public async listVcsRootProperties<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      infrastructure.vcsRootPath(id) + "/properties",
      { fields: `count,property(${propertyFields})` },
      value => ((value as { property?: RawProperty[] }).property ?? []).map(p => safeProperty(p)),
      fields,

    );
  }

  public async replaceVcsRootProperties<F extends string | undefined = undefined>(
    id: string,
    properties: readonly PlainProperty[],
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    const body = { property: infrastructure.namedValues(properties) };
    return this.#projectedJson(
      "PUT",
      infrastructure.vcsRootPath(id) + "/properties",
      { fields: "count,property(name)" },
      infrastructure.propertyNames,
      fields,
      { ...body, ...native },
    );
  }

  public async clearVcsRootProperties<F extends string | undefined = undefined>(id: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", infrastructure.vcsRootPath(id) + "/properties");
    return this.#projectedAcknowledgement(nativeResponse, fields, { rootId: id, cleared: true });
  }

  public async checkVcsRootProperty<F extends string | undefined = undefined>(id: string, name: string, fields?: F) {
    const nativeResponse = await this.#requestText(
      "GET",
      infrastructure.vcsRootPath(id) + "/properties/" + pathSegment(name),
      undefined,
      { discard: fields === undefined },
    );
    return this.#projectedValue(nativeResponse, fields, () => ({ name, exists: true }), { name });
  }

  public async setVcsRootProperty<F extends string | undefined = undefined>(id: string, name: string, value: string, fields?: F) {
    const property = plainProperty(name, value);
    const nativeResponse = await this.#requestText(
      "PUT",
      infrastructure.vcsRootPath(id) + "/properties/" + pathSegment(property.name),
      property.value,
      { discard: fields === undefined },
    );
    return this.#projectedValue(nativeResponse, fields, () => ({ name: property.name, updated: true }), { name });
  }

  public async deleteVcsRootProperty<F extends string | undefined = undefined>(id: string, name: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", infrastructure.vcsRootPath(id) + "/properties/" + pathSegment(name));
    return this.#projectedAcknowledgement(nativeResponse, fields, { name, deleted: true });
  }

  public async getVcsRootField<F extends string | undefined = undefined>(id: string, field: string, fields?: F) {
    requiredText(field, "Field name");
    const value = await this.#requestText("GET", infrastructure.vcsRootPath(id) + "/" + pathSegment(field));
    return this.#projectedValue(value, fields, () => ({ rootId: id, field, value }));
  }

  public async setVcsRootField<F extends string | undefined = undefined>(id: string, field: string, value: string, fields?: F) {
    plainProperty(field, "");
    const nativeResponse = await this.#requestText(
      "PUT",
      infrastructure.vcsRootPath(id) + "/" + pathSegment(field),
      triage.inputText(value, "Name"),
      { discard: fields === undefined },
    );
    return this.#projectedValue(nativeResponse, fields, () => ({ rootId: id, field, updated: true }));
  }

  public listVcsInstances<F extends string | undefined = undefined>(
    page: TeamCityPageOptions & { fields?: F } = {},
    root?: string,
  ) {
    return this.#list(
      "/app/rest/vcs-root-instances",
      [root === undefined ? undefined : nestedId("vcsRoot", root, "Root ID")],
      "vcs-root-instance",
      infrastructure.vcsInstanceFields,
      infrastructure.safeVcsInstance,
      page,
    );
  }

  public async checkVcsInstanceChanges<F extends string | undefined = undefined>(
    id: string,
    requestor?: string,
    fields?: F,
  ) {
    return this.#projectedJson(
      "POST",
      "/app/rest/vcs-root-instances/checkingForChangesQueue",
      {
        locator: idPath(id, "Instance ID"), ...(requestor === undefined ? {} : { requestor: requiredText(requestor, "Requestor") }),
        fields: `count,nextHref,vcs-root-instance(${infrastructure.vcsInstanceFields})`
      },
      value =>
        triage.array((value as Record<string, unknown>)["vcs-root-instance"])
          .map(
            infrastructure.safeVcsInstance,
          ),
      fields
    );
  }

  public async notifyVcsCommit<F extends string | undefined = undefined>(
    id: string,
    okOnNothingFound?: string, fields?: F
  ) {
    const nativeResponse = await this.#request("POST", "/app/rest/vcs-root-instances/commitHookNotification", {
        locator: idPath(id, "Instance ID"),
        ...(okOnNothingFound === undefined ? {} : { okOnNothingFound }),
      }, undefined, "text/plain", { discard: fields === undefined, expectedStatus: 202 });
    return this.#projectedAcknowledgement(nativeResponse, fields, { instanceId: id, scheduled: true });
  }

  public async getVcsInstance<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      infrastructure.vcsInstancePath(id),
      { fields: infrastructure.vcsInstanceFields },
      infrastructure.safeVcsInstance,
      fields,
    );
  }

  public async listVcsInstanceProperties<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      infrastructure.vcsInstancePath(id) + "/properties",
      { fields: `count,property(${propertyFields})` },
      value => ((value as { property?: RawProperty[] }).property ?? []).map(p => safeProperty(p)),
      fields,

    );
  }

  public async getVcsRepositoryState<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      infrastructure.vcsInstancePath(id) + "/repositoryState",
      { fields: "count,entry(name,value)" },
      infrastructure.repositoryEntries,
      fields,
    );
  }

  public async replaceVcsRepositoryState<F extends string | undefined = undefined>(
    id: string,
    revisions: readonly PlainProperty[],
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    const body = { entry: infrastructure.namedValues(revisions) };
    return this.#projectedJson(
      "PUT",
      infrastructure.vcsInstancePath(id) + "/repositoryState",
      { fields: "count,entry(name,value)" },
      infrastructure.repositoryEntries,
      fields,
      { ...body, ...native },
    );
  }

  public async resetVcsRepositoryState<F extends string | undefined = undefined>(id: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", infrastructure.vcsInstancePath(id) + "/repositoryState");
    return this.#projectedAcknowledgement(nativeResponse, fields, { instanceId: id, stateReset: true });
  }

  public async getVcsRepositoryStateCreated<F extends string | undefined = undefined>(id: string, fields?: F) {
    const creationDate = await this.#requestText("GET", infrastructure.vcsInstancePath(id) + "/repositoryState/creationDate");
    return this.#projectedValue(creationDate, fields, () => ({ instanceId: id, creationDate }));
  }

  public async getVcsInstanceField<F extends string | undefined = undefined>(id: string, field: string, fields?: F) {
    requiredText(field, "Field name");
    const value = await this.#requestText("GET", infrastructure.vcsInstancePath(id) + "/" + pathSegment(field));
    return this.#projectedValue(value, fields, () => ({ instanceId: id, field, value }));
  }

  public async setVcsInstanceField<F extends string | undefined = undefined>(id: string, field: string, value: string, fields?: F) {
    plainProperty(field, "");
    const body = plainProperty(field, value).value;
    const nativeResponse = await this.#requestText(
      "PUT",
      infrastructure.vcsInstancePath(id) + "/" + pathSegment(field),
      body,
      { discard: fields === undefined },
    );
    return this.#projectedValue(nativeResponse, fields, () => ({ instanceId: id, field, updated: true }));
  }

  public async clearVcsInstanceField<F extends string | undefined = undefined>(id: string, field: string, fields?: F) {
    plainProperty(field, "");
    const nativeResponse = await this.#request("DELETE", infrastructure.vcsInstancePath(id) + "/" + pathSegment(field));
    return this.#projectedAcknowledgement(nativeResponse, fields, { instanceId: id, field, cleared: true });
  }

  public async getVersionedAffectedProjects<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      infrastructure.versionedPath(id) + "/affectedProjects",
      { fields: "count,project(id,name)" },
      (value) =>
        ((value as { project?: unknown[] }).project ?? []).map(
          (item) => triage.safeScalars(item, ["id", "name"]),
        ),
      fields,
    );
  }

  public async checkVersionedSettings<F extends string | undefined = undefined>(id: string, fields?: F) {
    const nativeResponse = await this.#request("POST", infrastructure.versionedPath(id) + "/checkForChanges");
    return this.#projectedAcknowledgement(nativeResponse, fields, { projectId: id, checkRequested: true });
  }

  public async commitVersionedSettings<F extends string | undefined = undefined>(id: string, fields?: F) {
    const nativeResponse = await this.#request("POST", infrastructure.versionedPath(id) + "/commitCurrentSettings");
    return this.#projectedAcknowledgement(nativeResponse, fields, { projectId: id, commitRequested: true });
  }

  public async getVersionedConfig<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      infrastructure.versionedPath(id) + "/config",
      { fields: infrastructure.versionedConfigFields },
      infrastructure.safeVersionedConfig,
      fields,
    );
  }

  public async replaceVersionedConfig<F extends string | undefined = undefined>(
    id: string,
    input: unknown,
    fields?: F,
  ) {
    const body = infrastructure.versionedConfigBody(input);
    return this.#projectedJson(
      "PUT",
      infrastructure.versionedPath(id) + "/config",
      { fields: infrastructure.versionedConfigFields },
      infrastructure.safeVersionedConfig,
      fields,
      body,
    );
  }

  public async getEffectiveVersionedConfig<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      infrastructure.versionedPath(id) + "/config/effective",
      { fields: `project(id),config(${infrastructure.versionedConfigFields})` },
      (raw) => {
        const value = raw as { project?: unknown; config?: unknown }; return ({
      ...(value.project === undefined
        ? {}
        : { project: triage.safeScalars(value.project, ["id"]) }),
      ...(value.config === undefined
        ? {}
        : { config: infrastructure.safeVersionedConfig(value.config) }),
        });
      },
      fields
    );
  }

  public async getVersionedConfigField<F extends string | undefined = undefined>(id: string, field: string, fields?: F) {
    requiredText(field, "Field name");
    const value = await this.#requestText("GET", infrastructure.versionedPath(id) + "/config/parameters/" + pathSegment(field));
    return this.#projectedValue(value, fields, () => ({ projectId: id, field, value }));
  }

  public async setVersionedConfigField<F extends string | undefined = undefined>(id: string, field: string, value: string, fields?: F) {
    const body = infrastructure.versionedField(field, value);
    const nativeResponse = await this.#requestText(
      "PUT",
      infrastructure.versionedPath(id) + "/config/parameters/" + pathSegment(field),
      body,
      { discard: fields === undefined },
    );
    return this.#projectedValue(nativeResponse, fields, () => ({ projectId: id, field, updated: true }));
  }

  public async resetVersionedConfigField<F extends string | undefined = undefined>(id: string, field: string, fields?: F) {
    plainProperty(field, "");
    const nativeResponse = await this.#request("DELETE", infrastructure.versionedPath(id) + "/config/parameters/" + pathSegment(field));
    return this.#projectedAcknowledgement(nativeResponse, fields, { projectId: id, field, resetRequested: true });
  }

  public async listVersionedContext<F extends string | undefined = undefined>(id: string, fields?: F) {
    const nativeResponse = await this.#requestJson("GET", infrastructure.versionedPath(id) + "/contextParameters");
    return this.#projectedValue(nativeResponse, fields, () => {
      return infrastructure.contextParameters(
        nativeResponse, true,
      );
    });
  }

  public async replaceVersionedContext<F extends string | undefined = undefined>(id: string, properties: readonly PlainProperty[], native: Record<string, unknown> = {}, fields?: F) {
    const body = { versionedSettingsContextParameter: infrastructure.namedValues(properties) };
    const nativeResponse = await this.#requestJson(
      "PUT",
      infrastructure.versionedPath(id) + "/contextParameters",
      {},
      { ...body, ...native },
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      return infrastructure.contextParameters(
        nativeResponse,
      );
    });
  }

  public async loadVersionedSettings<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "POST",
      infrastructure.versionedPath(id) + "/loadSettings",
      { fields: "count,project(id,name)" },
      (value) =>
        ((value as { project?: unknown[] }).project ?? []).map(
          (item) => triage.safeScalars(item, ["id", "name"]),
        ),
      fields,
    );
  }

  public async getVersionedStatus<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      infrastructure.versionedPath(id) + "/status",
      { fields: "type,timestamp,dslOutdated,missingContextParameters" },
      infrastructure.versionedStatus,
      fields,
    );
  }

  public async listVersionedTokenNames<F extends string | undefined = undefined>(id: string, status?: string, fields?: F) {
    const nativeResponse = await this.#requestJson<{ versionedSettingsToken?: unknown[] }>(
      "GET",
      infrastructure.versionedPath(id) + "/tokens",
      status === undefined ? {} : { status: plainProperty("status", status).value },
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      const value = nativeResponse;
      return (value.versionedSettingsToken ?? []).map(
        (item) => triage.safeScalars(item, ["name"]).name,
      );
    });
  }

  public async setVersionedTokens<F extends string | undefined = undefined>(id: string, mappings: readonly string[], secrets: ScopedSecrets, properties: readonly PlainProperty[] = [], native: Record<string, unknown> = {}, fields?: F) {
    secrets = this.#rememberSecrets(secrets);
    triage.typedItems([...mappings, ...properties]);
    const entries = mappings.map((mapping) => {
      const split = mapping.indexOf("=");
      if (split < 1) throw new Error("Mapping requires remote-name=local-alias.");
      return {
        name: requiredText(mapping.slice(0, split), "Mapping name"),
        alias: admin.credentialAlias(mapping.slice(split + 1)),
      };
    });
    textIds(entries.map((item) => item.name));
    const versionedSettingsToken = propertiesBody(properties).property;
    const directNames = new Set(versionedSettingsToken.map((item) => item.name));
    for (const item of entries) {
      if ("versionedSettingsToken" in native || directNames.has(item.name)) continue;
      versionedSettingsToken.push({
        name: item.name,
        value: await requireInputSecret(secrets, item.alias),
      });
    }
    const nativeResponse = await this.#request(
      "POST",
      infrastructure.versionedPath(id) + "/tokens",
      {},
      { versionedSettingsToken, ...native },
      "application/json",
      { discard: fields === undefined },
    );
    return this.#projectedAcknowledgement(nativeResponse, fields, { names: versionedSettingsToken.map((item) => item.name), updated: true });
  }

  public async deleteVersionedTokens<F extends string | undefined = undefined>(id: string, names: readonly string[] = [], native: Record<string, unknown> = {}, fields?: F) {
    triage.typedItems(names);
    const checked = textIds(names);
    const nativeResponse = await this.#request(
      "DELETE",
      infrastructure.versionedPath(id) + "/tokens",
      {},
      { versionedSettingsToken: checked.map((name) => ({ name })), ...native },
      "application/json",
      { discard: fields === undefined },
    );
    return this.#projectedAcknowledgement(nativeResponse, fields, { names: checked, deleted: true });
  }

  public async getRestVersion<F extends string | undefined = undefined>(fields?: F) {
    const nativeResponse = await this.#requestText("GET", "/app/rest/version");
    return this.#projectedValue(nativeResponse, fields, () => {
      return {
        version: nativeResponse,
      };
    });
  }

  #statusBody(status: boolean | undefined, comment?: string) {
    if (status !== undefined && typeof status !== "boolean") throw new Error("Status must be a boolean.");
    return {
      ...(status === undefined ? {} : { status }),
      ...(comment === undefined
        ? {}
        : { comment: { text: plainProperty("comment", comment).value } }),
    };
  }

  async #optionalJson<T>(path: string, fields: string): Promise<T | null> {
    const contents = await this.#request("GET", path, { fields });
    return contents.trim() === "" ? null : decodeJson<T | null>(contents);
  }

  #cancel<F extends string | undefined>(
    path: string,
    options: CancelBuildOptions<F>,
    native: Record<string, unknown> = {}
  ): Promise<Projected<TeamCityBuild, F>> {
    return this.#projectedJson(
      "POST",
      path,
      { fields: buildFields },
      value => value as TeamCityBuild,
      options.fields,
      { ...(options.comment === undefined
          ? {}
          : { comment: requiredText(options.comment, "Cancellation comment") }),
        ...(options.requeue === undefined ? {} : { readdIntoQueue: options.requeue }), ...native },
    );
  }

  async #requestJson<T>(
    method: HttpMethod,
    path: string,
    query: Record<string, string> = {},
    body?: unknown,
  ): Promise<T> {
    const contents = await this.#request(method, path, query, body);
    return decodeJson<T>(contents);
  }

  #projectedAcknowledgement<T, F extends string | undefined>(
    contents: string,
    fields: F | undefined,
    acknowledgement: T,
    property?: RawProperty,
  ): Projected<T, F> {
    const value = fields === undefined ? undefined : this.#acknowledgedJson(contents);
    return this.#projectedValue<T, F>(
      value === undefined ? acknowledgement : value,
      value === undefined ? undefined : fields,
      () => acknowledgement,
      property,
    );
  }

  // Acknowledgement commands already accept empty or non-JSON successful bodies.
  #acknowledgedJson(
    contents: string
  ): unknown {
    try {
      return JSON.parse(contents);
    } catch {
      return contents === "" ? undefined : contents;
    }
  }

  /** Defaults retain their shaping; explicit projections return native JSON with known credentials masked. */
  async #projectedJson<T, F extends string | undefined = undefined>(
    method: HttpMethod,
    path: string,
    query: Record<string, string>,
    project: (value: unknown) => T,
    fields?: F,
    body?: unknown,
  ): Promise<Projected<T, F>> {
    const value = await this.#requestJson<unknown>(
      method,
      path,
      {
        ...query,
        ...(fields === undefined ? {} : { fields: fieldsProjection(fields) }),
      },
      body,
    );
    return this.#projectedValue<T, F>(value, fields, project);
  }

  /** Decide from native fields, then mask the result attached to a projected failure. */
  #projectedMutation<T, F extends string | undefined>(
    value: unknown,
    fields: F | undefined,
    project: (value: unknown) => T,
    failure?: { code: string; message: string },

  ): Projected<T, F> {
    const result = this.#projectedValue<T, F>(value, fields, project);
    if (fields !== undefined && failure) {
      throw new CliError(failure.message, { code: failure.code, result });
    }
    return result;
  }

  #projectedValue<T, F extends string | undefined>(
    value: unknown,
    fields: F | undefined,
    project: (value: unknown) => T,
    property?: RawProperty,
  ): Projected<T, F> {
    if (fields === undefined) return this.#maskValue(project(value)) as Projected<T, F>;
    if (property && isSecretProperty({ ...property, value: "" })) {
      if (typeof value === "string") value = safeProperty(property, false);
      else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        const { value: hidden, ...metadata } = value as Record<string, unknown>;
        value = { ...metadata, redacted: true };
      }
    }
    value = readableConfiguration(value);
    return this.#maskValue(value) as Projected<T, F>;
  }

  #maskText(text: string): string {
    for (const secret of [...this.#knownSecrets].sort((a, b) => b.length - a.length)) {
      text = knownCredentialMask(secret)(text);
    }
    return text;
  }

  #maskValue<T>(value: T): T {
    if (typeof value === "string") return this.#maskText(value) as T;
    if (Array.isArray(value)) return value.map(item => this.#maskValue(item)) as T;
    if (value !== null && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, nested]) =>
        [this.#maskText(key), this.#maskValue(nested)])) as T;
    }
    return value;
  }

  /** The client belongs to one invocation; retain only values actually read or written. */
  #rememberSecrets(secrets: ScopedSecrets): ScopedSecrets {
    const remember = (key: string, value: string | undefined) => {
      if (value) this.#knownSecrets.add(value);
      if (key.startsWith("issued-token:") && value) {
        try {
          const token: unknown = JSON.parse(value)?.value;
          if (typeof token === "string" && token) this.#knownSecrets.add(token);
        } catch { /* Invalid secure records are diagnosed by their consumer. */ }
      }
      return value;
    };
    return {
      get: async key => remember(key, await secrets.get(key)),
      require: async key => remember(key, await secrets.require(key))!,
      set: async (key, value) => {
        remember(key, value);
        await secrets.set(key, value);
      },
      delete: key => secrets.delete(key),
    };
  }

  /** A bounded/interrupted read must not publish the beginning of a known secret. */
  #dropSecretPrefix(text: string): string {
    let end = text.length;
    for (const secret of this.#knownSecrets) {
      for (let length = Math.min(secret.length - 1, text.length); length > 0; length--) {
        if (text.endsWith(secret.slice(0, length))) {
          end = Math.min(end, text.length - length);
          break;
        }
      }
    }
    return text.slice(0, end);
  }

  /** A bounded selection of `key` items that follows TeamCity's continuation; see `readPages`. */
  async #list<T, F extends string | undefined = undefined>(
    path: string,
    locator: readonly (string | undefined)[],
    key: string,
    fields: string,
    project: (item: unknown) => T,
    page: TeamCityPageOptions & { fields?: F },
    initialLookupLimit?: number,
  ): Promise<TeamCityPage<Projected<T, F>>> {
    const { limit, start } = normalizePage(page);
    const projection = page.fields === undefined ? undefined : fieldsProjection(page.fields);
    return readPages(limit, start, async (request) => {
      const response = triage.object(await this.#requestJson("GET", path, {
        locator: joinLocator(
          ...locator,
          request.lookupLimit === undefined && initialLookupLimit !== undefined
            ? `lookupLimit:${initialLookupLimit}` : undefined,
          `start:${request.start}`,
          `count:${request.count}`,
          request.lookupLimit === undefined ? undefined : `lookupLimit:${request.lookupLimit}`,
        ),
        fields: `nextHref,${key}(${projection ?? fields})`,
      }));
      return {
        items: triage.array(response[key]).map(item => this.#projectedValue<T, F>(item, page.fields, project)),
        nextHref: response.nextHref,
      };
    }, this.#signal);
  }

  public async getRestInfo<F extends string | undefined = undefined>(fields?: F) {
    const value = await this.#requestText("GET", "/app/rest");
    const path = value.match(
      /(?:^|[\s'"(])(\/(?:[A-Za-z0-9._-]+\/)*app\/rest)(?:\/server)?(?=$|[\s'"),.])/,
    );
    return this.#projectedValue(value, fields, () => path ? { restPath: path[1] } : value);
  }
  public async createPoolTokens(
    id: string,
    ttl: number | undefined,
    aliases: readonly string[],
    secrets: ScopedSecrets,
    native: Record<string, unknown> = {},
  ) {
    secrets = this.#rememberSecrets(secrets);
    const poolId = poolNumber(Number(integerId(id, "Pool ID")));
    if (ttl !== undefined) system.integer(ttl);
    const keys = aliases.map(inputSecretKey);
    await preflightSecretKeys(secrets, keys);
    const result = triage.object(
      await this.#requestJson(
        "POST",
        `/app/rest/agentPools/id:${poolId}/authorizationTokens`,
        {},
        { timeToLiveSeconds: ttl, count: aliases.length, ...native },
      ),
    );
    await persistSecretKeys(secrets, keys, triage.array(result.item) as string[]);
    return this.#maskValue({
      poolId,
      aliases: [...aliases],
      count: aliases.length,
      timeToLiveSeconds: ttl,
      stored: true,
    });
  }
  public listAudit<F extends string | undefined = undefined>(
    page: TeamCityPageOptions & { fields?: F },
    project?: string,
  ) {
    return this.#list(
      "/app/rest/audit",
      ["systemAction:any", "hidden:any", project ? nestedId("affectedProject", project, "Project ID") : undefined],
      "auditEvent",
      system.auditFields,
      system.safeAudit,
      page,
    );
  }
  public async getAudit<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/audit/" + idPath(id, "Audit ID"),
      { fields: system.auditFields },
      system.safeAudit,
      fields,
    );
  }

  public async replaceAvatar<F extends string | undefined = undefined>(id: string, path: string, fields?: F) {
    const userId = system.userId(id),
      body = await system.avatarInput(path);
    const nativeResponse = await this.#request("PUT", "/app/rest/avatars/" + idPath(userId, "User ID"), {}, body, "application/json", {
      discard: fields === undefined,
    });
    return this.#projectedAcknowledgement(nativeResponse, fields, { userId, replaced: true });
  }
  public async deleteAvatar<F extends string | undefined = undefined>(id: string, fields?: F) {
    const userId = system.userId(id);
    const nativeResponse = await this.#request("DELETE", "/app/rest/avatars/" + idPath(userId, "User ID"));
    return this.#projectedAcknowledgement(nativeResponse, fields, { userId, deleted: true });
  }
  public async getJobInvestigations<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/buildTypes/" + idPath(id, "ID") + "/investigations",
      { fields: `count,investigation(${triage.investigationFields})` },
      value => system.collection(value, "investigation", (v) => triage.safeAssignment(v, true)),
      fields,
    );
  }
  public async getJobVcsInstances<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/buildTypes/" + idPath(id, "ID") + "/vcsRootInstances",
      { fields: `count,vcs-root-instance(${infrastructure.vcsInstanceFields})` },
      value => system.collection(value, "vcs-root-instance", infrastructure.safeVcsInstance),
      fields,
    );
  }
  public listDashboards<F extends string | undefined = undefined>(
    page: TeamCityPageOptions & { fields?: F },
    project?: string,
  ) {
    return this.#list(
      "/app/rest/deploymentDashboards",
      [project ? nestedId("project", project, "Project ID") : undefined],
      "deploymentDashboard",
      system.dashboardFields,
      system.safeDashboard,
      page,
    );
  }
  public async createDashboard<F extends string | undefined = undefined>(id: string, name: string | undefined, project: string | undefined, native: Record<string, unknown> = {}, fields?: F) {
    const nativeResponse = await this.#requestJson("POST", "/app/rest/deploymentDashboards", {}, {
          id: triage.inputText(id, "Dashboard ID"),
          ...(name === undefined ? {} : { name: triage.inputText(name, "Name") }),
          ...(project === undefined ? {} : { project: { id: triage.inputText(project, "Project ID") } }),
          ...native,
        });
    return this.#projectedValue(nativeResponse, fields, () => {
      return system.safeDashboard(
        nativeResponse,
      );
    });
  }
  public async getDashboard<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      system.dashboardPath(id),
      { fields: system.dashboardFields },
      system.safeDashboard,
      fields,
    );
  }
  public async deleteDashboard<F extends string | undefined = undefined>(id: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", system.dashboardPath(id));
    return this.#projectedAcknowledgement(nativeResponse, fields, { id, deleted: true });
  }
  public listDeploymentInstances<F extends string | undefined = undefined>(
    id: string,
    page: TeamCityPageOptions & { fields?: F },
  ) {
    return this.#list(system.dashboardPath(id) + "/instances", [], "deploymentInstance",
      system.instanceFields, system.safeInstance, page);
  }
  public async upsertDeploymentInstance<F extends string | undefined = undefined>(
    dashboard: string,
    id: string,
    state: string | undefined,
    date: string | undefined,
    build?: string,
    native: Record<string, unknown> = {}, fields?: F
  ) {
    const entry = system.stateEntry(state, date, build);
    const nativeResponse = await this.#requestJson("POST", system.dashboardPath(dashboard) + "/instances", {}, {
          id: triage.inputText(id, "Instance ID"),
          ...(Object.keys(entry).length ? { deploymentStateEntries: { deploymentStateEntry: [entry] } } : {}),
          ...native,
        });
    return this.#projectedValue(nativeResponse, fields, () => {
      return system.safeInstance(
        nativeResponse,
      );
    });
  }
  public async getDeploymentInstance<F extends string | undefined = undefined>(
    dashboard: string,
    id: string,
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      system.instancePath(dashboard, id),
      { fields: system.instanceFields },
      system.safeInstance,
      fields,
    );
  }
  public async appendDeploymentState<F extends string | undefined = undefined>(
    dashboard: string,
    id: string,
    state: string | undefined,
    date: string | undefined,
    build?: string,
    native: Record<string, unknown> = {}, fields?: F
  ) {
    const nativeResponse = await this.#requestJson(
      "POST",
      system.instancePath(dashboard, id),
      {},
      { ...system.stateEntry(state, date, build), ...native },
    );
    return this.#projectedValue(nativeResponse, fields, () => {
      return system.safeInstance(
        nativeResponse,
      );
    });
  }
  public async deleteDeploymentInstance<F extends string | undefined = undefined>(dashboard: string, id: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", system.instancePath(dashboard, id));
    return this.#projectedAcknowledgement(nativeResponse, fields, { dashboardId: dashboard, instanceId: id, deleted: true });
  }
  public listHealth<F extends string | undefined = undefined>(
    options: { project?: string; global?: boolean },
    page: TeamCityPageOptions & { fields?: F },
  ) {
    return this.#list("/app/rest/health", [system.healthLocator(options.project === undefined && options.global === undefined
      ? { project: "_Root", global: true } : options)], "healthItem",
      system.healthFields, system.safeHealth, page);
  }
  public async getHealth<F extends string | undefined = undefined>(
    options: { project?: string; global?: boolean; category?: string },
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/health/" + system.healthLocator(options),
      { fields: system.healthFields },
      system.safeHealth,
      fields,
    );
  }

  public async listHealthCategories<F extends string | undefined = undefined>(
    fields?: F,
    locator?: string
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/health/category",
      { fields: "count,healthCategory(id,name)", ...(locator === undefined ? {} : { locator }) },
      value => system.collection(value, "healthCategory", system.safeCategory),
      fields,
    );
  }

  public async getHealthCategory<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/health/category/" + idPath(id, "ID"),
      { fields: "id,name" },
      system.safeCategory,
      fields,
    );
  }

  public async getRestPlugin<F extends string | undefined = undefined>(
    fields?: F
  ): Promise<Projected<ReturnType<typeof system.pluginXml>, F>> {
    if (fields !== undefined) return this.#projectedJson("GET", "/app/rest/info", {},
      system.safePlugin, fields);
    const contents = await this.#request(
        "GET",
        "/app/rest/info",
        { fields: system.pluginFields },
        undefined,
        "application/xml",
        {},
    );
    return this.#projectedValue(contents, fields, value => system.pluginXml(value as string));
  }
  public async deleteMutes<F extends string | undefined = undefined>(
    ids: readonly string[],
    fields?: F,
    native: Record<string, unknown> = {}
  ) {
    const selected = triage
      .inputIds(ids)
      .map((id) => Number(integerId(id, "Mute ID")));
    const mute = selected.map(id => ({ id }));
    const contents = await this.#request(
      "DELETE",
      "/app/rest/mutes/multiple",
      fields === undefined ? {} : { fields: fieldsProjection(fields) },
      { mute, ...native },
      "application/json",
      {
        discard: fields === undefined,
    });
    return this.#projectedAcknowledgement(
      contents,
      fields,
      { requestedIds: selected, serverAcknowledged: true, postconditionVerified: false },
    );
  }
  public async getDefaultValueSets<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/projects/" + idPath(id, "ID") + "/defaultValueSets",
      { fields: "count,valueSet(name,displayName)" },
      value => system.collection(value, "valueSet", (v) => triage.safeScalars(v, ["name", "displayName"])),
      fields,
    );
  }

  public async listProjectDashboards<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/projects/" + idPath(id, "ID") + "/deploymentDashboards",
      { fields: `count,deploymentDashboard(${system.dashboardFields})` },
      value => system.collection(value, "deploymentDashboard", system.safeDashboard),
      fields,
    );
  }

  public async getProjectDashboard<F extends string | undefined = undefined>(
    project: string,
    id: string,
    fields?: F,
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/projects/" + idPath(project, "Project ID") + "/deploymentDashboards/" + idPath(id, "ID"),
      { fields: system.dashboardFields },
      value => system.safeDashboard(value),
      fields,
    );
  }

  public async listRoleDefinitions<F extends string | undefined = undefined>(
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/roles",
      { fields: `count,role(${system.roleFields})` },
      value => system.collection(value, "role", system.safeRole),
      fields,
    );
  }
  public async createRoleDefinition<F extends string | undefined = undefined>(
    name: string | undefined,
    permissions: readonly string[] | undefined,
    included: readonly string[] | undefined,
    fields?: F,
    native: Record<string, unknown> = {},
  ) {
    return this.#projectedJson(
      "POST",
      "/app/rest/roles",
      { fields: system.roleFields },
      system.safeRole,
      fields,
      {
        ...(name === undefined ? {} : { name: triage.inputText(name, "Name") }),
        ...(permissions === undefined ? {} : { permissions: { permission: system.idsOrEmpty(permissions).map((id) => ({ id })) } }),
        ...(included === undefined ? {} : { included: { role: system.idsOrEmpty(included).map((id) => ({ id })) } }),
        ...native,
      },
    );
  }
  public async getRoleDefinition<F extends string | undefined = undefined>(
    id: string,
    fields?: F
  ) {
    return this.#projectedJson("GET", system.rolePath(id),
      { fields: system.roleFields }, system.safeRole, fields);
  }
  public async deleteRoleDefinition<F extends string | undefined = undefined>(id: string, fields?: F) {
    const nativeResponse = await this.#request("DELETE", system.rolePath(id));
    return this.#projectedAcknowledgement(nativeResponse, fields, { id, deleted: true });
  }
  public async editRoleDefinition<F extends string | undefined = undefined>(
    id: string,
    kind: "included" | "permissions",
    child: string,
    remove: boolean,
    fields?: F,
  ) {
    return this.#projectedJson(
      remove ? "DELETE" : "PUT",
      system.rolePath(id) + "/" + kind + "/" + pathSegment(triage.inputText(child, "Child ID")),
      { fields: system.roleFields },
      system.safeRole,
      fields,
    );
  }
  public async getAuthenticationSettings<F extends string | undefined = undefined>(fields?: F) {
    const nativeResponse = await this.#requestJson("GET", "/app/rest/server/authSettings");
    return this.#projectedValue(nativeResponse, fields, () => {
      return system.safeAuth(nativeResponse, true);
    });
  }
  public async replaceAuthenticationSettings<F extends string | undefined = undefined>(value: unknown, secrets: ScopedSecrets, fields?: F) {
    secrets = this.#rememberSecrets(secrets);
    const body = await system.authBody(value, secrets);
    const nativeResponse = await this.#requestJson("PUT", "/app/rest/server/authSettings", {}, body);
    return this.#projectedValue(nativeResponse, fields, () => {
      return system.safeAuth(
        nativeResponse,
      );
    });
  }
  public async getBackupStatus<F extends string | undefined = undefined>(fields?: F) {
    const nativeResponse = await this.#requestText("GET", "/app/rest/server/backup");
    return this.#projectedValue(nativeResponse, fields, () => {
      return {
        progress: nativeResponse,
        completionVerified: false,
      };
    });
  }
  public async startBackup<F extends string | undefined = undefined>(
    name: string,
    controls: {
      addTimestamp?: string | undefined;
      includeConfigs?: string | undefined;
      includeDatabase?: string | undefined;
      includeBuildLogs?: string | undefined;
      includePersonalChanges?: string | undefined;
      includeRunningBuilds?: string | undefined;
      includeSupplimentaryData?: string | undefined;
    } = {}, fields?: F
  ) {
    triage.inputText(name, "Backup filename");
    const fileName = await this.#request("POST", "/app/rest/server/backup", {
        fileName: name,
        ...(controls.addTimestamp === undefined ? {} : { addTimestamp: booleanText(controls.addTimestamp) }),
        ...(controls.includeConfigs === undefined ? {} : { includeConfigs: booleanText(controls.includeConfigs) }),
        ...(controls.includeDatabase === undefined ? {} : { includeDatabase: booleanText(controls.includeDatabase) }),
        ...(controls.includeBuildLogs === undefined ? {} : { includeBuildLogs: booleanText(controls.includeBuildLogs) }),
        ...(controls.includePersonalChanges === undefined ? {} : { includePersonalChanges: booleanText(controls.includePersonalChanges) }),
        ...(controls.includeRunningBuilds === undefined ? {} : { includeRunningBuilds: booleanText(controls.includeRunningBuilds) }),
        ...(controls.includeSupplimentaryData === undefined ? {} : { includeSupplimentaryData: booleanText(controls.includeSupplimentaryData) }),
      }, undefined, "text/plain");
    return this.#projectedAcknowledgement(fileName, fields, { fileName: fileName, scheduled: true, completionVerified: false });
  }
  public async getCleanup<F extends string | undefined = undefined>(fields?: F) {
    const nativeResponse = await this.#requestJson("GET", "/app/rest/server/cleanup");
    return this.#projectedValue(nativeResponse, fields, () => {
      return system.safeCleanup(nativeResponse);
    });
  }
  public async configureCleanup<F extends string | undefined = undefined>(value: unknown, fields?: F) {
    const nativeResponse = await this.#requestJson("PUT", "/app/rest/server/cleanup", {}, system.cleanupPatch(value));
    return this.#projectedValue(nativeResponse, fields, () => {
      return system.safeCleanup(
        nativeResponse,
      );
    });
  }
  public async getGlobalSettings<F extends string | undefined = undefined>(fields?: F) {
    const nativeResponse = await this.#requestJson("GET", "/app/rest/server/globalSettings");
    return this.#projectedValue(nativeResponse, fields, () => {
      return system.safeGlobal(nativeResponse);
    });
  }
  public async setGlobalSettings<F extends string | undefined = undefined>(value: unknown, fields?: F) {
    const nativeResponse = await this.#requestJson("PUT", "/app/rest/server/globalSettings", {}, system.globalPatch(value));
    return this.#projectedValue(nativeResponse, fields, () => {
      return system.safeGlobal(
        nativeResponse,
      );
    });
  }
  public async getLicenseSummary<F extends string | undefined = undefined>(
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/server/licensingData",
      { fields: system.licenseSummaryFields },
      value => triage.safeScalars(value, system.licenseSummaryFields.split(",")),
      fields,
    );
  }

  public async listLicenses<F extends string | undefined = undefined>(
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/server/licensingData/licenseKeys",
      { fields: `count,licenseKey(${system.licenseFields})` },
      value => system.collection(value, "licenseKey", system.safeLicense),
      fields,
    );
  }

  public async addLicense<F extends string | undefined = undefined>(
    alias: string | undefined,
    secrets: ScopedSecrets,
    fields?: F,
    plainValue?: string,
  ) {
    secrets = this.#rememberSecrets(secrets);
    const value = await inputValue(secrets, alias, plainValue);
    const response = await this.#textJson(
      "POST",
      "/app/rest/server/licensingData/licenseKeys",
      { fields: fields ?? `count,licenseKey(${system.licenseFields})` },
      value,
    );
    return this.#projectedValue(response, fields,
      raw => system.collection(raw, "licenseKey", system.safeLicense));
  }

  public async getLicense<F extends string | undefined = undefined>(
    alias: string | undefined,
    secrets: ScopedSecrets,
    fields?: F,
    plainValue?: string,
  ) {
    secrets = this.#rememberSecrets(secrets);
    const value = await inputValue(secrets, alias, plainValue);
    if (value === undefined) throw new Error("Supply a license key or an input-secret alias for the URL.");
    return this.#projectedJson(
      "GET",
      "/app/rest/server/licensingData/licenseKeys/" + pathSegment(value),
      { fields: system.licenseFields },
      system.safeLicense,
      fields,
    );
  }

  public async deleteLicense<F extends string | undefined = undefined>(alias: string | undefined, secrets: ScopedSecrets, plainValue?: string, fields?: F) {
    secrets = this.#rememberSecrets(secrets);
    const value = await inputValue(secrets, alias, plainValue);
    if (value === undefined) throw new Error("Supply a license key or an input-secret alias for the URL.");
    const nativeResponse = await this.#request("DELETE", "/app/rest/server/licensingData/licenseKeys/" + pathSegment(value));
    return this.#projectedAcknowledgement(nativeResponse, fields, { alias, deleted: true });
  }
  public async getMetrics<F extends string | undefined = undefined>(
    fields?: F
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/server/metrics",
      { fields: "count,metric(name,prometheusName,metricValues(metricValue(name,value)))" },
      value => system.collection(value, "metric", system.safeMetric),
      fields,
    );
  }

  public async getPlugins<F extends string | undefined = undefined>(
    fields?: F,
    locator?: string
  ) {
    return this.#projectedJson(
      "GET",
      "/app/rest/server/plugins",
      { fields: `count,plugin(${system.pluginFields})`, ...(locator === undefined ? {} : { locator }) },
      value => system.collection(value, "plugin", system.safePlugin),
      fields,
    );
  }

  public async getServerField<F extends string | undefined = undefined>(field: string, fields?: F) {
    requiredText(field, "Field name");
    const nativeResponse = await this.#requestText("GET", "/app/rest/server/" + pathSegment(field));
    return this.#projectedValue(nativeResponse, fields, () => {
      return {
        field,
        value: nativeResponse,
      };
    });
  }

  public async listFiles<F extends string | undefined = undefined>(
    kind: files.FileTree,
    id: string,
    path: string | undefined,
    count: number,
    controls: files.FileControls<F> = {},
  ) {
    const suffix = path === undefined ? "" : "/" + files.remotePath(path);
    if (kind !== "builds") {
      const raw = await this.#requestJson(
        "GET",
        files.treePath(kind, id) + suffix,
        {
          ...files.controlledFileQuery(kind, controls),
          locator: "hidden:any," + files.fileLocator(count),
          fields: `count,file(${controls.fields ?? files.fileFields})`,
        },
      );
      if (controls.fields === undefined) return files.safeFiles(raw);
      const entries = triage.object(raw).file ?? [];
      if (!Array.isArray(entries)) throw new Error("Invalid file collection.");
      return {
        count: entries.length,
        items: entries.map(item => this.#projectedValue(item, controls.fields, files.safeFile)),
      };
    }
    files.fileLocator(count); // Validate before adding the one-item lookahead.
    const requested = Math.min(count + 1, Number.MAX_SAFE_INTEGER);
    const raw = triage.object(
      await this.#requestJson("GET", files.treePath(kind, id) + suffix, {
        ...files.controlledFileQuery(kind, controls),
        locator: "hidden:any," + files.fileLocator(requested, true),
        fields: `count,file(${controls.fields ?? files.artifactFileFields})`,
      }),
    );
    const entries = (raw.file === undefined ? [] : raw.file) as unknown[];
    if (!Array.isArray(entries)) throw new Error("Invalid file collection.");
    const items = entries
      .slice(0, count)
      .map(
        (item) => this.#projectedValue(item, controls.fields, files.safeArtifactFile),
      );
    return {
      count: items.length,
      items,
      hasMore: entries.length > count ? true : entries.length < requested ? false : null,
    };
  }
  public async getFileMetadata<F extends string | undefined = undefined>(
    kind: files.FileTree,
    id: string,
    path: string,
    controls: files.FileControls<F> = {},
  ) {
    return this.#projectedJson(
        "GET",
        files.treePath(kind, id) + "/metadata/" + files.remotePath(path),
      { ...files.controlledFileQuery(kind, controls), fields: files.fileFields },
      files.safeFile,
      controls.fields,
    );
  }
  /** Save verified bytes without overwriting; cwd is the captured invocation directory. */
  public async downloadFile(
    kind: files.FileTree,
    id: string,
    path: string,
    archive: boolean,
    count: number,
    cwd: string,
    options: DownloadOptions,
    controls: files.FileControls = {},
  ) {
    const requestPath =
      files.treePath(kind, id) + (archive ? "/archived/" : "/files/") + files.remotePath(path);
    const query = {
      ...files.controlledFileQuery(kind, controls),
      ...(archive ? { locator: files.fileLocator(count) } : {}),
    };
    return this.#download(requestPath, query, cwd, { ...options, name: path.split("/").at(-1)! + (archive ? ".zip" : "") }, archive ? "zip" : "bytes");
  }
  /** Save verified bytes without overwriting; cwd is the captured invocation directory. */
  public async downloadAvatar(
    id: string,
    size: number,
    hash: string | undefined,
    cwd: string,
    options: DownloadOptions,
  ) {
    system.userId(id);
    system.integer(size);
    return this.#download(
      `/app/rest/avatars/${idPath(id, "User ID")}/${size}/avatar${hash === undefined ? "" : "." + encodeURIComponent(requiredText(hash, "Avatar hash"))}.png`,
      {},
      cwd,
      { ...options, name: "avatar.png" },
      "png",
    );
  }
  /** Save verified bytes without overwriting; cwd is the captured invocation directory. */
  public async downloadStatusIcon(
    id: string,
    aggregate: boolean,
    count: number,
    cwd: string,
    options: DownloadOptions,
  ) {
    const locator = aggregate
      ? joinLocator(nestedId("buildType", id, "Job ID"), `count:${normalizePage({ limit: count }).limit}`)
      : "id:" + integerId(id, "Build ID");
    return this.#download(
      "/app/rest/builds/" + (aggregate ? "aggregated/" : "") + locator + "/statusIcon.svg",
      {},
      cwd,
      { ...options, name: "statusIcon.svg" },
      "svg",
    );
  }
  /** Save verified bytes without overwriting; cwd is the captured invocation directory. */
  public async downloadSource(
    id: string,
    path: string,
    cwd: string,
    options: DownloadOptions,
  ) {
    return this.#download(
      "/app/rest/builds/id:" +
        integerId(id, "Build ID") +
        "/sources/files/" +
        files.remotePath(path),
      {},
      cwd,
      { ...options, name: path.split("/").at(-1)! },
      "bytes",
    );
  }
  public async getSettingsPath<F extends string | undefined = undefined>(kind: "projects" | "jobs" | "roots", id: string, fields?: F) {
    const resource = kind === "jobs" ? "buildTypes" : kind === "roots" ? "vcs-roots" : "projects";
    const nativeResponse = await this.#requestText("GET", "/app/rest/" + resource + "/" + idPath(id, "Owner ID") + "/settingsFile");
    return this.#projectedValue(nativeResponse, fields, () => {
      return files.serverPath(
        nativeResponse,
      );
    });
  }
  public async getArtifactsPath<F extends string | undefined = undefined>(id: string, fields?: F) {
    const nativeResponse = await this.#requestText("GET", "/app/rest/builds/id:" + integerId(id, "Build ID") + "/artifactsDirectory");
    return this.#projectedValue(nativeResponse, fields, () => {
      return files.serverPath(
        nativeResponse,
      );
    });
  }
  public async createSecureReference(
    project: string,
    inputAlias: string | undefined,
    outputAlias: string,
    secrets: ScopedSecrets,
    plainValue?: string,
  ) {
    secrets = this.#rememberSecrets(secrets);
    const path = "/app/rest/projects/" + idPath(project, "Project ID") + "/secure/tokens",
      key = files.referenceKey(outputAlias);
    await preflightSecretKeys(secrets, [key]);
    const value = await inputValue(secrets, inputAlias, plainValue);
    const reference = await this.#requestText("POST", path, value);
    await persistSecretKeys(secrets, [key], [reference]);
    return this.#maskValue({ projectId: project, referenceAlias: outputAlias, stored: true });
  }
  public async resolveSecureReference(
    project: string,
    referenceAlias: string | undefined,
    outputAlias: string,
    secrets: ScopedSecrets,
    referenceValue?: string,
  ) {
    secrets = this.#rememberSecrets(secrets);
    const path = "/app/rest/projects/" + idPath(project, "Project ID") + "/secure/values/",
      key = inputSecretKey(outputAlias);
    await preflightSecretKeys(secrets, [key]);
    let reference = referenceValue;
    if (reference === undefined) {
      if (referenceAlias === undefined) throw new Error("Supply a reference value or a secure-reference alias.");
      const referenceKey = files.referenceKey(referenceAlias);
      try {
        reference = await secrets.require(referenceKey);
      } catch (cause) {
        throw new Error("Required secure reference is unavailable.", { cause: diagnosticCause(cause) });
      }
    }
    const value = await this.#requestText("GET", path + files.sensitiveSegment(reference));
    await persistSecretKeys(secrets, [key], [value]);
    return this.#maskValue({ alias: outputAlias, stored: true });
  }
  public async resolveBuildParameter(
    id: string,
    name: string,
    alias: string,
    secrets: ScopedSecrets,
  ) {
    secrets = this.#rememberSecrets(secrets);
    const buildId = integerId(id, "Build ID");
    requiredText(name, "Parameter name");
    const expression = "%" + name + "%",
      key = inputSecretKey(alias);
    await preflightSecretKeys(secrets, [key]);
    const value = await this.#requestText(
      "GET",
      `/app/rest/builds/id:${buildId}/resolved/` + encodeURIComponent(expression),
    );
    await persistSecretKeys(secrets, [key], [value]);
    return this.#maskValue({ alias, stored: true });
  }
  async #download(
    path: string,
    query: Record<string, string>,
    cwd: string,
    options: DownloadOptions & { name: string },
    format: files.DownloadFormat,
  ) {
    const accept = format === "png" ? "image/png" : format === "svg" ? "image/svg+xml" : "*/*";
    return saveDownload(
      cwd,
      options,
      format,
      () => this.#response("GET", path, query, undefined, accept),
      response => this.#httpError(response),
      this.#signal,
    );
  }
  async #response(
    method: HttpMethod,
    path: string,
    query: Record<string, string> = {},
    body?: unknown,
    mediaType = "application/json",
    accept = mediaType,
  ): Promise<Response> {
    const requestPath = this.#guest
      ? path.replace(/^\/app\/rest(?=\/|$)/, "/guestAuth/app/rest")
      : path;
    const base = new URL(this.#baseUrl);
    const search = base.search;
    base.search = "";
    const url = new URL(`${base.href.replace(/\/+$/, "")}${requestPath}`);
    url.search = search;
    for (const [name, value] of Object.entries(query)) {
      url.searchParams.set(name, value);
    }
    const headers: Record<string, string> = { Accept: accept };
    if (this.#token) {
      headers.Authorization = `Bearer ${this.#token}`;
    }
    if (body !== undefined && !(body instanceof FormData)) {
      headers["Content-Type"] = mediaType;
    }
    let response: Response;
    try {
      response = await fetchWithRedirects(this.#fetch, url, {
        method,
        headers,
        ...(body === undefined
          ? {}
          : {
              body:
                body instanceof FormData
                  ? body
                  : mediaType === "text/plain"
                    ? String(body)
                    : JSON.stringify(body),
            }),
        ...(this.#signal === undefined ? {} : { signal: this.#signal }),
      });
    } catch (cause) {
      throw this.#lost(method, "request", cause);
    }
    return response;
  }
  /**
   * A request or response lost in transit. A write may have been applied, so its outcome is
   * unknown; a read changed nothing and can be retried, unless its own signal stopped it.
   */
  #lost(method: HttpMethod, stage: "request" | "response", cause?: unknown): Error {
    const safeCause = cause === undefined ? undefined : diagnosticCause(cause, [...this.#knownSecrets]);
    if (method !== "GET") {
      return new TeamCityUnknownOutcomeError(stage === "request"
        ? "TeamCity network request failed; remote outcome is unknown."
        : "TeamCity response stream failed; remote outcome is unknown.", safeCause);
    }
    if (this.#signal?.aborted === true) return new Error("The TeamCity request was stopped.", { cause: safeCause });
    return new CliError(stage === "request"
      ? "TeamCity could not be reached; nothing was changed, and the read can be retried."
      : "TeamCity's response was cut off; nothing was changed, and the read can be retried.",
    { code: "request.failed", cause: safeCause });
  }
  async #requestText(
    method: HttpMethod,
    path: string,
    body?: unknown,
    responseOptions: ResponseOptions = {},
  ): Promise<string> {
    return this.#request(method, path, {}, body, "text/plain", responseOptions);
  }
  // HTTP 204 means the server returned no value, which differs from an empty string.
  async #returnedText(path: string): Promise<string | undefined> {
    let status = 200;
    const text = await this.#requestText("GET", path, undefined, { status: s => { status = s; } });
    return status === 204 ? undefined : text;
  }
  async #request(
    method: HttpMethod,
    path: string,
    query: Record<string, string> = {},
    body?: unknown,
    mediaType = "application/json",
    responseOptions: ResponseOptions = {},
  ): Promise<string> {
    const response = await this.#response(
      method,
      path,
      query,
      body,
      mediaType,
      responseOptions.accept,
    );
    if (!response.ok) {
      throw await this.#httpError(response);
    }
    responseOptions.status?.(response.status);
    if (
      responseOptions.expectedStatus !== undefined &&
      response.status !== responseOptions.expectedStatus
    ) {
      void response.body?.cancel().catch(() => undefined);
      throw new TeamCityUnknownOutcomeError(
        "TeamCity returned an unexpected success status; remote outcome is unknown.",
      );
    }
    if (responseOptions.discard) {
      // Bounded drain works with intercepted/tee streams too; cancel the remainder without
      // waiting for a different tee consumer. Never decode, retain or expose these bytes.
      const reader = response.body?.getReader();
      if (reader) {
        let bytes = 0;
        try {
          while (bytes < 65536) {
            const chunk = await reader.read();
            if (chunk.done) break;
            bytes += chunk.value.byteLength;
          }
        } catch (cause) {
          throw this.#lost(method, "response", cause);
        } finally {
          void reader.cancel().catch(() => undefined);
          reader.releaseLock();
        }
      }
      return "";
    }
    try {
      const bytes = await readResponseBody(response, {
        signal: this.#signal,
      });
      return Buffer.from(bytes).toString("utf8");
    } catch (cause) {
      throw this.#lost(method, "response", cause);
    }
  }

  async #httpError(response: Response): Promise<HttpError> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8", { ignoreBOM: true });
    let text = "";
    let complete = !reader;
    // Three rounds of JSON escaping can expand a character sixfold per round.
    // Look past the output bound so encoded as well as literal copies can be masked first.
    let remaining = 4096 + Math.max(0, ...[...this.#knownSecrets].map(value => Buffer.byteLength(value) * 216));
    if (reader) {
      const cancel = () => { void reader.cancel().catch(() => undefined); };
      this.#signal?.addEventListener("abort", cancel, { once: true });
      try {
        if (this.#signal?.aborted) cancel();
        while (remaining > 0) {
          const chunk = await reader.read();
          if (chunk.done) {
            text += decoder.decode();
            complete = true;
            break;
          }
          const bytes = chunk.value.subarray(0, remaining);
          text += decoder.decode(bytes, { stream: true });
          remaining -= bytes.byteLength;
        }
      } catch {
        // A failed diagnostic read must retain the known HTTP status/classification.
      } finally {
        this.#signal?.removeEventListener("abort", cancel);
        void reader.cancel().catch(() => undefined);
        reader.releaseLock();
      }
    }
    // Only a cut can leave a secret's start at the end; a complete body is the server's own text.
    const masked = complete ? this.#maskText(text) : this.#dropSecretPrefix(this.#maskText(text));
    const bounded = new TextDecoder("utf-8", { ignoreBOM: true }).decode(
      Buffer.from(masked).subarray(0, 4096), { stream: true },
    );
    const explanation = Buffer.byteLength(masked) > 4096 ? this.#dropSecretPrefix(bounded) : bounded;
    return new HttpError(response.status,
      `TeamCity request failed with HTTP ${response.status}.${explanation === "" ? "" : " " + explanation}`);
  }
}

export type {
  TeamCityAgent,
  TeamCityBuild,
  TeamCityBuildState,
  TeamCityBuildStatus,
  TeamCityChange,
  TeamCityClientOptions,
  TeamCityJob,
  TeamCityPageOptions,
  TeamCityProblemOccurrence,
  TeamCityProject,
  TeamCityServer,
  TeamCityTestOccurrence,
  TeamCityTestStatus,
  TeamCityTriState,
  TeamCityUser,
} from "./models.js";
