// `bird.whatsapp` — the WhatsApp channel: send WhatsApp messages and read their
// status and events.

import { createWhatsAppMessage } from "../generated/sdk.gen.js";
import type {
  WhatsAppMessageSendRequest,
  WhatsAppMessage,
} from "../generated/types.gen.js";
import { WhatsappResourceBase } from "./whatsapp.gen.js";
import { WhatsappMessagesResource } from "./whatsappMessages.js";
import { Resource } from "./base.js";
import type { APIPromise, RequestOptions } from "../core/result.js";

/** Body for `bird.whatsapp.send` — a template send, or one free-form content arm. */
export type WhatsappSendParams = WhatsAppMessageSendRequest;

export class WhatsappResource extends WhatsappResourceBase {
  /** Subresources of one message — `bird.whatsapp.messages.media(...)`. */
  readonly messages: WhatsappMessagesResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.messages = new WhatsappMessagesResource(core, client);
  }

  /**
   * Send one message, carrying exactly one kind of content: a template, or
   * free-form `text`, `image`, `video`, `audio`, `sticker`, `document`,
   * `location`, `contact_cards` or `interactive` — the last being the arm that
   * gives the recipient something to tap: reply buttons, a list menu, a link
   * button, media cards, or a request for their location or contact details.
   * `contact_cards` sends up to five contact cards: a card's `name` needs
   * `formatted_name` plus at least one other part, and a `phone_number` in
   * E.164 earns the card a button that opens a chat. Set
   * `in_reply_to_message_id` to quote an earlier message from the same
   * conversation. Every send but a Bird-managed
   * template needs `from`, a number this workspace owns. The result is
   * `accepted`, not yet delivered — read it back with `get` to confirm.
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
