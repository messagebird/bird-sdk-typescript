// `bird.organization.workspaces` — the organization's workspaces. The workspace
// operations are generated on the base; this parent nests the multi-partner
// solution number connect, reached at `bird.organization.workspaces.whatsappNumbers`.

import { Resource } from "./base.js";
import { OrganizationWorkspacesResourceBase } from "./organizationWorkspaces.gen.js";
import { OrganizationWorkspacesWhatsappNumbersResource } from "./organizationWorkspacesWhatsappNumbers.gen.js";

export class OrganizationWorkspacesResource extends OrganizationWorkspacesResourceBase {
  readonly whatsappNumbers: OrganizationWorkspacesWhatsappNumbersResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.whatsappNumbers = new OrganizationWorkspacesWhatsappNumbersResource(core, client);
  }
}
