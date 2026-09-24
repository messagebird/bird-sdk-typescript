import { Resource } from "./base.js";
import { VoiceCallerIdsResource } from "./voiceCallerIds.gen.js";
import { VoiceDestinationsResource } from "./voiceDestinations.gen.js";
import { VoiceCallsResource } from "./voiceCalls.gen.js";
import { VoiceLegsResource } from "./voiceLegs.gen.js";
import { VoiceNumbersResource } from "./voiceNumbers.gen.js";
import { VoiceSessionCredentialsResource } from "./voiceSessionCredentials.gen.js";
import { VoiceTrunksResource } from "./voiceTrunks.js";

export class VoiceResource extends Resource {
  readonly legs: VoiceLegsResource;
  readonly trunks: VoiceTrunksResource;
  readonly numbers: VoiceNumbersResource;
  readonly callerIds: VoiceCallerIdsResource;
  readonly destinations: VoiceDestinationsResource;
  readonly sessionCredentials: VoiceSessionCredentialsResource;
  readonly calls: VoiceCallsResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.legs = new VoiceLegsResource(core, client);
    this.trunks = new VoiceTrunksResource(core, client);
    this.numbers = new VoiceNumbersResource(core, client);
    this.callerIds = new VoiceCallerIdsResource(core, client);
    this.destinations = new VoiceDestinationsResource(core, client);
    this.sessionCredentials = new VoiceSessionCredentialsResource(core, client);
    this.calls = new VoiceCallsResource(core, client);
  }
}
