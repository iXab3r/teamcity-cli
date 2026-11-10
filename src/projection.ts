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
  const normalize = (text: string) => text.replace(/%[\da-f]{2}/gi, part => part.toUpperCase());
  const copies = [...representations].filter(value => value !== "").sort((a, b) => b.length - a.length).map(normalize);
  return text => {
    for (const copy of copies) {
      const normalized = normalize(text);
      const parts: string[] = [];
      let start = 0;
      for (let match = normalized.indexOf(copy); match !== -1; match = normalized.indexOf(copy, start)) {
        parts.push(text.slice(start, match), "[redacted]");
        start = match + copy.length;
      }
      parts.push(text.slice(start));
      text = parts.join("");
    }
    return text;
  };
}

/** Arbitrary TeamCity JSON requires validation before any shaped property access. */
export type NativeJson = unknown;
export type Projected<T, Fields extends string | undefined> = Fields extends undefined ? T : NativeJson;
