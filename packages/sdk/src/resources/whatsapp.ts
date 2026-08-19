// `bird.whatsapp` — the WhatsApp channel: send WhatsApp messages and read their
// status and events.

import { createWhatsAppMessage } from "../generated/sdk.gen.js";
import type {
  WhatsAppMessageSendRequest,
  WhatsAppMessage,
} from "../generated/types.gen.js";
import { WhatsappResourceBase } from "./whatsapp.gen.js";
import type { APIPromise, RequestOptions } from "../core/result.js";

/** Body for `bird.whatsapp.send` — a template send, or one free-form content arm. */
export type WhatsappSendParams = WhatsAppMessageSendRequest;

export class WhatsappResource extends WhatsappResourceBase {
  /**
   * Send one message, carrying exactly one kind of content: a template, or
   * free-form `text`, `image`, `video`, `audio`, `sticker`, `document` or
   * `location`. Every send but a Bird-managed template needs `from`, a number
   * this workspace owns. The result is `accepted`, not yet delivered — read it
   * back with `get` to confirm.
   *
   * @example
   * const msg = await bird.whatsapp.send({
   *   to: "+15551234567",
   *   template: {
   *     slug: "bird_otp",
   *     components: [{ type: "body", parameters: [{ type: "text", text: "123456" }] }],
   *   },
   * });
   * console.log(msg.id, msg.status);
   */
  send(
    params: WhatsappSendParams,
    options?: RequestOptions,
  ): APIPromise<WhatsAppMessage> {
    return this.call<WhatsAppMessage>("POST", options, ({ signal, headers }) =>
      createWhatsAppMessage({
        client: this.client,
        body: params,
        headers,
        signal,
      }),
    );
  }
}
