import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function suppressionsList() {
  for await (const suppression of bird.suppressions.list()) {
    console.log(suppression.email, suppression.reason);
  }
}

export async function suppressionsGet() {
  const suppression = await bird.suppressions.get("sup_abc123");
  console.log(suppression.reason, suppression.applies_to);
}

export async function suppressionsAdd() {
  // Adding is idempotent: an existing `manual` record is returned unchanged.
  const suppression = await bird.suppressions.add({
    email: "blocked@example.com",
  });
  console.log(suppression.id);
}

export async function suppressionsRemove() {
  // Check for remaining blocking records before resuming delivery.
  await bird.suppressions.remove("sup_abc123");
}
