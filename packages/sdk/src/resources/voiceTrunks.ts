import { VoiceTrunksResourceBase } from "./voiceTrunks.gen.js";
import { VoiceTrunksGatewaysResource } from "./voiceTrunksGateways.gen.js";

export class VoiceTrunksResource extends VoiceTrunksResourceBase {
  readonly gateways: VoiceTrunksGatewaysResource;

  constructor(...args: ConstructorParameters<typeof VoiceTrunksResourceBase>) {
    super(...args);
    this.gateways = new VoiceTrunksGatewaysResource(...args);
  }
}
