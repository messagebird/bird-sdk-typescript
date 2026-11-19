import { Resource } from "./base.js";
import { EmailSeedingAddressResource } from "./emailSeedingAddress.gen.js";
import { EmailSeedingRunsResource } from "./emailSeedingRuns.gen.js";
import { EmailSeedingSettingsResource } from "./emailSeedingSettings.gen.js";
import { EmailSeedingSourcesResource } from "./emailSeedingSources.gen.js";

/** Automatic email seeding — `bird.email.seeding.settings.get()`, `.address.rotate(...)`, `.runs.list(...)`, `.sources.list(...)`, … */
export class EmailSeedingResource {
  readonly settings: EmailSeedingSettingsResource;
  readonly address: EmailSeedingAddressResource;
  readonly runs: EmailSeedingRunsResource;
  readonly sources: EmailSeedingSourcesResource;

  constructor(...args: ConstructorParameters<typeof Resource>) {
    this.settings = new EmailSeedingSettingsResource(...args);
    this.address = new EmailSeedingAddressResource(...args);
    this.runs = new EmailSeedingRunsResource(...args);
    this.sources = new EmailSeedingSourcesResource(...args);
  }
}
