import { Resource } from "./base.js";
import { EmailCompetitiveResourceBase } from "./emailCompetitive.gen.js";
import { EmailCompetitiveBrandsResource } from "./emailCompetitiveBrands.gen.js";
import { EmailCompetitiveWatchlistResource } from "./emailCompetitiveWatchlist.js";

export class EmailCompetitiveResource extends EmailCompetitiveResourceBase {
  readonly brands: EmailCompetitiveBrandsResource;
  readonly watchlist: EmailCompetitiveWatchlistResource;

  constructor(...args: ConstructorParameters<typeof Resource>) {
    super(...args);
    this.brands = new EmailCompetitiveBrandsResource(...args);
    this.watchlist = new EmailCompetitiveWatchlistResource(...args);
  }
}
