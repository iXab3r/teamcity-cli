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

/** Match known values only; Core's diagnostic API also rewrites unrelated URLs and text. */
export function knownCredentialMask(credential: string): (text: string) => string {
  const representations = new Set([credential, JSON.stringify(credential).slice(1, -1)]);
  try {
    representations.add(encodeURIComponent(credential));
    representations.add(encodeURI(credential));
  } catch { /* A malformed Unicode value can still be matched as text. */ }
  const patterns = [...representations].filter(value => value !== "").sort((a, b) => b.length - a.length).map(value =>
    Array.from(value.matchAll(/%[\da-f]{2}|[\s\S]/gi), ([part]) => {
      if (/^%[\da-f]{2}$/i.test(part)) {
        return "%" + Array.from(part.slice(1), hex => `[${hex.toUpperCase()}${hex.toLowerCase()}]`).join("");
      }
      return `\\u{${part.codePointAt(0)!.toString(16)}}`;
    }).join(""));
  if (patterns.length === 0) return text => text;
  const pattern = new RegExp(patterns.join("|"), "gu");
  return text => text.replace(pattern, "[redacted]");
}
