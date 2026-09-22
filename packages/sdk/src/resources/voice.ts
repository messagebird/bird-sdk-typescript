import { Resource } from "./base.js";
import { VoiceLegsResource } from "./voiceLegs.gen.js";

export class VoiceResource extends Resource {
  readonly legs: VoiceLegsResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.legs = new VoiceLegsResource(core, client);
  }
}
