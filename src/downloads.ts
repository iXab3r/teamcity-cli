import {
  FilePublicationError,
  publishFile,
  type StagedFile,
} from "@eyeauras/cli-factory";
import type { DownloadFormat } from "./file-models.js";
import { integer } from "./system-models.js";

export interface DownloadOptions {
  output?: string;
  maxBytes?: number;
}

function mediaType(response: Response, format: DownloadFormat) {
  const media = (response.headers.get("Content-Type") ?? "application/octet-stream")
    .split(";")[0]!
    .trim()
    .toLowerCase();
  if (!/^[!#$%&'*+.^_`|~a-z0-9-]+\/[!#$%&'*+.^_`|~a-z0-9-]+$/.test(media)) {
    throw new Error("Invalid download media type.");
  }
  const allowed =
    format === "png"
      ? ["image/png"]
      : format === "zip"
        ? ["application/zip", "application/x-zip-compressed", "application/octet-stream"]
        : undefined;
  if (allowed && !allowed.includes(media)) {
    throw new Error("Unexpected download media type.");
  }
  return media;
}

async function verifyFormat(file: StagedFile, format: DownloadFormat) {
  const prefix = Buffer.from(file.prefix);
  if (
    format === "png" &&
    !prefix.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    throw new Error("Invalid PNG signature.");
  }
  if (
    format === "zip" &&
    !(
      prefix[0] === 80 &&
      prefix[1] === 75 &&
      ((prefix[2] === 3 && prefix[3] === 4) ||
        (prefix[2] === 5 && prefix[3] === 6) ||
        (prefix[2] === 7 && prefix[3] === 8))
    )
  ) {
    throw new Error("Invalid ZIP signature.");
  }
}

/**
 * Save one TeamCity file at the invocation destination. When TeamCity refuses it, `refused` turns the status
 * into the client's HTTP error, unless Core's staging cleanup warning must be reported instead.
 */
export async function saveDownload(
  cwd: string,
  options: DownloadOptions & { name: string },
  format: DownloadFormat,
  openResponse: () => Promise<Response>,
  refused: (response: Response) => Promise<Error>,
  signal?: AbortSignal,
) {
  const name = options.name;
  const maxBytes = options.maxBytes === undefined
    ? undefined
    : integer(options.maxBytes);
  if (maxBytes !== undefined && maxBytes < 1) throw new Error("Download byte limit must be positive.");
  let media = "application/octet-stream";
  let refusal: Error | undefined;
  try {
    const saved = await publishFile({
      cwd,
      output: options.output,
      name,
      maxBytes,
      signal,
      openResponse,
      async inspectResponse(response) {
        // These are whole-file requests: no Range, resume or partial-response reassembly.
        if (!response.ok) {
          refusal = await refused(response);
          throw new FilePublicationError(refusal.message);
        }
        if (response.status === 206) {
          throw new FilePublicationError(
            "Download failed, was partial, or was cancelled; no destination was published.",
          );
        }
        media = mediaType(response, format);
      },
      validateFile: (file) => verifyFormat(file, format),
    });
    return { ...saved, mediaType: media };
  } catch (error) {
    if (refusal !== undefined && error instanceof FilePublicationError && !error.cleanupFailed) {
      throw refusal;
    }
    throw error;
  }
}
