import { plainProperty } from "./authoring-models.js";
import { nestedId, idPath, integerId, requiredText } from "./locator.js";
import { allowedField } from "./advanced-authoring-models.js";

export const evidenceBuildFields = "id,buildTypeId,number,state,status";
export const problemFields = "id,type,identity";
export const testOccurrenceFields =
  "id,name,status,duration,ignored,currentlyMuted,test(id),build(id)";
export const problemOccurrenceFields = "id,type,identity,currentlyMuted,problem(id),build(id)";
export const muteFields =
  "id,assignment(text,timestamp),scope(project(id),buildTypes(buildType(id))),target(anyProblem,tests(test(id)),problems(problem(id))),resolution(type,time)";
export const investigationFields = muteFields.replace(
  "id,assignment",
  "id,state,assignee(id),assignment",
);
// TeamCity includes an item's failure message only when `text` is requested.
export const multipleFields = "count,errorCount,operationResult(text,related(build(id)))";
export const labelFields = "count,vcsLabel,text,status,buildId";

export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected an object; payload omitted.");
  return value as Record<string, unknown>;
}
export function inputRecord(value: unknown, keys: readonly string[]) {
  const item = object(value);
  if (Object.keys(item).some((k) => !keys.includes(k))) throw new Error("Unknown input field.");
  return item;
}
/** Native JSON bodies can grow; validate additional fields as JSON. */
export function apiInputRecord(value: unknown, known: readonly string[]) {
  const item = object(value);
  if (![Object.prototype, null].includes(Object.getPrototypeOf(item))) throw new Error("Expected a JSON object.");
  const ancestors = new Set<object>();
  const validate = (key: string, value: unknown): void => {
    if (value === null || typeof value === "string" || typeof value === "boolean") return;
    if (typeof value === "number" && Number.isFinite(value)) return;
    if (typeof value !== "object" || ancestors.has(value) ||
        (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value))))
      throw new Error("Expected JSON input values.");
    ancestors.add(value);
    if (Array.isArray(value)) for (const child of value) validate("item", child);
    else for (const [name, child] of Object.entries(value)) validate(name, child);
    ancestors.delete(value);
  };
  for (const [key, field] of Object.entries(item)) if (!known.includes(key)) validate(key, field);
  return item;
}
export function inputText(value: unknown, name: string): string {
  if (typeof value !== "string") throw new Error(`Expected text for ${name}.`);
  return plainProperty(name, requiredText(value, name)).value;
}
export function array(value: unknown): unknown[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error("Expected an array; payload omitted.");
  return value;
}
export function inputIds(value: unknown): string[] {
  const ids = array(value).map((v) => inputText(v, "ID"));
  return ids;
}
export function typedItems(value: readonly unknown[] = []): readonly unknown[] {
  return value;
}
export function safeScalars(value: unknown, keys: readonly string[]) {
  const raw = object(value);
  const result: Record<string, string | number | boolean> = {};
  for (const key of keys) {
    const field = raw[key];
    if (field === undefined) continue;
    if (
      !["string", "number", "boolean"].includes(typeof field) ||
      (typeof field === "number" &&
        (!Number.isFinite(field) || (key === "id" && !Number.isSafeInteger(field))))
    )
      throw new Error("Invalid scalar response; payload omitted.");
    result[key] = field as string | number | boolean;
  }
  return result;
}
export const safeEvidenceBuild = (value: unknown) =>
  safeScalars(value, ["id", "buildTypeId", "number", "state", "status"]);
export const safeEntity = (value: unknown, kind: "test" | "problem") =>
  safeScalars(value, kind === "test" ? ["id", "name"] : ["id", "type", "identity"]);
export function safeOccurrence(value: unknown, kind: "test" | "problem") {
  const raw = object(value);
  return {
    ...safeScalars(
      raw,
      kind === "test"
        ? ["id", "name", "status", "duration", "ignored", "currentlyMuted"]
        : ["id", "type", "identity", "currentlyMuted"],
    ),
    ...(raw[kind] === undefined ? {} : { [kind]: safeScalars(raw[kind], ["id"]) }),
    ...(raw.build === undefined ? {} : { build: safeScalars(raw.build, ["id"]) }),
  };
}
export function safeAssignment(value: unknown, investigation: boolean) {
  const raw = object(value);
  const result: Record<string, unknown> = safeScalars(
    raw,
    investigation ? ["id", "state"] : ["id"],
  );
  if (investigation && raw.assignee !== undefined)
    result.assignee = safeScalars(raw.assignee, ["id"]);
  if (raw.assignment !== undefined)
    result.assignment = safeScalars(raw.assignment, ["text", "timestamp"]);
  if (raw.resolution !== undefined)
    result.resolution = safeScalars(raw.resolution, ["type", "time"]);
  if (raw.scope !== undefined) {
    const scope = object(raw.scope);
    result.scope = {
      ...(scope.project === undefined ? {} : { project: safeScalars(scope.project, ["id"]) }),
      ...(scope.buildTypes === undefined
        ? {}
        : {
            buildTypes: {
              buildType: array(object(scope.buildTypes).buildType).map((v) =>
                safeScalars(v, ["id"]),
              ),
            },
          }),
    };
  }
  if (raw.target !== undefined) {
    const target = object(raw.target);
    result.target = {
      ...safeScalars(target, ["anyProblem"]),
      ...(target.tests === undefined
        ? {}
        : { tests: { test: array(object(target.tests).test).map((v) => safeScalars(v, ["id"])) } }),
      ...(target.problems === undefined
        ? {}
        : {
            problems: {
              problem: array(object(target.problems).problem).map((v) => safeScalars(v, ["id"])),
            },
          }),
    };
  }
  return result;
}
export function safeMultiple(value: unknown) {
  const raw = object(value);
  const count = raw.count;
  const errorCount = raw.errorCount;
  if (
    typeof count !== "number" ||
    typeof errorCount !== "number" ||
    !Number.isSafeInteger(count) ||
    !Number.isSafeInteger(errorCount) ||
    count < 0 ||
    errorCount < 0 ||
    errorCount > count
  )
    throw new Error("Invalid multiple-operation counts; success is unknown.");
  // TeamCity attaches a message only to a failed item; the message itself is never exposed.
  const items = array(raw.operationResult).map((v) => {
    const result = object(v);
    const build = result.related === undefined ? undefined : object(result.related).build;
    return {
      ...(build === undefined ? {} : { buildId: safeScalars(build, ["id"]).id }),
      succeeded: result.message === undefined,
    };
  });
  if (items.length !== count || items.filter((item) => !item.succeeded).length !== errorCount)
    throw new Error("Invalid multiple-operation results; success is unknown.");
  return { count, errorCount, items };
}
export function buildUnion(ids: readonly number[]) {
  const values = ids.map((id) => integerId(id, "Build ID"));
  if (!values.length) throw new Error("At least one build ID is required for the URL.");
  return values.map((id) => `item:(id:${id})`).join(",");
}
export function investigationTarget(value: unknown): { locator: string } {
  const supplied = object(value);
  if (supplied.kind === undefined) return { locator: investigationLocator(supplied) };
  const input = inputRecord(value, ["kind", "jobId", "projectId", "testId", "problemId"]);
  const kind = allowedField(inputText(input.kind, "Target kind"), ["job", "test", "problem"]);
  if (kind === "job") {
    if (
      input.projectId !== undefined ||
      input.testId !== undefined ||
      input.problemId !== undefined
    )
      throw new Error("Job target cannot include a project/test/problem.");
    const id = inputText(input.jobId, "Job ID");
    return {
      locator: nestedId("buildType", id, "Job ID"),
    };
  }
  if (input.jobId !== undefined || input[kind === "test" ? "problemId" : "testId"] !== undefined)
    throw new Error("Exactly one investigation target is required.");
  const projectId = inputText(input.projectId, "Project ID");
  const id = inputText(input[kind + "Id"], "Target ID");
  return {
    locator: `${nestedId("assignmentProject", projectId, "Project ID")},${nestedId(kind, id, "Target ID")}`,
  };
}
export function investigationBody(value: unknown = {}) {
  const input = apiInputRecord(value, []);
  const { comment, ...native } = input;
  const targetInput = input.target == null ? undefined : object(input.target);
  const compact = targetInput?.kind === "job" || targetInput?.kind === "test" || targetInput?.kind === "problem";
  let scope: Record<string, unknown> = {};
  let target: Record<string, unknown> = {};
  if (compact) {
    const { kind, jobId, projectId, testId, problemId, ...extra } = targetInput!;
    scope = {
      ...(jobId === undefined ? {} : { buildTypes: { buildType: [{ id: inputText(jobId, "Job ID") }] } }),
      ...(projectId === undefined ? {} : { project: { id: inputText(projectId, "Project ID") } }),
    };
    target = {
      ...(kind === "job" ? { anyProblem: true } : {}),
      ...(testId === undefined ? {} : { tests: { test: [{ id: inputText(testId, "Test ID") }] } }),
      ...(problemId === undefined ? {} : { problems: { problem: [{ id: inputText(problemId, "Problem ID") }] } }),
      ...extra,
    };
  }
  const assignee = input.assignee == null ? input.assignee
    : typeof input.assignee === "number" ? { id: Number(integerId(input.assignee, "Assignee")) }
    : apiInputRecord(input.assignee, []);
  return {
    body: {
      ...(!compact ? {} : { scope, target }),
      ...(comment === undefined ? {} : { assignment: { text: inputText(comment, "Comment") } }),
      ...native,
      ...(!compact ? {} : { target }),
      ...(assignee === undefined ? {} : { assignee }),
      ...(typeof input.resolution === "string" ? { resolution: { type: input.resolution } } : {}),
    },
  };
}
export function muteBody(value: unknown = {}) {
  const input = apiInputRecord(value, []);
  const { project, jobs, tests, problems, time, comment, resolution, ...native } = input;
  return {
    ...(project === undefined && jobs === undefined ? {} : { scope: {
      ...(project === undefined ? {} : { project: { id: inputText(project, "Project ID") } }),
      ...(jobs === undefined ? {} : { buildTypes: { buildType: inputIds(jobs).map(id => ({ id })) } }),
    } }),
    ...(tests === undefined && problems === undefined ? {} : { target: {
      ...(tests === undefined ? {} : { tests: { test: inputIds(tests).map(id => ({ id })) } }),
      ...(problems === undefined ? {} : { problems: { problem: inputIds(problems).map(id => ({ id })) } }),
    } }),
    ...(comment === undefined ? {} : { assignment: { text: inputText(comment, "Comment") } }),
    ...(resolution === undefined && time === undefined ? {} : { resolution: typeof resolution === "object" ? resolution : {
      ...(resolution === undefined ? {} : { type: inputText(resolution, "Resolution") }),
      ...(time === undefined ? {} : { time: inputText(time, "Time") }),
    } }),
    ...native,
  };
}

/** Replacement needs one URL target; creation forwards even incomplete DTOs. */
export function investigationLocator(value: unknown): string {
  const body = object(value);
  if (body.id !== undefined) return idPath(typeof body.id === "number" ? integerId(body.id, "Investigation ID") : inputText(body.id, "Investigation ID"), "Investigation ID");
  const scope = object(body.scope);
  const target = object(body.target);
  const jobs = scope.buildTypes === undefined ? [] : array(object(scope.buildTypes).buildType);
  const tests = target.tests === undefined ? [] : array(object(target.tests).test);
  const problems = target.problems === undefined ? [] : array(object(target.problems).problem);
  if (jobs.length > 1 || tests.length + problems.length > 1)
    throw new Error("Select one investigation URL target.");
  const dimensions = [
    ...(scope.project === undefined ? [] : [nestedId("assignmentProject", inputText(object(scope.project).id, "Project ID"), "Project ID")]),
    ...jobs.map(job => nestedId("buildType", inputText(object(job).id, "Job ID"), "Job ID")),
    ...tests.map(test => nestedId("test", inputText(object(test).id, "Test ID"), "Test ID")),
    ...problems.map(problem => nestedId("problem", inputText(object(problem).id, "Problem ID"), "Problem ID")),
  ];
  if (!dimensions.length) throw new Error("Select one investigation URL target.");
  return dimensions.join(",");
}
