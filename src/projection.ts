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

/** Match known values only; decode copies without changing unrelated output. */
export function knownCredentialMask(credential: string): (text: string) => string {
  if (credential === "") return text => text;
  const escapes: Record<string, string> = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" };
  const percentDecode = (text: string) => text.replace(/(?:%[\da-f]{2})+/gi, encoded => {
    const parts: string[] = [];
    for (let start = 0; start < encoded.length;) {
      // Prefer UTF-8; decode individual bytes too, without a malformed neighbour hiding a match.
      const byte = Number.parseInt(encoded.slice(start + 1, start + 3), 16);
      const width = byte < 0x80 ? 1 : byte < 0xe0 ? 2 : byte < 0xf0 ? 3 : 4;
      const part = encoded.slice(start, start + width * 3);
      try {
        parts.push(decodeURIComponent(part));
        start += part.length;
      } catch {
        parts.push(String.fromCharCode(byte));
        start += 3;
      }
    }
    return parts.join("");
  });
  const unescape = (text: string) =>
    text.replace(/\\(?:u([\da-fA-F]{4})|["\\/bfnrt])/g, (escape: string, hex: string | undefined) =>
      hex === undefined ? escapes[escape[1]!]! : String.fromCharCode(Number.parseInt(hex, 16)));
  return text => {
    // Each step is checked on its own: a credential may itself contain an escape sequence.
    let forms = [text];
    for (let round = 0; round < 3 && forms.length > 0; round++) {
      const next = new Set<string>();
      for (const form of forms) {
        for (const decoded of [percentDecode(form), unescape(form)]) {
          if (decoded === form) continue;
          if (decoded.includes(credential)) return "[redacted]";
          next.add(decoded);
        }
      }
      forms = [...next];
    }
    return text.split(credential).join("[redacted]");
  };
}

/** Arbitrary TeamCity JSON requires validation before any shaped property access. */
export type NativeJson = unknown;
export type Projected<T, Fields extends string | undefined> = Fields extends undefined ? T : NativeJson;
