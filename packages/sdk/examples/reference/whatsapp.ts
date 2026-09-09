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
