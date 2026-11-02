import {
  BirdClient,
  type VoiceLeg,
  type VoiceLegsListQuery,
  type VoiceNumber,
  type VoiceNumbersUpdateParams,
} from "../../src/index.js";

const bird = new BirdClient({ apiKey: "bk_eu1_test" });
const query: VoiceLegsListQuery = { call_id: "vcs_test", status: ["answered"] };
void bird.voice.legs.list(query);
const leg: PromiseLike<VoiceLeg> = bird.voice.legs.get("vcl_test");
void leg;

const numberRoute = {
  type: "ring_group",
  ring_group_id: "vrg_01krdgeqcxet5s7t44vh8rt9mg",
} satisfies Extract<
  NonNullable<VoiceNumber["inbound_configuration"]["route"]>,
  { type: "ring_group" }
>;
const legRoute = {
  type: "ring_group",
  ring_group_id: "vrg_01krdgeqcxet5s7t44vh8rt9mg",
} satisfies Extract<NonNullable<VoiceLeg["route"]>, { type: "ring_group" }>;
void numberRoute;
void legRoute;

type WritableRoute = NonNullable<
  VoiceNumbersUpdateParams["inbound_configuration"]
>["route"];
const ringGroupWrite: WritableRoute = {
  type: "ring_group",
  ring_group_id: "vrg_01krdgeqcxet5s7t44vh8rt9mg",
};
const sequenceWrite: WritableRoute = {
  // @ts-expect-error Sequence routes remain outside the public write surface.
  type: "sequence",
  sequence_id: "vsq_01krdgeqcxet5s7t44vh8rt9mg",
  entry_node_id: "main",
};
void ringGroupWrite;
void sequenceWrite;
