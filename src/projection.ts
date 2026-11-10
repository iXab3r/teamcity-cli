import type { OptionDefinition } from "@eyeauras/cli-factory";

/** Validate presence only; TeamCity owns the projection syntax. */
export function fieldsProjection(value: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("Expected a non-empty fields projection.");
  }
  return value;
}

export const fieldsOption: OptionDefinition = {
  flags: "--fields <projection>",
  description: "Select native TeamCity fields",
  parse: fieldsProjection,
};

/** Read the native projection from a command leaf. */
export function fieldsFromOptions(options: Readonly<Record<string, unknown>>): string | undefined {
  return options.fields as string | undefined;
}
