import type { FetchOutcome } from "../core/http.js";

/**
 * A file downloaded from the compliance API: an uploaded attachment or a blank
 * form. `contentType` and `filename` are what the server declared for it.
 */
export interface ComplianceFile {
  data: Uint8Array;
  contentType: string;
  filename?: string;
}

export function complianceFileOutcome(outcome: FetchOutcome<unknown>): FetchOutcome<ComplianceFile> {
  const res = outcome.response;
  if (!res?.ok) return outcome as FetchOutcome<ComplianceFile>;
  return {
    data: {
      data: new Uint8Array(outcome.data as ArrayBuffer),
      contentType: res.headers.get("Content-Type") ?? "application/octet-stream",
      filename: dispositionFilename(res.headers.get("Content-Disposition")),
    },
    response: res,
  };
}

// The server sends an ASCII `filename` fallback and the RFC 5987 `filename*`
// original; the original wins when it is there.
function dispositionFilename(header: string | null): string | undefined {
  if (!header) return undefined;
  const extended = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(header)?.[1];
  if (extended) {
    try {
      return decodeURIComponent(extended.trim());
    } catch {}
  }
  const plain = /filename\s*=\s*"([^"]*)"|filename\s*=\s*([^;]+)/i.exec(header);
  const name = plain?.[1] ?? plain?.[2]?.trim();
  return name || undefined;
}
