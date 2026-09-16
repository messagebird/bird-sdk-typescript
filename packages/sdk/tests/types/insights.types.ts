import { BirdClient, type EmailInboxInsightsDomainsUpdateParams, type EmailCompetitiveWatchlistBrandsCampaignsListQuery } from "../../src/index.js";
const bird = new BirdClient({ apiKey: "bk_eu1_test" });
const disabled: EmailInboxInsightsDomainsUpdateParams = { monitored: false };
void bird.email.inboxInsights.domains.update("example.com", disabled);
// @ts-expect-error monitored must be explicitly supplied
void bird.email.inboxInsights.domains.update("example.com", {});
const query: EmailCompetitiveWatchlistBrandsCampaignsListQuery = { ending_before: "previous", sort: "sent_at", order: "asc" };
void bird.email.competitive.watchlist.brands.campaigns.list("ecwb_test", query);
// @ts-expect-error sorting is a closed request enum
void bird.email.competitive.watchlist.brands.campaigns.list("ecwb_test", { order: "sideways" });
void bird.email.inboxInsights.domainMonitoring.upsert();
