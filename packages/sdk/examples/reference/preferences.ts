// HAND-WRITTEN example source for GENERATED preferences methods. Compiled +
// type-checked (examples/tsconfig.json includes **/*.ts, aliasing
// @messagebird/sdk -> ../src). Each `bird:snippet` region is the single source
// of truth for that key: the surfacegen TS writer injects it (unmarked) as the
// @example on the generated method, and docsnippet-gen extracts it here for the
// docs site + README. create and delete are hand-written, so their examples
// stay inline in src/resources/preferences.ts.

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function preferencesList() {
  for await (const preference of bird.preferences.list({ channel: "sms" })) {
    console.log(preference.handle, preference.status);
  }
}

export async function preferencesGet() {
  const preference = await bird.preferences.get(
    "prf_01krdgeqcxet5s7t44vh8rt9mg",
  );
  console.log(preference.status, preference.coverage);
}
