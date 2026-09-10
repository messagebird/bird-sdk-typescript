// `bird.whatsapp.stats` — aggregate statistics over the workspace's own WhatsApp traffic.

import { Resource } from "./base.js";
import { WhatsappStatsResourceBase } from "./whatsappStats.gen.js";
import { WhatsappStatsInboundResource } from "./whatsappStatsInbound.gen.js";

export class WhatsappStatsResource extends WhatsappStatsResourceBase {
  /** Received-message statistics — `bird.whatsapp.stats.inbound.summary(...)`, `.byPhoneNumber(...)`, … */
  readonly inbound: WhatsappStatsInboundResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.inbound = new WhatsappStatsInboundResource(core, client);
  }
}
