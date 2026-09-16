import { Resource } from "./base.js";
import { EmailCompetitiveWatchlistResourceBase } from "./emailCompetitiveWatchlist.gen.js";
import { EmailCompetitiveWatchlistBrandsResource } from "./emailCompetitiveWatchlistBrands.js";

export class EmailCompetitiveWatchlistResource extends EmailCompetitiveWatchlistResourceBase {
  readonly brands: EmailCompetitiveWatchlistBrandsResource;

  constructor(...args: ConstructorParameters<typeof Resource>) {
    super(...args);
    this.brands = new EmailCompetitiveWatchlistBrandsResource(...args);
  }
}
