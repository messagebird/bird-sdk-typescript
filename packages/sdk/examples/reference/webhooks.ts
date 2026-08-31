// HAND-WRITTEN example source for GENERATED webhook methods. Compiled +
// type-checked (examples/tsconfig.json includes **/*.ts, aliasing
// @messagebird/sdk -> ../src). Each `bird:snippet` region is the single source
// of truth for that key: the surfacegen TS writer injects it (unmarked) as the
// @example on the generated method, and docsnippet-gen extracts it here for the
// docs site + README.

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function webhookCreate() {
  const created = await bird.webhooks.create({
    url: "https://acme.com/hooks/bird",
    events: ["email.delivered", "email.bounced"],
    description: "Delivery pipeline",
  });
  console.log(created.id, created.secret);
}

export async function webhookList() {
  for await (const endpoint of bird.webhooks.list()) {
    console.log(endpoint.id, endpoint.url, endpoint.status);
  }
}

export async function webhookGet() {
  const endpoint = await bird.webhooks.get("whk_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(endpoint.url, endpoint.events);
}

export async function webhookUpdate() {
  const endpoint = await bird.webhooks.update("whk_01krdgeqcxet5s7t44vh8rt9mg", {
    events: ["email.delivered"],
  });
  console.log(endpoint.events);
}

export async function webhookTest() {
  const result = await bird.webhooks.test("whk_01krdgeqcxet5s7t44vh8rt9mg", {
    event_type: "email.delivered",
  });
  console.log(result.status);
}

export async function webhookAttempts() {
  const attempts = await bird.webhooks.attempts(
    "whk_01krdgeqcxet5s7t44vh8rt9mg",
  );
  for (const attempt of attempts.data) {
    console.log(attempt.status, attempt.response_status_code);
  }
}

export async function webhookRotateSecret() {
  const rotated = await bird.webhooks.rotateSecret(
    "whk_01krdgeqcxet5s7t44vh8rt9mg",
  );
  console.log(rotated.secret);
}

export async function webhookDelete() {
  await bird.webhooks.delete("whk_01krdgeqcxet5s7t44vh8rt9mg");
}
