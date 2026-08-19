// `bird.sms.stats` — aggregate statistics over the workspace's own SMS traffic.

import { Resource } from "./base.js";
import { SmsStatsResourceBase } from "./smsStats.gen.js";
import { SmsStatsInboundResource } from "./smsStatsInbound.gen.js";

export class SmsStatsResource extends SmsStatsResourceBase {
  /** Received-message statistics — `bird.sms.stats.inbound.summary(...)`, `.byNumber(...)`, … */
  readonly inbound: SmsStatsInboundResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.inbound = new SmsStatsInboundResource(core, client);
  }
}
