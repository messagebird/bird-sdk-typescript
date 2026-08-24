// HAND-WRITTEN example source for GENERATED numbers methods. Compiled +
// type-checked (examples/tsconfig.json includes **/*.ts, aliasing
// @messagebird/sdk -> ../src). Each `bird:snippet` region is the single source
// of truth for that key: the surfacegen TS writer injects it (unmarked) as the
// @example on the generated method, and docsnippet-gen extracts it here for the
// docs site + README.

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function numbersAvailableList() {
  // The search is always country-scoped, so country_code is required.
  const page = await bird.numbers.available.list({
    country_code: "GB",
    capabilities: ["sms", "voice"],
  });
  for (const candidate of page.data) {
    console.log(candidate.number, candidate.number_type);
  }
}

export async function numbersAvailableGet() {
  // A number a carrier supplies is only on sale while the carrier still has it,
  // so a 404 here means someone else took it.
  const candidate = await bird.numbers.available.get("+447700900201");
  console.log(candidate.country_code, candidate.capabilities);
}

export async function numbersOrdersCreate() {
  const order = await bird.numbers.orders.create({ number: "+447700900201" });
  // Most orders finish inside the request. One that has to wait on a carrier
  // comes back without a number_id. Poll it until it is completed or failed.
  if (order.status === "completed") {
    console.log("allocated as", order.number_id);
  } else {
    console.log("still", order.status, "; poll", order.id);
  }
}

export async function numbersOrdersGet() {
  const order = await bird.numbers.orders.get("nor_01krdgeqcxet5s7t44vh8rt9mg");
  // failure_reason says what went wrong, and only ever on a failed order.
  console.log(order.status, order.failure_reason ?? "");
}

export async function numbersOrdersList() {
  const page = await bird.numbers.orders.list({ status: "failed" });
  for (const order of page.data) {
    console.log(order.number, order.failure_reason ?? "");
  }
}

export async function numbersList() {
  for await (const allocated of bird.numbers.list({ country_code: "GB" })) {
    // kind tells a number you bought from one Bird manages for several workspaces.
    console.log(allocated.number, allocated.kind, allocated.status);
  }
}

export async function numbersGet() {
  const allocated = await bird.numbers.get("nda_01krdgeqcxet5s7t44vh8rt9mg");
  // A country that asks for ownership paperwork answers here; most answer null.
  console.log(allocated.status, allocated.ownership ?? "no paperwork required");
}

export async function numbersRelease() {
  // Releasing stops the monthly charge and the number stops working for you.
  // Only a dedicated number can be released; a shared one answers E14002.
  await bird.numbers.release("nda_01krdgeqcxet5s7t44vh8rt9mg");
}
