import { parseServerUrl } from "@eyeauras/cli-factory";

export const teamCityUrlHelp = "Set URL: http(s)://host[:port][/context]";

export function teamCityUrl(value: unknown): string {
  const message = "TeamCity URL must be http(s)://host[:port][/context], without credentials or a fragment.";
  if (typeof value !== "string") throw new Error(message);
  const text = value.trim();
  if (text.includes("#") || /[\\\u0000-\u0020\u007f]/.test(text)) throw new Error(message);
  const query = text.indexOf("?");
  const url = parseServerUrl(query < 0 ? text : text.slice(0, query), message);
  return url.href.replace(/\/+$/, "") + (query < 0 ? "" : text.slice(query));
}
