import { VoiceLegsResourceBase } from "./voiceLegs.gen.js";
import { VoiceLegsRecordingsResource } from "./voiceLegsRecordings.js";

export class VoiceLegsResource extends VoiceLegsResourceBase {
  readonly recordings: VoiceLegsRecordingsResource;

  constructor(...args: ConstructorParameters<typeof VoiceLegsResourceBase>) {
    super(...args);
    this.recordings = new VoiceLegsRecordingsResource(...args);
  }
}
