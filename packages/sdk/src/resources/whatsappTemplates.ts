// `bird.whatsapp.templates` — the workspace's WhatsApp template registry: the
// templates a send can name, and the versions and languages under each one.

import { Resource } from "./base.js";
import { WhatsappTemplatesResourceBase } from "./whatsappTemplates.gen.js";
import { WhatsappTemplatesVersionsResource } from "./whatsappTemplatesVersions.js";

export class WhatsappTemplatesResource extends WhatsappTemplatesResourceBase {
  /** One template's versions — `bird.whatsapp.templates.versions.list(...)`, `.get(...)`. */
  readonly versions: WhatsappTemplatesVersionsResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.versions = new WhatsappTemplatesVersionsResource(core, client);
  }
}
