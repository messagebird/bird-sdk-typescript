// `bird.sms.messages` — operations scoped to one SMS message. The
// channel's own message verbs stay on `bird.sms` (send, get, list); this
// namespace holds the subresources a single message owns.

import { getSmsMessageMedia } from "../generated/sdk.gen.js";
import { fetchStorage, mediaFrom } from "./whatsappMessages.js";
import { Resource } from "./base.js";
import type { APIPromise, RequestOptions } from "../core/result.js";
import type { FetchOutcome } from "../core/http.js";
import { BirdConnectionError } from "../errors.js";

/**
 * Media downloaded from a received MMS message. `contentType` is what
 * storage declared, which is the message's own `mime_type`.
 */
export interface SmsMediaDownload {
  data: Uint8Array;
  contentType: string;
  contentLength: number;
}

export class SmsMessagesResource extends Resource {
  /**
   * Download the media on a received MMS message: an image, video, audio
   * clip or document. `mediaId` is the `id` on the message's media
   * entry, which `bird.sms.get` returns.
   *
   * Media expires with its message, 30 days after it arrives, and this throws a
   * 404 from then on. A 410 means only the file expired: the message still lists
   * the media's `mime_type` and `filename`. Messages sent through Bird carry no
   * stored media.
   *
   * @example
   * const media = await bird.sms.messages.media(
   *   "sms_01kya19eknftrs2s6p82asmvnh",
   *   "smf_01kyb2m4xq7whs0d8n3prv6tez",
   * );
   * console.log(media.contentType, media.contentLength);
   */
  media(
    messageId: string,
    mediaId: string,
    options?: RequestOptions,
  ): APIPromise<SmsMediaDownload> {
    return this.call<SmsMediaDownload>(
      "GET",
      options,
      async ({ signal, headers }): Promise<FetchOutcome<SmsMediaDownload>> => {
        const outcome = await getSmsMessageMedia({
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
        if (!res) return outcome as FetchOutcome<SmsMediaDownload>;
        if (res.status !== 302) {
          // A failure falls through untouched so the core maps it; a 2xx is an
          // edge answering with the bytes directly, which is also the only arm
          // the conformance corpus can script (its responses carry no headers).
          if (!res.ok) return outcome as FetchOutcome<SmsMediaDownload>;
          return {
            data: mediaFrom(res, outcome.data as ArrayBuffer),
            response: res,
          };
        }
        const location = res.headers.get("Location");
        if (!location) {
          throw new BirdConnectionError(
            "media redirect carried no Location header",
          );
        }
        const stored = await fetchStorage(
          this.client.getConfig().fetch ?? fetch,
          location,
          signal,
          "media",
        );
        return { data: mediaFrom(stored.response, stored.body), response: res };
      },
      undefined,
      302,
    );
  }
}
