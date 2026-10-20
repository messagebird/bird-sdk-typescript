// HAND-WRITTEN example source for GENERATED compliance methods. Compiled +
// type-checked (examples/tsconfig.json includes **/*.ts, aliasing
// @messagebird/sdk -> ../src). Each `bird:snippet` region is the single source
// of truth for that key: the surfacegen TS writer injects it (unmarked) as the
// @example on the generated method, and docsnippet-gen extracts it here for the
// docs site + README.

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function complianceRequirementsGet() {
  const requirement = await bird.complianceRequirements.get({
    subject_kind: "number",
    subject_id: "nda_01krdgeqcxet5s7t44vh8rt9mg",
    country_code: "US",
  });
  for (const field of requirement.fields ?? []) {
    console.log(field.key, field.state);
  }
}

export async function complianceSubmissionsCreate() {
  const submission = await bird.complianceSubmissions.create({
    subject_kind: "number",
    subject_id: "nda_01krdgeqcxet5s7t44vh8rt9mg",
    program: "local",
    country_code: "US",
    answers: [
      { key: "legal_entity_name", value: "Goldcrest Communications Inc" },
      { key: "business_registration_number", value: "90012768" },
    ],
  });
  // There is no draft: the answers are filed for review as of this call.
  console.log(submission.id, submission.satisfied);
}

export async function complianceSubmissionsGet() {
  const submission = await bird.complianceSubmissions.get(
    "csb_01krdgeqcxet5s7t44vh8rt9mg",
  );
  for (const item of submission.items ?? []) {
    console.log(item.key, item.state, item.reason ?? "");
  }
}

export async function complianceSubmissionsResupply() {
  const submission = await bird.complianceSubmissions.resupply(
    "csb_01krdgeqcxet5s7t44vh8rt9mg",
    {
      answers: [{ key: "business_registration_number", value: "90012769" }],
    },
  );
  console.log(submission.satisfied);
}

export async function complianceAttachmentsList() {
  for await (const attachment of bird.complianceAttachments.list()) {
    console.log(attachment.id, attachment.filename, attachment.status);
  }
}

export async function complianceAttachmentsDelete() {
  // Once a registration cites the attachment, this returns a 409.
  await bird.complianceAttachments.delete("tca_01krdgeqcxet5s7t44vh8rt9mg");
}

export async function complianceIdentitiesList() {
  for await (const identity of bird.complianceIdentities.list()) {
    console.log(identity.id, identity.name);
  }
}

export async function complianceIdentitiesGet() {
  const identity = await bird.complianceIdentities.get(
    "cid_01krdgeqcxet5s7t44vh8rt9mg",
  );
  console.log(identity.name, Object.keys(identity.answers));
}

export async function compliance_identities_create() {
  await bird.complianceIdentities.create({ name: "Goldcrest" });
}

export async function compliance_identities_update() {
  await bird.complianceIdentities.update("cid_01krdgeqcxet5s7t44vh8rt9mg", { name: "Goldcrest SAS" });
}

export async function compliance_identities_delete() {
  await bird.complianceIdentities.delete("cid_01krdgeqcxet5s7t44vh8rt9mg");
}

export async function sms_senders_list() {
  await bird.smsSenders.list();
}

export async function sms_senders_get() {
  await bird.smsSenders.get("snd_01krdgeqcxet5s7t44vh8rt9mg");
}

export async function sms_senders_create() {
  await bird.smsSenders.create({ type: "alpha", sender: "GOLDCREST" });
}

export async function sms_sender_requirements_list() {
  await bird.smsSenderRequirements.list("snd_01krdgeqcxet5s7t44vh8rt9mg");
}

export async function sms_sender_registrations_create() {
  await bird.smsSenderRegistrations.create("snd_01krdgeqcxet5s7t44vh8rt9mg", {country_code: "NL"});
}

export async function billing_prices_resolve() {
  // Use a delegated user OAuth token with org:billing:read in its issuing region.
  const bird = new BirdClient({ apiKey: process.env.BIRD_OAUTH_ACCESS_TOKEN!, region: "eu1" });
  await bird.billingPrices.resolve({ product_slug: "sms_sender_registration", dimensions: {country_code: "NL", sender_type: "alphanumeric"} });
}

export async function billing_wallets_list() {
  // Use a delegated user OAuth token with org:billing:read in its issuing region.
  const bird = new BirdClient({ apiKey: process.env.BIRD_OAUTH_ACCESS_TOKEN!, region: "eu1" });
  await bird.billingWallets.list();
}
