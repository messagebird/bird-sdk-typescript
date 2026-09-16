// HAND-WRITTEN example source for GENERATED smsTemplates methods. Compiled +
// type-checked (examples/tsconfig.json includes **/*.ts, aliasing
// @messagebird/sdk -> ../src). Each `bird:snippet` region is the single source
// of truth for that key: the surfacegen TS writer injects it (unmarked) as the
// @example on the generated method, and docsnippet-gen extracts it here for the
// docs site + README.

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function smsTemplatesList() {
  for await (const tpl of bird.smsTemplates.list({ scope: "system" })) {
    console.log(tpl.id, tpl.slug);
  }
}

export async function smsTemplatesGet() {
  const tpl = await bird.smsTemplates.get("bird_otp_verification");
  console.log(tpl.default_language, tpl.live_version_id);
}

export async function smsTemplatesVersionsList() {
  for await (const version of bird.smsTemplates.versions.list("bird_otp_verification")) {
    console.log(version.id, version.version_number);
  }
}

export async function smsTemplatesVersionsGet() {
  const version = await bird.smsTemplates.versions.get(
    "bird_otp_verification",
    "smv_01ky4x8e4genzb7way45txfkm1",
  );
  console.log(version.id, Object.keys(version.languages));
}

export async function smsTemplatesVersionsLanguagesList() {
  const { data } = await bird.smsTemplates.versions.languages.list(
    "bird_otp_verification",
    "smv_01ky4x8e4genzb7way45txfkm1",
  );
  for (const language of data) console.log(language.language, language.revision);
}

export async function smsTemplatesVersionsLanguagesGet() {
  const language = await bird.smsTemplates.versions.languages.get(
    "bird_otp_verification",
    "smv_01ky4x8e4genzb7way45txfkm1",
    "en",
  );
  console.log(language.language, language.text);
}
