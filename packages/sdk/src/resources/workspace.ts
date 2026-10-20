import { Resource } from "./base.js";
import { WorkspaceResourceBase } from "./workspace.gen.js";
import { WorkspaceQuotasResource } from "./workspaceQuotas.gen.js";

export class WorkspaceResource extends WorkspaceResourceBase {
  readonly quotas: WorkspaceQuotasResource;

  constructor(...args: ConstructorParameters<typeof Resource>) {
    super(...args);
    this.quotas = new WorkspaceQuotasResource(...args);
  }
}
