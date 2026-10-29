import { Resource } from "./base.js";
import type { EmailChannelDefaults } from "./emailDefaults.js";
import { EmailMailboxesForwardingAddressResource } from "./emailMailboxesForwardingAddress.gen.js";
import { EmailMailboxesResourceBase } from "./emailMailboxes.gen.js";
import { EmailMailboxesMessagesResource } from "./emailMailboxesMessages.js";
import { EmailMailboxesReceiveRulesResource } from "./emailMailboxesReceiveRules.gen.js";

import { EmailMailboxesScheduledMessagesResource } from "./emailMailboxesScheduledMessages.gen.js";

export class EmailMailboxesResource extends EmailMailboxesResourceBase {
  readonly forwardingAddress: EmailMailboxesForwardingAddressResource;
  readonly scheduledMessages: EmailMailboxesScheduledMessagesResource;

  readonly messages: EmailMailboxesMessagesResource;

  /** Per-sender allow/block rules — `bird.email.mailboxes.receiveRules.create(...)`, `.list(...)`, `.delete(...)`. */
  readonly receiveRules: EmailMailboxesReceiveRulesResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
    defaults?: EmailChannelDefaults,
  ) {
    super(core, client);
    this.forwardingAddress = new EmailMailboxesForwardingAddressResource(
      core,
      client,
    );
    this.messages = new EmailMailboxesMessagesResource(core, client, defaults);
    this.scheduledMessages = new EmailMailboxesScheduledMessagesResource(
      core,
      client,
    );
    this.receiveRules = new EmailMailboxesReceiveRulesResource(core, client);
  }
}
