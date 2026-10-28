import { Resource } from "./base.js";
import { OrganizationWorkspacesResource } from "./organizationWorkspaces.gen.js";

export class OrganizationResource extends Resource {
  readonly workspaces: OrganizationWorkspacesResource;

  constructor(...args: ConstructorParameters<typeof Resource>) {
    super(...args);
    this.workspaces = new OrganizationWorkspacesResource(...args);
  }
}
