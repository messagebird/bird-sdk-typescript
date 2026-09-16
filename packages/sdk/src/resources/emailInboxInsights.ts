import { Resource } from "./base.js";
import { EmailInboxInsightsResourceBase } from "./emailInboxInsights.gen.js";
import { EmailInboxInsightsDomainsResource } from "./emailInboxInsightsDomains.gen.js";
import { EmailInboxInsightsDomainMonitoringResource } from "./emailInboxInsightsDomainMonitoring.gen.js";
import { EmailInboxInsightsBenchmarksResource } from "./emailInboxInsightsBenchmarks.gen.js";

export class EmailInboxInsightsResource extends EmailInboxInsightsResourceBase {
  readonly domains: EmailInboxInsightsDomainsResource;
  readonly domainMonitoring: EmailInboxInsightsDomainMonitoringResource;
  readonly benchmarks: EmailInboxInsightsBenchmarksResource;

  constructor(...args: ConstructorParameters<typeof Resource>) {
    super(...args);
    this.domains = new EmailInboxInsightsDomainsResource(...args);
    this.domainMonitoring = new EmailInboxInsightsDomainMonitoringResource(...args);
    this.benchmarks = new EmailInboxInsightsBenchmarksResource(...args);
  }
}
