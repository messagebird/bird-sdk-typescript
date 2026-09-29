import { AmbResourceBase } from "./amb.gen.js";
import { AmbBusinessAccountsResource } from "./ambBusinessAccounts.js";
import { AmbConversationsResource } from "./ambConversations.gen.js";
import { AmbRoutingRulesResource } from "./ambRoutingRules.gen.js";
import { AmbStatsResource } from "./ambStats.js";
import { AmbSuppressionsResource } from "./ambSuppressions.gen.js";

export class AmbResource extends AmbResourceBase {
  readonly businessAccounts: AmbBusinessAccountsResource;
  readonly conversations: AmbConversationsResource;
  readonly routingRules: AmbRoutingRulesResource;
  readonly stats: AmbStatsResource;
  readonly suppressions: AmbSuppressionsResource;
  constructor(...args: ConstructorParameters<typeof AmbResourceBase>) {
    super(...args);
    this.businessAccounts = new AmbBusinessAccountsResource(...args);
    this.conversations = new AmbConversationsResource(...args);
    this.routingRules = new AmbRoutingRulesResource(...args);
    this.stats = new AmbStatsResource(...args);
    this.suppressions = new AmbSuppressionsResource(...args);
  }
}
