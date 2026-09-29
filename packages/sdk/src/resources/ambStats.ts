import { AmbStatsResourceBase } from "./ambStats.gen.js";
import { AmbStatsConversationsResource } from "./ambStatsConversations.gen.js";
import { AmbStatsInboundResource } from "./ambStatsInbound.gen.js";

export class AmbStatsResource extends AmbStatsResourceBase {
  readonly conversations: AmbStatsConversationsResource;
  readonly inbound: AmbStatsInboundResource;
  constructor(...args: ConstructorParameters<typeof AmbStatsResourceBase>) {
    super(...args);
    this.conversations = new AmbStatsConversationsResource(...args);
    this.inbound = new AmbStatsInboundResource(...args);
  }
}
