import { Resource } from "./base.js";
import { SmsTemplatesVersionsResourceBase } from "./smsTemplatesVersions.gen.js";
import { SmsTemplatesVersionsLanguagesResource } from "./smsTemplatesVersionsLanguages.gen.js";

export class SmsTemplatesVersionsResource extends SmsTemplatesVersionsResourceBase {
  readonly languages: SmsTemplatesVersionsLanguagesResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.languages = new SmsTemplatesVersionsLanguagesResource(core, client);
  }
}
