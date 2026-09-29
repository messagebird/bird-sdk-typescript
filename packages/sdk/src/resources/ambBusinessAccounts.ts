import { AmbBusinessAccountsResourceBase } from "./ambBusinessAccounts.gen.js";
import { AmbBusinessAccountsEventsResource } from "./ambBusinessAccountsEvents.gen.js";
import { AmbBusinessAccountsSettingsResource } from "./ambBusinessAccountsSettings.gen.js";
import { AmbBusinessAccountsSubmissionsResource } from "./ambBusinessAccountsSubmissions.gen.js";

export class AmbBusinessAccountsResource extends AmbBusinessAccountsResourceBase {
  readonly events: AmbBusinessAccountsEventsResource;
  readonly settings: AmbBusinessAccountsSettingsResource;
  readonly submissions: AmbBusinessAccountsSubmissionsResource;
  constructor(
    ...args: ConstructorParameters<typeof AmbBusinessAccountsResourceBase>
  ) {
    super(...args);
    this.events = new AmbBusinessAccountsEventsResource(...args);
    this.settings = new AmbBusinessAccountsSettingsResource(...args);
    this.submissions = new AmbBusinessAccountsSubmissionsResource(...args);
  }
}
