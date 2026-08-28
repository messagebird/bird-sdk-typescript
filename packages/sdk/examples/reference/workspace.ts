// HAND-WRITTEN example source for the GENERATED workspace method. Each
// `bird:snippet` region is the single source of truth for that key: the
// surfacegen TS writer injects it (unmarked) as the @example on the generated
// method, and docsnippet-gen extracts it here for the docs site + README.

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function workspaceGet() {
  const workspace = await bird.workspace.get();
  console.log(workspace.id, workspace.name); // "ws_…" "Production"
}
