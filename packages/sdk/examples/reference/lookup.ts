// HAND-WRITTEN example source for GENERATED lookup methods. Compiled +
// type-checked (examples/tsconfig.json includes **/*.ts, aliasing
// @messagebird/sdk -> ../src). Each `bird:snippet` region is the single source
// of truth for that key: the surfacegen TS writer injects it (unmarked) as the
// @example on the generated method, and docsnippet-gen extracts it here for the
// docs site + README.

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function lookupEmail() {
  const answer = await bird.lookup.email({ email: "aisha.khan@example.com" });
  // result is an open vocabulary; delivery_confidence is always comparable.
  console.log(answer.result, answer.delivery_confidence);
}

export async function lookupPhoneNumber() {
  const answer = await bird.lookup.phoneNumber({
    phone_number: "+31612345678",
    type: ["classification", "score"],
  });
  console.log(answer.country_code, answer.line_type);
  // Only a block whose status is ok carries a value, and only that one is billed.
  if (answer.score?.status === "ok") console.log(answer.score.value);
}
