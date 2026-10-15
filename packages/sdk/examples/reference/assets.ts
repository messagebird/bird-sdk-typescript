import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function assets_list() {
  for await (const asset of bird.assets.list({ kind: "image" })) {
    console.log(asset.id, asset.url);
  }
}

export async function assets_get() {
  const asset = await bird.assets.get("ast_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(asset.url);
}

export async function assets_update() {
  const asset = await bird.assets.update("ast_01krdgeqcxet5s7t44vh8rt9mg", {
    name: "Summer banner",
  });
  console.log(asset.name);
}

export async function assets_delete() {
  await bird.assets.delete("ast_01krdgeqcxet5s7t44vh8rt9mg");
}

export async function assets_references_list() {
  const references = await bird.assets.references.list(
    "ast_01krdgeqcxet5s7t44vh8rt9mg",
  );
  console.log(references.data, references.truncated);
}

export async function assets_folders_create() {
  const folder = await bird.assets.folders.create({ name: "Campaign images" });
  console.log(folder.id);
}

export async function assets_folders_list() {
  for await (const folder of bird.assets.folders.list()) {
    console.log(folder.id, folder.path);
  }
}

export async function assets_folders_get() {
  const folder = await bird.assets.folders.get(
    "asf_01krdgeqcxet5s7t44vh8rt9mg",
  );
  console.log(folder.path);
}

export async function assets_folders_update() {
  const folder = await bird.assets.folders.update(
    "asf_01krdgeqcxet5s7t44vh8rt9mg",
    { name: "Autumn campaign" },
  );
  console.log(folder.path);
}

export async function assets_folders_delete() {
  await bird.assets.folders.delete("asf_01krdgeqcxet5s7t44vh8rt9mg");
}
