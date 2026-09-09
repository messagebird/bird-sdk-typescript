// `bird.whatsapp.templates.versions` — one template's submissions. A version is
// where content lives; the template above it carries only the handle.

import { Resource } from "./base.js";
import { WhatsappTemplatesVersionsResourceBase } from "./whatsappTemplatesVersions.gen.js";
import { WhatsappTemplatesVersionsLanguagesResource } from "./whatsappTemplatesVersionsLanguages.gen.js";

export class WhatsappTemplatesVersionsResource extends WhatsappTemplatesVersionsResourceBase {
  /** One version's per-language content — `bird.whatsapp.templates.versions.languages.get(...)`. */
  readonly languages: WhatsappTemplatesVersionsLanguagesResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.languages = new WhatsappTemplatesVersionsLanguagesResource(core, client);
  }
}
