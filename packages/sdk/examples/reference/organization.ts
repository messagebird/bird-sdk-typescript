import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_MASTER_KEY! });

export async function organizationWorkspacesCreate() {
  const workspace = await bird.organization.workspaces.create({
    name: "Staging",
  });
  console.log(workspace.id);
}

export async function organizationWorkspacesList() {
  for await (const workspace of bird.organization.workspaces.list({
    name: "Staging",
  })) {
    console.log(workspace.id, workspace.name);
  }
}

export async function organizationWorkspacesGet() {
  const workspace = await bird.organization.workspaces.get(
    "ws_01krdgeqcxet5s7t44vh8rt9mg",
  );
  console.log(workspace.name);
}

export async function organizationWorkspacesUpdate() {
  const workspace = await bird.organization.workspaces.update(
    "ws_01krdgeqcxet5s7t44vh8rt9mg",
    { name: "Production" },
  );
  console.log(workspace.name);
}

export async function organizationWorkspacesDelete() {
  await bird.organization.workspaces.delete("ws_01krdgeqcxet5s7t44vh8rt9mg");
}
