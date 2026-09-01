// `bird.whatsapp.messages` — operations scoped to one WhatsApp message. The
// channel's own message verbs stay on `bird.whatsapp` (send, get, list); this
// namespace holds the subresources a single message owns.

import { getWhatsAppMessageMedia } from "../generated/sdk.gen.js";
import { Resource } from "./base.js";
import type { APIPromise, RequestOptions } from "../core/result.js";
import type { FetchOutcome } from "../core/http.js";
import { BirdConnectionError } from "../errors.js";

/**
 * Media downloaded from a received WhatsApp message. `contentType` is what
 * storage declared, which is the message's own `mime_type`.
 */
export interface WhatsappMedia {
  data: Uint8Array;
  contentType: string;
  contentLength: number;
}

export class WhatsappMessagesResource extends Resource {
  /**
   * Download the media on a received WhatsApp message — an image, video, audio
   * clip, sticker or document. `mediaId` is the `id` on the message's content
   * object, which `bird.whatsapp.get` returns.
   *
   * Media is kept for 30 days after the message arrives; after that the message
   * still lists the media's `mime_type` and `caption`, and this throws. Outbound
   * messages carry no stored media.
   *
   * @example
   * const media = await bird.whatsapp.messages.media(
   *   "wam_01kya19eknftrs2s6p82asmvnh",
   *   "waf_01kyb2m4xq7whs0d8n3prv6tez",
   * );
   * console.log(media.contentType, media.contentLength);
   */
  media(
    messageId: string,
    mediaId: string,
    options?: RequestOptions,
  ): APIPromise<WhatsappMedia> {
    return this.call<WhatsappMedia>(
      "GET",
      options,
      async ({ signal, headers }): Promise<FetchOutcome<WhatsappMedia>> => {
        const outcome = await getWhatsAppMessageMedia({
          client: this.client,
          path: { message_id: messageId, media_id: mediaId },
          headers,
          signal,
          // Stop here rather than let fetch follow: the target is pre-authorized
          // and this client's Authorization header must not reach it.
          redirect: "manual",
          parseAs: "arrayBuffer",
        });
        const res = outcome.response;
        if (!res) return outcome as FetchOutcome<WhatsappMedia>;
        if (res.status !== 302) {
          // A failure falls through untouched so the core maps it; a 2xx is an
          // edge answering with the bytes directly, which is also the only arm
          // the conformance corpus can script (its responses carry no headers).
          if (!res.ok) return outcome as FetchOutcome<WhatsappMedia>;
          return { data: mediaFrom(res, outcome.data as ArrayBuffer), response: res };
        }
        const location = res.headers.get("Location");
        if (!location) {
          throw new BirdConnectionError("media redirect carried no Location header");
        }
        const stored = await fetchStorage(this.client.getConfig().fetch ?? fetch, location, signal);
        return { data: mediaFrom(stored.response, stored.body), response: res };
      },
      undefined,
      302,
    );
  }
}

/**
 * The second leg. Not a Bird API request — a different host, a credential of
 * its own, and an XML error body that is no Bird error envelope — so it runs
 * outside the request core and its failures surface as connection errors.
 * Running a storage 403 through the API error mapper would report the caller's
 * own key as lacking permission, which is not what happened.
 *
 * It reuses the client's configured `fetch` (a proxy or edge adapter still
 * applies) but sends no headers at all, which is what keeps the credential off
 * the wire.
 */
async function fetchStorage(
  fetchFn: typeof fetch,
  location: string,
  signal: AbortSignal,
): Promise<{ response: Response; body: ArrayBuffer }> {
  let response: Response;
  try {
    response = await fetchFn(location, { signal });
  } catch (err) {
    if (signal.aborted) throw err;
    const detail = err instanceof Error ? err.message : String(err);
    throw new BirdConnectionError(
      `downloading media failed: ${detail} — call media again for a fresh link`,
    );
  }
  if (!response.ok) {
    throw new BirdConnectionError(
      `storage refused the download link (status ${response.status}) — the link expired or was refused; call media again for a fresh link`,
    );
  }
  return { response, body: await response.arrayBuffer() };
}

function mediaFrom(response: Response, body: ArrayBuffer): WhatsappMedia {
  const data = new Uint8Array(body);
  return {
    data,
    contentType: response.headers.get("Content-Type") ?? "application/octet-stream",
    contentLength: data.length,
  };
}
