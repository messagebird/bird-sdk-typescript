import { Resource } from "./base.js";
import { SmsTemplatesResourceBase } from "./smsTemplates.gen.js";
import { SmsTemplatesVersionsResource } from "./smsTemplatesVersions.js";

export class SmsTemplatesResource extends SmsTemplatesResourceBase {
  readonly versions: SmsTemplatesVersionsResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.versions = new SmsTemplatesVersionsResource(core, client);
  }
}
