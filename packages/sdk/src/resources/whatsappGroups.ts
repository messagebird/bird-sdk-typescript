// `bird.whatsapp.groups` — WhatsApp groups: one chat a business number shares
// with up to 8 people who join by opening its invite link, and the four
// families hung off a group.

import { Resource } from "./base.js";
import { WhatsappGroupsResourceBase } from "./whatsappGroups.gen.js";
import { WhatsappGroupsInviteLinkResource } from "./whatsappGroupsInviteLink.gen.js";
import { WhatsappGroupsJoinRequestsResource } from "./whatsappGroupsJoinRequests.gen.js";
import { WhatsappGroupsParticipantsResource } from "./whatsappGroupsParticipants.gen.js";
import { WhatsappGroupsPinsResource } from "./whatsappGroupsPins.gen.js";

export class WhatsappGroupsResource extends WhatsappGroupsResourceBase {
  readonly inviteLink: WhatsappGroupsInviteLinkResource;

  readonly joinRequests: WhatsappGroupsJoinRequestsResource;

  readonly participants: WhatsappGroupsParticipantsResource;

  readonly pins: WhatsappGroupsPinsResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.inviteLink = new WhatsappGroupsInviteLinkResource(core, client);
    this.joinRequests = new WhatsappGroupsJoinRequestsResource(core, client);
    this.participants = new WhatsappGroupsParticipantsResource(core, client);
    this.pins = new WhatsappGroupsPinsResource(core, client);
  }
}
