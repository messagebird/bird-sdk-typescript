import { AssetsResourceBase } from "./assets.gen.js";
import { AssetsFoldersResource } from "./assetsFolders.gen.js";
import { AssetsReferencesResource } from "./assetsReferences.gen.js";
import { Resource } from "./base.js";

export class AssetsResource extends AssetsResourceBase {
  readonly folders: AssetsFoldersResource;
  readonly references: AssetsReferencesResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.folders = new AssetsFoldersResource(core, client);
    this.references = new AssetsReferencesResource(core, client);
  }
}
