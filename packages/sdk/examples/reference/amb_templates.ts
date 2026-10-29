// HAND-WRITTEN example source for GENERATED amb.templates methods. Compiled +
// type-checked (examples/tsconfig.json includes **/*.ts, aliasing
// @messagebird/sdk -> ../src). Each `bird:snippet` region is the single source
// of truth for that key: the surfacegen TS writer injects it (unmarked) as the
// @example on the generated method, and docsnippet-gen extracts it here for the
// docs site + README.

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function ambTemplatesList() {
  for await (const tpl of bird.amb.templates.list({ scope: "system" })) {
    console.log(tpl.id, tpl.slug);
  }
}

export async function ambTemplatesGet() {
  const tpl = await bird.amb.templates.get("bird_order_update");
  console.log(tpl.default_language, tpl.live_version_id);
}

export async function ambTemplatesVersionsList() {
  for await (const version of bird.amb.templates.versions.list("bird_order_update")) {
    console.log(version.id, version.version_number);
  }
}

export async function ambTemplatesVersionsGet() {
  const version = await bird.amb.templates.versions.get(
    "bird_order_update",
    "amv_01ky4x8e4genzb7way45txfkm1",
  );
  console.log(version.id, Object.keys(version.languages));
}

export async function ambTemplatesVersionsLanguagesList() {
  const { data } = await bird.amb.templates.versions.languages.list(
    "bird_order_update",
    "amv_01ky4x8e4genzb7way45txfkm1",
  );
  for (const language of data) console.log(language.language, language.revision);
}

export async function ambTemplatesVersionsLanguagesGet() {
  const language = await bird.amb.templates.versions.languages.get(
    "bird_order_update",
    "amv_01ky4x8e4genzb7way45txfkm1",
    "en",
  );
  console.log(language.language, language.text);
}
