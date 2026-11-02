import { VoiceRingGroupsResourceBase } from "./voiceRingGroups.gen.js";
import { VoiceRingGroupsMembersResource } from "./voiceRingGroupsMembers.gen.js";

export class VoiceRingGroupsResource extends VoiceRingGroupsResourceBase {
  readonly members: VoiceRingGroupsMembersResource;

  constructor(
    ...args: ConstructorParameters<typeof VoiceRingGroupsResourceBase>
  ) {
    super(...args);
    this.members = new VoiceRingGroupsMembersResource(...args);
  }
}
