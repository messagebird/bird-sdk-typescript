import { VoiceCallsResourceBase } from "./voiceCalls.gen.js";
import { VoiceCallsRecordingsResource } from "./voiceCallsRecordings.gen.js";

export class VoiceCallsResource extends VoiceCallsResourceBase {
  readonly recordings: VoiceCallsRecordingsResource;

  constructor(...args: ConstructorParameters<typeof VoiceCallsResourceBase>) {
    super(...args);
    this.recordings = new VoiceCallsRecordingsResource(...args);
  }
}
