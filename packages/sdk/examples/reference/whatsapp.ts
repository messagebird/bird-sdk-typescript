// HAND-WRITTEN example source for GENERATED whatsapp methods. Compiled +
// type-checked (examples/tsconfig.json includes **/*.ts, aliasing
// @messagebird/sdk -> ../src). Each `bird:snippet` region is the single source
// of truth for that key: the surfacegen TS writer injects it (unmarked) as the
// @example on the generated method, and docsnippet-gen extracts it here for the
// docs site + README. `send` stays hand-written, so its example stays inline in
// src/resources/whatsapp.ts.

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function whatsappGet() {
  const msg = await bird.whatsapp.get("wa_abc123");
  msg.status; // "accepted" | "delivered" | …
}

export async function whatsappList() {
  for await (const msg of bird.whatsapp.list({ status: ["delivered"] })) {
    console.log(msg.id, msg.status);
  }
}

export async function whatsappListEvents() {
  const { data } = await bird.whatsapp.listEvents("wa_abc123");
  for (const event of data) console.log(event.type, event.occurred_at);
}

export async function whatsappMarkRead() {
  const ack = await bird.whatsapp.markRead("wam_01krdgeqcxet5s7t44vh8rt9mg", {
    typing_indicator: true,
  });
  ack.typing_indicator; // true
}

export async function whatsappReactionSet() {
  const reaction = await bird.whatsapp.reaction.set("wam_01krdgeqcxet5s7t44vh8rt9mg", {
    emoji: "\u{1F44D}",
  });
  console.log(reaction.id, reaction.emoji);
}

export async function whatsappReactionRemove() {
  await bird.whatsapp.reaction.remove("wam_01krdgeqcxet5s7t44vh8rt9mg");
}

export async function whatsappReactionListEvents() {
  for await (const event of bird.whatsapp.reaction.listEvents("wam_01krdgeqcxet5s7t44vh8rt9mg")) {
    console.log(event.id, event.emoji, event.status);
  }
}

export async function whatsappTemplatesList() {
  for await (const tpl of bird.whatsapp.templates.list()) {
    console.log(tpl.slug, tpl.status, tpl.available_languages);
  }
}

export async function whatsappTemplatesGet() {
  const tpl = await bird.whatsapp.templates.get("bird_otp");
  console.log(tpl.default_language, tpl.live_version_id);
}

export async function whatsappTemplatesVersionsList() {
  for await (const version of bird.whatsapp.templates.versions.list("bird_otp")) {
    console.log(version.id, version.version_number);
  }
}

export async function whatsappTemplatesVersionsGet() {
  const version = await bird.whatsapp.templates.versions.get(
    "bird_otp",
    "wav_01ky4x8e4genzb7way45txfkm1",
  );
  console.log(version.id, Object.keys(version.languages));
}

export async function whatsappTemplatesVersionsLanguagesList() {
  const { data } = await bird.whatsapp.templates.versions.languages.list(
    "bird_otp",
    "wav_01ky4x8e4genzb7way45txfkm1",
  );
  for (const language of data) console.log(language.language, language.status);
}

export async function whatsappTemplatesVersionsLanguagesGet() {
  const language = await bird.whatsapp.templates.versions.languages.get(
    "bird_otp",
    "wav_01ky4x8e4genzb7way45txfkm1",
    "nl-BE",
  );
  for (const component of language.components) console.log(component.type);
}


export async function whatsappStatsSummary() {
  const summary = await bird.whatsapp.stats.summary({
    from: "2026-08-01",
    to: "2026-08-31",
    timezone: "Europe/Amsterdam",
  });
  console.log(summary.delivery, summary.latency);
}

export async function whatsappStatsDaily() {
  const stats = await bird.whatsapp.stats.daily({ from: "2026-08-01", to: "2026-08-31" });
  for (const point of stats.data ?? []) {
    console.log(point.bucket, point.delivery);
  }
}

export async function whatsappStatsHourly() {
  const stats = await bird.whatsapp.stats.hourly({
    from: "2026-08-30T00:00:00Z",
    to: "2026-08-31T00:00:00Z",
  });
  for (const point of stats.data ?? []) {
    console.log(point.bucket, point.delivery);
  }
}

export async function whatsappStatsByErrorCode() {
  const stats = await bird.whatsapp.stats.byErrorCode({ from: "2026-08-01", to: "2026-08-31" });
  for (const row of stats.data ?? []) {
    console.log(row.error_code, row.count);
  }
}

export async function whatsappStatsByTemplate() {
  const stats = await bird.whatsapp.stats.byTemplate({ from: "2026-08-01", to: "2026-08-31" });
  for (const row of stats.data ?? []) {
    console.log(row.template_id, row.delivery);
  }
}

export async function whatsappStatsByTemplateCategory() {
  const stats = await bird.whatsapp.stats.byTemplateCategory({ from: "2026-08-01", to: "2026-08-31" });
  for (const row of stats.data ?? []) {
    console.log(row.category, row.delivery);
  }
}

export async function whatsappStatsByTag() {
  const stats = await bird.whatsapp.stats.byTag({ from: "2026-08-01", to: "2026-08-31" });
  for (const row of stats.data ?? []) {
    console.log(row.tag, row.delivery);
  }
}

export async function whatsappStatsByPhoneNumber() {
  const stats = await bird.whatsapp.stats.byPhoneNumber({ from: "2026-08-01", to: "2026-08-31" });
  for (const row of stats.data ?? []) {
    console.log(row.phone_number, row.delivery);
  }
}

export async function whatsappStatsByCountry() {
  const stats = await bird.whatsapp.stats.byCountry({ from: "2026-08-01", to: "2026-08-31" });
  for (const row of stats.data ?? []) {
    console.log(row.country, row.delivery);
  }
}

export async function whatsappStatsInboundSummary() {
  const summary = await bird.whatsapp.stats.inbound.summary({ from: "2026-05-01", to: "2026-05-31" });
  console.log(summary.received);
}

export async function whatsappStatsInboundDaily() {
  const stats = await bird.whatsapp.stats.inbound.daily({ from: "2026-05-01", to: "2026-05-31" });
  for (const point of stats.data ?? []) {
    console.log(point.bucket, point.received);
  }
}

export async function whatsappStatsInboundHourly() {
  const stats = await bird.whatsapp.stats.inbound.hourly({
    from: "2026-05-30T00:00:00Z",
    to: "2026-05-31T00:00:00Z",
  });
  for (const point of stats.data ?? []) {
    console.log(point.bucket, point.received);
  }
}

export async function whatsappStatsInboundByPhoneNumber() {
  const stats = await bird.whatsapp.stats.inbound.byPhoneNumber({ from: "2026-05-01", to: "2026-05-31" });
  for (const row of stats.data ?? []) {
    console.log(row.phone_number, row.received);
  }
}
