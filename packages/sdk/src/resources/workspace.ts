import { Resource } from "./base.js";
import { WorkspaceResourceBase } from "./workspace.gen.js";
import { WorkspaceQuotasResource } from "./workspaceQuotas.gen.js";
import { WorkspaceRateLimitsResource } from "./workspaceRateLimits.gen.js";

export class WorkspaceResource extends WorkspaceResourceBase {
  readonly rateLimits: WorkspaceRateLimitsResource;
  readonly quotas: WorkspaceQuotasResource;

  constructor(...args: ConstructorParameters<typeof Resource>) {
    super(...args);
    this.rateLimits = new WorkspaceRateLimitsResource(...args);
    this.quotas = new WorkspaceQuotasResource(...args);
  }
}
