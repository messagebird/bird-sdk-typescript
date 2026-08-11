// HAND-WRITTEN example source for GENERATED voice methods. Compiled +
// type-checked (examples/tsconfig.json includes **/*.ts, aliasing
// @messagebird/sdk -> ../src). Each `bird:snippet` region is the single source
// of truth for that key: the surfacegen TS writer injects it (unmarked) as the
// @example on the generated method, and docsnippet-gen extracts it here for the
// docs site + README. Calls are placed by your own SIP equipment rather than
// through the API, so the call log is a read surface.

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function voiceGet() {
  const call = await bird.voice.get("vcl_01k0p3v9wera3v6q6xw3e9y2mh");
  // A call still ringing or connected carries no economics yet.
  call.status; // "answered" | "no_answer" | "ringing" | …
}

export async function voiceList() {
  for await (const call of bird.voice.list({ status: ["ringing", "in_progress"] })) {
    console.log(call.id, call.status);
  }
}
