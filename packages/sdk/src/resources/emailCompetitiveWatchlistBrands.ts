import { Resource } from "./base.js";
import { EmailCompetitiveWatchlistBrandsResourceBase } from "./emailCompetitiveWatchlistBrands.gen.js";
import { EmailCompetitiveWatchlistBrandsCampaignsResource } from "./emailCompetitiveWatchlistBrandsCampaigns.gen.js";

export class EmailCompetitiveWatchlistBrandsResource extends EmailCompetitiveWatchlistBrandsResourceBase {
  readonly campaigns: EmailCompetitiveWatchlistBrandsCampaignsResource;

  constructor(...args: ConstructorParameters<typeof Resource>) {
    super(...args);
    this.campaigns = new EmailCompetitiveWatchlistBrandsCampaignsResource(...args);
  }
}
