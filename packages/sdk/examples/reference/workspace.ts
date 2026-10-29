// HAND-WRITTEN example source for the GENERATED workspace methods. Each
// `bird:snippet` region is the single source of truth for that key: the
// surfacegen TS writer injects it (unmarked) as the @example on the generated
// method, and docsnippet-gen extracts it here for the docs site + README.

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function workspaceGet() {
  const workspace = await bird.workspace.get();
  console.log(workspace.id, workspace.name); // "ws_…" "Production"
}

export async function workspaceRateLimitsList() {
  // Workspace limits matter with several workspaces, or one that kept a limit after a deletion.
  const { data } = await bird.workspace.rateLimits.list();
  for (const policy of data) {
    // Check usage.status first: workspace_remaining is also null when the
    // workspace has no limit of its own or its usage is not measured yet.
    console.log(policy.key, policy.limit, policy.usage.workspace_remaining);
  }
}

export async function workspaceQuotasList() {
  const { data } = await bird.workspace.quotas.list();
  for (const quota of data) {
    console.log(quota.key, quota.limit, quota.organization_limit);
  }
}
