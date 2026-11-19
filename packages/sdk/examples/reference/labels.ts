import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function labelsList() {
  const labels = await bird.labels.list();
  console.log(labels.data.map((label) => label.name));
}

export async function labelsGet() {
  const label = await bird.labels.get("lbl_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(label.name, label.description);
}

export async function labelsCreate() {
  const label = await bird.labels.create({
    name: "refund-request",
    color: "#E5484D",
    description: "The customer asks for their money back.",
  });
  console.log(label.id);
}

export async function labelsUpdate() {
  const label = await bird.labels.update("lbl_01krdgeqcxet5s7t44vh8rt9mg", {
    name: "refund",
    color: null,
  });
  console.log(label.name);
}

export async function labelsDelete() {
  await bird.labels.delete("lbl_01krdgeqcxet5s7t44vh8rt9mg");
}
