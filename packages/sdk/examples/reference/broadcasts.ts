// HAND-WRITTEN example source for the broadcasts methods. Compiled +
// type-checked (examples/tsconfig.json includes **/*.ts, aliasing
// @messagebird/sdk -> ../src). Each `bird:snippet` region is the single source
// of truth for that key: the surfacegen TS writer injects it (unmarked) as the
// @example on the generated method, and docsnippet-gen extracts it here for the
// docs site + README.

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function broadcastsCreate() {
  const broadcast = await bird.broadcasts.create({
    from: "newsletter@example.com",
    audience_id: "adn_01krdgeqcxet5s7t44vh8rt9mg",
    template: { id: "emt_01krdgeqcxet5s7t44vh8rt9mg" },
  });
  console.log(broadcast.id, broadcast.status); // "eb_…" "draft"
}

export async function broadcastsGet() {
  const broadcast = await bird.broadcasts.get("eb_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(broadcast.status, broadcast.sent_count, broadcast.delivered_count);
}

export async function broadcastsUpdate() {
  const broadcast = await bird.broadcasts.update("eb_01krdgeqcxet5s7t44vh8rt9mg", {
    template: { id: "emt_01krdgeqcxet5s7t44vh8rt9mg" },
  });
  console.log(broadcast.status);
}

export async function broadcastsDelete() {
  await bird.broadcasts.delete("eb_01krdgeqcxet5s7t44vh8rt9mg");
}

export async function broadcastsList() {
  for await (const broadcast of bird.broadcasts.list({ status: ["sent"] })) {
    console.log(broadcast.id, broadcast.status);
  }
}

export async function broadcastsSend() {
  const broadcast = await bird.broadcasts.send("eb_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(broadcast.status); // "accepted"
}

export async function broadcastsCancel() {
  const broadcast = await bird.broadcasts.cancel("eb_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(broadcast.status);
}

export async function broadcastsSendQuota() {
  const quota = await bird.broadcasts.sendQuota("eb_01krdgeqcxet5s7t44vh8rt9mg");
  if (quota.allowed < quota.recipients) {
    console.log(`${quota.limited_by} allowance covers only ${quota.allowed}`);
  }
}

export async function broadcastsCounts() {
  const counts = await bird.broadcasts.counts("eb_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(counts.total, counts.addressable, counts.sendable);
}

export async function broadcastsListRecipients() {
  for await (const recipient of bird.broadcasts.listRecipients("eb_01krdgeqcxet5s7t44vh8rt9mg")) {
    console.log(recipient.recipient, recipient.status);
  }
}

export async function broadcastsListEvents() {
  for await (const event of bird.broadcasts.listEvents("eb_01krdgeqcxet5s7t44vh8rt9mg", {
    type: "email.bounced",
  })) {
    console.log(event.type, event.recipient_id, event.bounce_type);
  }
}

export async function broadcastsListClickedLinks() {
  const links = await bird.broadcasts.listClickedLinks("eb_01krdgeqcxet5s7t44vh8rt9mg");
  for (const link of links.data) console.log(link.url, link.click_count, link.recipient_count);
}
