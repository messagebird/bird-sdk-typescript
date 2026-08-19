// `bird.email.mailboxes` — the generated mailbox facade plus its nested
// collections (messages, receiveRules), which a generated class can't declare.

import { Resource } from "./base.js";
import type { EmailChannelDefaults } from "./emailDefaults.js";
import { EmailMailboxesResourceBase } from "./emailMailboxes.gen.js";
import { EmailMailboxesMessagesResource } from "./emailMailboxesMessages.js";
import { EmailMailboxesReceiveRulesResource } from "./emailMailboxesReceiveRules.gen.js";

export class EmailMailboxesResource extends EmailMailboxesResourceBase {
  /** Messages sent from the mailbox's own address — `bird.email.mailboxes.messages.create(...)`. */
  readonly messages: EmailMailboxesMessagesResource;

  /** Per-sender allow/block rules — `bird.email.mailboxes.receiveRules.create(...)`, `.list(...)`, `.delete(...)`. */
  readonly receiveRules: EmailMailboxesReceiveRulesResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
    defaults?: EmailChannelDefaults,
  ) {
    super(core, client);
    this.messages = new EmailMailboxesMessagesResource(core, client, defaults);
    this.receiveRules = new EmailMailboxesReceiveRulesResource(core, client);
  }
}
