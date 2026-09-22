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

export async function whatsappNumbersList() {
  for await (const number of bird.whatsapp.numbers.list({ status: ["connected"] })) {
    console.log(number.id, number.phone_number, number.status);
  }
}

export async function whatsappNumbersGet() {
  const number = await bird.whatsapp.numbers.get("wan_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(number.status, number.quality_rating, number.messaging_limit);
}

export async function whatsappNumbersProfileGet() {
  const profile = await bird.whatsapp.numbers.profile.get("wan_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(profile.display_name, profile.description, profile.websites);
}

export async function whatsappNumbersListEvents() {
  for await (const event of bird.whatsapp.numbers.listEvents(
    "wan_01krdgeqcxet5s7t44vh8rt9mg",
  )) {
    console.log(event.created_at, event.type, event.summary);
  }
}

export async function whatsappBusinessAccountsList() {
  for await (const account of bird.whatsapp.businessAccounts.list()) {
    console.log(account.id, account.name, account.status);
  }
}

export async function whatsappBusinessAccountsGet() {
  const account = await bird.whatsapp.businessAccounts.get("waa_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(account.account_review_status, account.business_verification_status);
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

export async function whatsappGroupsCreate() {
  const group = await bird.whatsapp.groups.create({
    whatsapp_number_id: "wan_01krdgeqcxet5s7t44vh8rt9mg",
    subject: "Norwood Fleet — Tuesday route",
  });
  console.log(group.id, group.status); // pending; read it back for the invite link
}

export async function whatsappGroupsList() {
  for await (const group of bird.whatsapp.groups.list()) {
    console.log(group.id, group.subject, group.participant_count);
  }
}

export async function whatsappGroupsGet() {
  const group = await bird.whatsapp.groups.get("wag_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(group.status, group.invite_link);
}

export async function whatsappGroupsUpdate() {
  const group = await bird.whatsapp.groups.update("wag_01krdgeqcxet5s7t44vh8rt9mg", {
    subject: "Norwood Fleet — Wednesday route",
  });
  console.log(group.last_operation?.status); // pending until WhatsApp reports back
}

export async function whatsappGroupsDelete() {
  const group = await bird.whatsapp.groups.delete("wag_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(group.last_operation?.status); // pending until WhatsApp confirms it
}

export async function whatsappGroupsInviteLinkRotate() {
  const link = await bird.whatsapp.groups.inviteLink.rotate("wag_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(link.invite_link); // every earlier link has stopped working
}

export async function whatsappGroupsParticipantsRemove() {
  const group = await bird.whatsapp.groups.participants.remove(
    "wag_01krdgeqcxet5s7t44vh8rt9mg",
    "BR.1566655121691972",
  );
  console.log(group.participants?.length);
}

export async function whatsappGroupsJoinRequestsList() {
  for await (const request of bird.whatsapp.groups.joinRequests.list(
    "wag_01krdgeqcxet5s7t44vh8rt9mg",
  )) {
    console.log(request.id, request.bsuid);
  }
}

export async function whatsappGroupsJoinRequestsApprove() {
  const result = await bird.whatsapp.groups.joinRequests.approve(
    "wag_01krdgeqcxet5s7t44vh8rt9mg",
    { join_request_ids: ["wgj_01krdgeqcxet5s7t44vh8rt9mg"] },
  );
  console.log(result.decided.length, result.failed.length);
}

export async function whatsappGroupsJoinRequestsReject() {
  const result = await bird.whatsapp.groups.joinRequests.reject(
    "wag_01krdgeqcxet5s7t44vh8rt9mg",
    { join_request_ids: ["wgj_01krdgeqcxet5s7t44vh8rt9mg"] },
  );
  for (const failure of result.failed) {
    console.log(failure.join_request_id, failure.error.description);
  }
}

export async function whatsappGroupsPinsCreate() {
  const pin = await bird.whatsapp.groups.pins.create("wag_01krdgeqcxet5s7t44vh8rt9mg", {
    message_id: "wam_01kya19eknftrs2s6p82asmvnh",
  });
  console.log(pin.pinned_until);
}

export async function whatsappGroupsPinsDelete() {
  const group = await bird.whatsapp.groups.pins.delete(
    "wag_01krdgeqcxet5s7t44vh8rt9mg",
    "wam_01kya19eknftrs2s6p82asmvnh",
  );
  console.log(group.pinned_messages?.length);
}

export async function whatsappKeywordRulesList() {
  const rules = await bird.whatsapp.keywordRules.list({ operation: "opt_out" });
  for (const rule of rules.data ?? []) {
    console.log(rule.scope, rule.effective_keywords);
  }
}

export async function whatsappKeywordRulesGet() {
  // Bird's rules and yours share the `wkr_` id space; `scope` tells them apart.
  const rule = await bird.whatsapp.keywordRules.get("wkr_01m2kj8x4te9p0rr7e5w2n1abc");
  console.log(rule.scope, rule.reply);
}

export async function whatsappKeywordRulesCreate() {
  const rule = await bird.whatsapp.keywordRules.create({
    operation: "opt_out",
    country: "US", // the SENDER's country, from their own number
    reply: "You're off the list. ACME Courier won't message you again.",
  });
  // effective_keywords is Bird's set plus any of your own.
  console.log(rule.id, rule.effective_keywords);
}

export async function whatsappKeywordRulesUpdate() {
  // Omitting keywords leaves the set alone; an empty array clears your additions
  // back to Bird's. reply: null switches the auto-reply off and still records
  // the opt-out.
  const rule = await bird.whatsapp.keywordRules.update("wkr_01m2kj8x4te9p0rr7e5w2n1abc", {
    keywords: ["no more texts", "remove me"],
  });
  console.log(rule.effective_keywords);
}

export async function whatsappKeywordRulesDelete() {
  // The next rule in the ladder answers the scope, which is another rule of yours if you hold a less specific one; STOP never stops working.
  await bird.whatsapp.keywordRules.delete("wkr_01m2kj8x4te9p0rr7e5w2n1abc");
}

export async function whatsappSuppressionsList() {
  // address is a prefix, so a partial value matches every address under it.
  const suppressions = await bird.whatsapp.suppressions.list({ address: "+1555" });
  for (const suppression of suppressions.data ?? []) {
    console.log(suppression.address, suppression.waba ?? "every account");
  }
}

export async function whatsappSuppressionsGet() {
  // Resolves a record that has already ended, which the list leaves out.
  const suppression = await bird.whatsapp.suppressions.get("was_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(suppression.reason, suppression.ended_at ?? "still in force");
}

export async function whatsappSuppressionsAdd() {
  // Omit waba to block the address for the whole workspace, whichever account
  // sends. With it, your other accounts keep reaching them, and the same
  // address for two accounts is two records.
  const suppression = await bird.whatsapp.suppressions.add({
    address: "+15550001234",
    waba: "102290129340398",
  });
  console.log(suppression.id, suppression.applies_to);
}

export async function whatsappSuppressionsRemove() {
  // Only a manual suppression can be ended; a recipient's own opt-out is
  // theirs to reverse. The record is kept and still reads back by id.
  await bird.whatsapp.suppressions.remove("was_01krdgeqcxet5s7t44vh8rt9mg");
}
