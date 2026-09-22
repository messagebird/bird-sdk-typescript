import { BirdClient, type VoiceLeg, type VoiceLegsListQuery } from "../../src/index.js";

const bird = new BirdClient({ apiKey: "bk_eu1_test" });
const query: VoiceLegsListQuery = { call_id: "vcs_test", status: ["answered"] };
void bird.voice.legs.list(query);
const leg: PromiseLike<VoiceLeg> = bird.voice.legs.get("vcl_test");
void leg;
