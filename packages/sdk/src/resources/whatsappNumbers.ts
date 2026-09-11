// `bird.whatsapp.numbers` — the WhatsApp numbers this workspace can send from.
// The reads are generated on the base; this parent nests the business profile
// under a number, so a caller reaches it at `bird.whatsapp.numbers.profile`
// rather than through a second top-level resource.

import { Resource } from "./base.js";
import { WhatsappNumbersResourceBase } from "./whatsappNumbers.gen.js";
import { WhatsappNumbersProfileResource } from "./whatsappNumbersProfile.gen.js";

export class WhatsappNumbersResource extends WhatsappNumbersResourceBase {
  readonly profile: WhatsappNumbersProfileResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.profile = new WhatsappNumbersProfileResource(core, client);
  }
}
