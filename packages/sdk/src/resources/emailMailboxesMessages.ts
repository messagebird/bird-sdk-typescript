// `bird.email.mailboxes.messages` — the override residue over the generated
// mailbox facade: create (address-list body).

import { createMailboxMessage } from "../generated/sdk.gen.js";
import type {
  EmailMailboxComposeRequest,
  EmailThreadMessage,
} from "../generated/types.gen.js";
import { Resource } from "./base.js";
import { withDefaults, type EmailChannelDefaults } from "./emailDefaults.js";
import type { APIPromise, RequestOptions } from "../core/result.js";

/** Parameters for sending a new message from a mailbox. */
export type EmailMailboxesMessagesCreateParams = EmailMailboxComposeRequest;
/** A message returned from create or reply. */
export type { EmailThreadMessage };

// A compose body rejects any field it does not declare — it has no `from` (the
// mailbox is the sender) and no sending-infrastructure fields — so only these
// defaults may be merged in. Exported for the type test, which fails if a
// default a compose accepts is missing here.
export const COMPOSE_FIELDS = ["reply_to", "category", "tags", "metadata"] as const;

export class EmailMailboxesMessagesResource extends Resource {
  #defaults?: EmailChannelDefaults;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
    defaults?: EmailChannelDefaults,
  ) {
    super(core, client);
    this.#defaults = defaults;
  }

  /**
   * Send a new email from this mailbox, starting a new conversation.
   *
   * @example Send from a mailbox
   * const msg = await bird.email.mailboxes.messages.create("mbx_01abc", {
   *   to: ["customer@example.com"],
   *   subject: "Hello",
   *   text: "Hi there!",
   * });
   */
  create(
    mailboxId: string,
    params: EmailMailboxesMessagesCreateParams,
    options?: RequestOptions,
  ): APIPromise<EmailThreadMessage> {
    const body = withDefaults(this.#defaults, params, COMPOSE_FIELDS);
    return this.call<EmailThreadMessage>("POST", options, ({ signal, headers }) =>
      createMailboxMessage({
        client: this.client,
        path: { mailbox_id: mailboxId },
        body,
        headers,
        signal,
      }),
    );
  }
}
