import { Resource } from "./base.js";
import { AmbTemplatesResourceBase } from "./ambTemplates.gen.js";
import { AmbTemplatesVersionsResource } from "./ambTemplatesVersions.js";

export class AmbTemplatesResource extends AmbTemplatesResourceBase {
  readonly versions: AmbTemplatesVersionsResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.versions = new AmbTemplatesVersionsResource(core, client);
  }
}
