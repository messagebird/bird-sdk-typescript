import { Resource } from "./base.js";
import { EmailInboxInsightsSeedTestsResourceBase } from "./emailInboxInsightsSeedTests.gen.js";
import { EmailInboxInsightsSeedTestsConfigurationResource } from "./emailInboxInsightsSeedTestsConfiguration.gen.js";

export class EmailInboxInsightsSeedTestsResource extends EmailInboxInsightsSeedTestsResourceBase {
  readonly configuration: EmailInboxInsightsSeedTestsConfigurationResource;

  constructor(...args: ConstructorParameters<typeof Resource>) {
    super(...args);
    this.configuration = new EmailInboxInsightsSeedTestsConfigurationResource(...args);
  }
}
