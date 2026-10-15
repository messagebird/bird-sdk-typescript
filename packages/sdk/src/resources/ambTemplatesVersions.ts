import { Resource } from "./base.js";
import { AmbTemplatesVersionsResourceBase } from "./ambTemplatesVersions.gen.js";
import { AmbTemplatesVersionsLanguagesResource } from "./ambTemplatesVersionsLanguages.gen.js";

export class AmbTemplatesVersionsResource extends AmbTemplatesVersionsResourceBase {
  readonly languages: AmbTemplatesVersionsLanguagesResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.languages = new AmbTemplatesVersionsLanguagesResource(core, client);
  }
}
