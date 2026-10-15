import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });
const folder = await bird.assets.folders.create({ name: "Campaign images" });
console.log(folder.id);
for await (const asset of bird.assets.list({ kind: "image" })) {
  console.log(asset.id, asset.url);
}
