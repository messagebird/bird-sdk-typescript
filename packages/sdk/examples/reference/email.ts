// HAND-WRITTEN example source for GENERATED email methods. Compiled + type-checked
// (examples/tsconfig.json includes **/*.ts, aliasing @messagebird/sdk -> ../src).
// Each `bird:snippet` region is the single source of truth for that key: the
// surfacegen TS writer injects it (unmarked) as the @example on the generated
// method, and docsnippet-gen extracts it here for the docs site + README.
// (Override methods — email.send/sendBatch — keep their examples inline in
// src/resources/email.ts, since nothing regenerates over a hand-written method.)

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function emailContent() {
  const content = await bird.email.content("em_01krdgeqcxet5s7t44vh8rt9mg", {
    recipient_id: "er_01krdgeqcxet5s7t44vh8rt9mg",
  });
  console.log(content.html, content.text);
}

export async function emailRecipients() {
  for await (const recipient of bird.email.recipients(
    "em_01krdgeqcxet5s7t44vh8rt9mg",
  )) {
    console.log(recipient.id, recipient.subject);
  }
}

export async function emailGet() {
  const msg = await bird.email.get("em_abc123");
  msg.status; // "accepted" | "processed" | "delivered" | "bounced" | …
  msg.delivered_count;
  msg.bounced_count;
  console.log(msg.subject, msg.subject_recipient_id);
}

export async function emailCancel() {
  await bird.email.cancel("em_abc123");
}

export async function emailList() {
  for await (const message of bird.email.list({ status: "bounced" })) {
    console.log(message.id);
  }
  const page = await bird.email.list({ limit: 50 }); // page.data, page.next_cursor
}

export async function emailHealth() {
  const health = await bird.email.health({ from: "2026-05-01", to: "2026-05-31" });
  console.log(health.status);
  for (const signal of health.signals) {
    console.log(signal.metric, signal.value, signal.status);
  }
}

export async function emailStatsSummary() {
  const s = await bird.email.stats.summary({ from: "2026-05-01", to: "2026-05-31" });
  console.log(s.sends_accepted, s.delivery.delivered);
}

export async function emailStatsDaily() {
  const series = await bird.email.stats.daily({ from: "2026-05-01", to: "2026-05-31" });
  for (const row of series.data) console.log(row.bucket, row.delivery.delivered);
}

export async function emailStatsHourly() {
  const series = await bird.email.stats.hourly({ from: "2026-05-01", to: "2026-05-02" });
  for (const row of series.data) console.log(row.bucket, row.delivery.delivered);
}

export async function emailStatsByTag() {
  const { data } = await bird.email.stats.byTag({
    from: "2026-05-01",
    to: "2026-05-31",
    sort: "delivered",
    limit: 10,
  });
  for (const row of data) console.log(row.tag, row.delivery.delivered);
}

export async function emailStatsByCategory() {
  const { data } = await bird.email.stats.byCategory({ from: "2026-05-01", to: "2026-05-31" });
  for (const row of data) console.log(row.category, row.delivery.delivered);
}

export async function emailStatsBySendingIp() {
  const { data } = await bird.email.stats.bySendingIp({
    from: "2026-05-01",
    to: "2026-05-31",
    sort: "bounces.block",
    limit: 20,
  });
  for (const row of data) console.log(row.sending_ip, row.delivery.delivered);
}

export async function emailStatsBySendingDomain() {
  const { data } = await bird.email.stats.bySendingDomain({
    from: "2026-05-01",
    to: "2026-05-31",
    sort: "delivery_rate",
    limit: 25,
  });
  for (const row of data) console.log(row.sending_domain, row.delivery.delivery_rate);
}

export async function emailStatsByRecipientDomain() {
  const { data } = await bird.email.stats.byRecipientDomain({
    from: "2026-05-01",
    to: "2026-05-31",
    sort: "bounce_rate",
    limit: 25,
  });
  for (const row of data) console.log(row.recipient_domain, row.delivery.bounce_rate);
}

export async function emailStatsByMailboxProvider() {
  const { data } = await bird.email.stats.byMailboxProvider({
    from: "2026-05-01",
    to: "2026-05-31",
    limit: 25,
  });
  for (const row of data) console.log(row.mailbox_provider, row.delivery.delivered);
}

export async function emailStatsByMailboxProviderRegion() {
  const { data } = await bird.email.stats.byMailboxProviderRegion({
    from: "2026-05-01",
    to: "2026-05-31",
    limit: 25,
  });
  for (const row of data) console.log(row.mailbox_provider, row.mailbox_provider_region, row.delivery.delivered);
}

export async function emailStatsByTemplate() {
  const { data } = await bird.email.stats.byTemplate({
    from: "2026-05-01",
    to: "2026-05-31",
    sort: "open_rate",
    limit: 25,
  });
  for (const row of data) console.log(row.template_id, row.engagement.open_rate);
}

export async function emailStatsByBrand() {
  const { data } = await bird.email.stats.byBrand({
    sort: "open_rate",
    limit: 25,
  });
  for (const row of data) console.log(row.brand_id, row.engagement.open_rate);
}

export async function emailStatsByLocation() {
  const { data } = await bird.email.stats.byLocation({
    from: "2026-05-01",
    to: "2026-05-31",
    limit: 25,
  });
  for (const row of data) console.log(row.country, row.engagement.unique_opens);
}

export async function emailStatsByClient() {
  const { data } = await bird.email.stats.byClient({
    from: "2026-05-01",
    to: "2026-05-31",
    limit: 25,
  });
  for (const row of data) console.log(row.email_client, row.engagement.unique_opens);
}

export async function emailStatsByBounceCode() {
  const { data } = await bird.email.stats.byBounceCode({
    from: "2026-05-01",
    to: "2026-05-31",
    sort: "bounced",
    limit: 25,
  });
  for (const row of data) console.log(row.smtp_error_code, row.bounced);
}

export async function emailStatsByComplaintType() {
  const { data } = await bird.email.stats.byComplaintType({ from: "2026-05-01", to: "2026-05-31" });
  for (const row of data) console.log(row.feedback_type, row.complained);
}

export async function emailStatsByBroadcast() {
  const { data } = await bird.email.stats.byBroadcast({
    from: "2026-05-01",
    to: "2026-05-31",
    sort: "click_rate",
    limit: 25,
  });
  for (const row of data) console.log(row.broadcast_id, row.engagement.click_rate);
}

export async function mailboxList() {
  for await (const mailbox of bird.email.mailboxes.list()) {
    console.log(mailbox.address);
  }
}

export async function mailboxCreate() {
  const mailbox = await bird.email.mailboxes.create({ name: "Support" });
  console.log(mailbox.address); // "abc123@inbox.ai"
}

export async function mailboxGet() {
  const mailbox = await bird.email.mailboxes.get("mbx_01abc");
  console.log(mailbox.state); // "active"
}

export async function mailboxDelete() {
  await bird.email.mailboxes.delete("mbx_01abc");
}

export async function mailboxRestore() {
  const mailbox = await bird.email.mailboxes.restore("mbx_01abc");
  console.log(mailbox.deleted_at); // null
}

export async function mailboxResume() {
  const mailbox = await bird.email.mailboxes.resume("mbx_01abc");
  console.log(mailbox.state); // "active"
}

export async function mailboxForwardingAddressCreate() {
  const mailbox =
    await bird.email.mailboxes.forwardingAddress.create("mbx_01abc");
  console.log(mailbox.forwarding_address);
}

export async function mailboxStats() {
  const stats = await bird.email.mailboxes.stats("mbx_01abc");
  console.log(stats.summary?.sends_accepted);
}

export async function mailboxUpdate() {
  const mailbox = await bird.email.mailboxes.update("mbx_01abc", {
    receive_policy: "open",
  });
  console.log(mailbox.id, mailbox.receive_policy);
}

export async function mailboxReceiveRuleCreate() {
  const rule = await bird.email.mailboxes.receiveRules.create("mbx_01abc", {
    action: "block",
    entry: "spam.example.com",
  });
  console.log(rule.id);
}

export async function mailboxReceiveRuleDelete() {
  await bird.email.mailboxes.receiveRules.delete("mbx_01abc", "erl_01xyz");
}

export async function mailboxReceiveRuleList() {
  for await (const rule of bird.email.mailboxes.receiveRules.list("mbx_01abc")) {
    console.log(rule.action, rule.entry);
  }
}

export async function mailboxThreadList() {
  for await (const thread of bird.email.threads.list({ mailbox_id: "mbx_01abc" })) {
    console.log(thread.id, thread.subject);
  }
}

export async function mailboxThreadGet() {
  const thread = await bird.email.threads.get("thr_01abc");
  console.log(thread.subject);
}

export async function mailboxThreadUpdate() {
  const thread = await bird.email.threads.update("thr_01abc", {
    folder: "archive",
  });
  console.log(thread.id);
}

export async function mailboxThreadDelete() {
  await bird.email.threads.delete("thr_01abc", { permanent: true });
}

export async function mailboxThreadRestore() {
  const thread = await bird.email.threads.restore("thr_01abc");
  console.log(thread.id);
}

export async function mailboxThreadMessageReply() {
  const reply = await bird.email.threads.messages.reply("thr_01abc", "rem_01xyz", {
    text: "Thanks for reaching out!",
  });
  console.log(reply.id);
}

export async function mailboxThreadMessageGet() {
  const msg = await bird.email.threads.messages.get("thr_01abc", "rem_01xyz");
  console.log(msg.direction); // "inbound"
}

export async function mailboxThreadMessageBody() {
  const body = await bird.email.threads.messages.body("thr_01abc", "rem_01xyz");
  console.log(body.text);
}

export async function mailboxThreadMessageAttachments() {
  const atts = await bird.email.threads.messages.attachments("thr_01abc", "rem_01xyz");
  console.log(atts.data.map((a) => a.filename));
}

export async function mailboxThreadMessageList() {
  for await (const msg of bird.email.threads.messages.list("thr_01abc")) {
    console.log(msg.id, msg.direction);
  }
}

export async function emailTemplatesList() {
  for await (const tpl of bird.email.templates.list({ scope: "workspace" })) {
    console.log(tpl.slug, tpl.name);
  }
}

export async function emailTemplatesAuthor() {
  const template = await bird.email.templates.create({
    slug: "welcome-email",
    category: "transactional",
    source: "html",
    languages: {
      en: {
        subject: "Welcome, {{ first_name }}",
        preview_text: "Your account is ready",
        html: "<!DOCTYPE html>\n<html>\n<body>\n<p>Hi {{ first_name }}, thanks for signing up.</p>\n</body>\n</html>\n",
      },
    },
  });
  console.log(template.id, template.draft_version_id);
}

export async function emailTemplatesLanguagesGet() {
  const language = await bird.email.templates.versions.languages.get(
    "TEMPLATE_ID",
    "DRAFT_VERSION_ID",
    "en",
  );
  console.log(language.content?.html);
}

export async function emailTemplatesSubmit() {
  const templateId = "TEMPLATE_ID";
  const draftVersionId = "DRAFT_VERSION_ID";
  const check = await bird.email.templates.versions.submit(templateId, draftVersionId, {
    validate_only: true,
  });
  for (const problem of check.errors) {
    console.log(problem.language, problem.field, problem.message);
  }
  if (check.valid) {
    const result = await bird.email.templates.versions.submit(templateId, draftVersionId);
    console.log(result.version?.version_number);
  }
}

export async function insights_email_competitive_brands_search() {
  // Requires competitive:read permission in the target workspace.
  const report = await bird.email.competitive.brands.search({ q: "Everlane" });
  console.log(report.data);
}

export async function insights_email_competitive_watchlist_get() {
  // Requires competitive:read permission in the target workspace.
  const report = await bird.email.competitive.watchlist.get({ range: 30 });
  console.log(report.data);
}

export async function insights_email_competitive_watchlist_brands_create() {
  // Requires competitive:write permission in the target workspace.
  const matches = await bird.email.competitive.brands.search({ q: "Everlane" });
  const match = matches.data.find((brand) => brand.name === "Everlane");
  if (!match) throw new Error("No exact Everlane match");
  const entry = await bird.email.competitive.watchlist.brands.create({ brand_id: match.brand_id });
  console.log(entry.id);
}

export async function insights_email_competitive_watchlist_brands_get() {
  // Requires competitive:read permission in the target workspace.
  const watchlist = await bird.email.competitive.watchlist.get({ range: 30 });
  const entry = watchlist.data.find((row) => row.name === "Everlane" && row.watchlist_brand_id);
  if (!entry?.watchlist_brand_id) throw new Error("Add Everlane to the watchlist first");
  const watchlistBrandId = entry.watchlist_brand_id;
  const report = await bird.email.competitive.watchlist.brands.get(watchlistBrandId, { range: 30 });
  console.log(report);
}

export async function insights_email_competitive_watchlist_brands_sendTime() {
  // Requires competitive:read permission in the target workspace.
  const watchlist = await bird.email.competitive.watchlist.get({ range: 30 });
  const entry = watchlist.data.find((row) => row.name === "Everlane" && row.watchlist_brand_id);
  if (!entry?.watchlist_brand_id) throw new Error("Add Everlane to the watchlist first");
  const watchlistBrandId = entry.watchlist_brand_id;
  const report = await bird.email.competitive.watchlist.brands.sendTime(watchlistBrandId, { timezone: "UTC" });
  console.log(report);
}

export async function insights_email_competitive_watchlist_brands_delete() {
  // Requires competitive:write permission in the target workspace.
  const watchlist = await bird.email.competitive.watchlist.get({ range: 30 });
  const entry = watchlist.data.find((row) => row.name === "Everlane" && row.watchlist_brand_id);
  if (!entry?.watchlist_brand_id) throw new Error("Add Everlane to the watchlist first");
  const watchlistBrandId = entry.watchlist_brand_id;
  await bird.email.competitive.watchlist.brands.delete(watchlistBrandId);
}

export async function insights_email_competitive_watchlist_notable() {
  // Requires competitive:read permission in the target workspace.
  const report = await bird.email.competitive.watchlist.notable({ range: 30 });
  console.log(report);
}

export async function insights_email_competitive_volumeSeries() {
  // Requires competitive:read permission in the target workspace.
  const watchlist = await bird.email.competitive.watchlist.get({ range: 30 });
  const entry = watchlist.data.find((row) => row.name === "Everlane" && row.watchlist_brand_id);
  if (!entry?.watchlist_brand_id) throw new Error("Add Everlane to the watchlist first");
  const watchlistBrandId = entry.watchlist_brand_id;
  const report = await bird.email.competitive.volumeSeries({ range: 30, brand_ids: [watchlistBrandId] });
  console.log(report);
}

export async function insights_email_competitive_watchlist_brands_campaigns_list() {
  // Requires competitive:read permission in the target workspace.
  const watchlist = await bird.email.competitive.watchlist.get({ range: 30 });
  const entry = watchlist.data.find((row) => row.name === "Everlane" && row.watchlist_brand_id);
  if (!entry?.watchlist_brand_id) throw new Error("Add Everlane to the watchlist first");
  const watchlistBrandId = entry.watchlist_brand_id;
  for await (const campaign of bird.email.competitive.watchlist.brands.campaigns.list(watchlistBrandId, { range: 30, limit: 25 })) {
    console.log(campaign.id);
  }
}

export async function insights_email_competitive_watchlist_brands_campaigns_get() {
  // Requires competitive:read permission in the target workspace.
  const watchlist = await bird.email.competitive.watchlist.get({ range: 30 });
  const entry = watchlist.data.find((row) => row.name === "Everlane" && row.watchlist_brand_id);
  if (!entry?.watchlist_brand_id) throw new Error("Add Everlane to the watchlist first");
  const watchlistBrandId = entry.watchlist_brand_id;
  const page = await bird.email.competitive.watchlist.brands.campaigns.list(watchlistBrandId, { range: 30, limit: 1 });
  const campaign = page.data[0];
  if (!campaign) throw new Error("No captured campaigns");
  const report = await bird.email.competitive.watchlist.brands.campaigns.get(watchlistBrandId, campaign.id);
  console.log(report);
}

export async function insights_email_inboxInsights_domains_list() {
  // Requires inbox_insights:read permission in the target workspace.
  for await (const domain of bird.email.inboxInsights.domains.list({ limit: 25 })) {
    console.log(domain.domain, domain.monitored);
  }
}

export async function insights_email_inboxInsights_domains_update() {
  // Requires inbox_insights:write permission in the target workspace.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.domains.update(sendingDomain, { monitored: false });
  console.log(report.monitored);
}

export async function insights_email_inboxInsights_domainMonitoring_upsert() {
  // Requires inbox_insights:write permission in the target workspace.
  const result = await bird.email.inboxInsights.domainMonitoring.upsert();
  console.log(result.outcome, result.domain);
}

export async function insights_email_inboxInsights_placement() {
  // Requires inbox_insights:read permission in the target workspace.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.placement({ sending_domain: sendingDomain });
  console.log(report);
}

export async function insights_email_inboxInsights_authentication() {
  // Requires inbox_insights:read permission in the target workspace.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.authentication({ sending_domain: sendingDomain });
  console.log(report);
}

export async function insights_email_inboxInsights_complaints() {
  // Requires inbox_insights:read permission in the target workspace.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.complaints({ sending_domain: sendingDomain });
  console.log(report);
}

export async function insights_email_inboxInsights_spamTraps() {
  // Requires inbox_insights:read permission in the target workspace.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.spamTraps({ sending_domain: sendingDomain });
  console.log(report);
}

export async function insights_email_inboxInsights_blocklists() {
  // Requires inbox_insights:read permission in the target workspace.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.blocklists({ sending_domain: sendingDomain });
  console.log(report);
}

export async function insights_email_inboxInsights_benchmarks_industry() {
  // Requires inbox_insights:read permission in the target workspace.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.benchmarks.industry({ sending_domain: sendingDomain });
  console.log(report);
}

export async function emailStatsQuery() {
  const { data } = await bird.email.stats.query({
    from: "2026-09-23",
    to: "2026-09-24",
    metrics: ["delivered", "bounce_rate"],
    group_by: "recipient_domain",
    grain: "week",
    limit: 25,
  });
  for (const group of data) {
    console.log(group.dimensions, group.metrics, group.series);
  }
}

export async function seed_tests_configuration_get() {
  // Requires inbox_insights:read permission in the target workspace.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.seedTests.configuration.get({ sending_domain: sendingDomain });
  console.log(report);
}

export async function seed_tests_list() {
  // Requires inbox_insights:read permission in the target workspace.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.seedTests.list({ sending_domain: sendingDomain });
  console.log(report);
}

export async function seed_tests_create() {
  // Requires inbox_insights:write permission in the target workspace.
  const idempotencyKey = process.env.IDEMPOTENCY_KEY;
  if (!idempotencyKey) throw new Error("Set IDEMPOTENCY_KEY to a unique key for this registration and retain it for retries");
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const configuration = await bird.email.inboxInsights.seedTests.configuration.get({ sending_domain: sendingDomain });
  const pool = configuration.list_types.find(choice => choice.available);
  const profile = configuration.engagement_profiles.find(choice => choice.available);
  const region = configuration.regions[0];
  if (!pool || !profile || !region) throw new Error("No seed-test options available");

  const report = await bird.email.inboxInsights.seedTests.create({ sending_domain: sendingDomain, list_type: pool.value, engagement_profile: profile.value, regions: [region.value] }, { idempotencyKey });
  console.log(report);
}

export async function seeding_settings_get() {
  // Requires inbox_insights:read permission in the target workspace.
  const settings = await bird.email.seeding.settings.get();
  console.log(settings.enabled, settings.revision, settings.trigger_address);
}

export async function seeding_settings_update() {
  // Requires inbox_insights:write permission in the target workspace.
  const current = await bird.email.seeding.settings.get();
  const settings = await bird.email.seeding.settings.update({
    expected_revision: current.revision,
    enabled: true,
    list_type: "private",
    engagement_profile: "all",
    regions: ["North America - US"],
  });
  console.log(settings.enabled, settings.revision);
}

export async function seeding_address_rotate() {
  // Requires inbox_insights:write permission in the target workspace.
  const current = await bird.email.seeding.settings.get();
  const settings = await bird.email.seeding.address.rotate({
    expected_revision: current.revision,
  });
  console.log(settings.trigger_address);
}

export async function seeding_runs_list() {
  // Requires inbox_insights:read permission in the target workspace.
  for await (const run of bird.email.seeding.runs.list({ limit: 25 })) {
    console.log(run.id, run.state);
  }
}

export async function seeding_runs_get() {
  // Requires inbox_insights:read permission in the target workspace.
  const run = await bird.email.seeding.runs.get("esrun_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(run.state, run.progress);
}

export async function seeding_runs_cancel() {
  // Requires inbox_insights:write permission in the target workspace.
  const run = await bird.email.seeding.runs.cancel("esrun_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(run.state, run.progress);
}

export async function seeding_sources_list() {
  // Requires inbox_insights:read permission in the target workspace.
  for await (const source of bird.email.seeding.sources.list({ limit: 25 })) {
    console.log(source.state, source.run_id);
  }
}

export async function emailBlocksList() {
  // Requires email_management:read permission in the target workspace.
  for await (const block of bird.email.blocks.list({ q: "footer", archived: false })) {
    console.log(block.id, block.name, block.source_language);
  }
}

export async function emailBlocksGet() {
  // Requires email_management:read permission in the target workspace.
  const block = await bird.email.blocks.get("ebl_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(block.name, block.revision, block.archived_at);
}

export async function emailBlocksCreate() {
  // Requires email_management:write permission in the target workspace.
  const section =
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tbody><tr>' +
    '<td lang="en" style="font-family: Arial, sans-serif; font-size: 14px; font-style: normal; font-weight: normal; ' +
    'line-height: 20px; letter-spacing: normal; text-align: left; text-transform: none; color: #333333; margin: 0; padding: 16px;">' +
    '<p style="margin: 0;">Offer valid until {{ expiry_date }}.</p></td></tr></tbody></table>';
  const block = await bird.email.blocks.create({
    name: "Legal footer",
    source_language: "en",
    fragment: { serializer_version: 2, fragment_html: section },
  });
  console.log(block.id, block.revision);
}

export async function emailBlocksUpdate() {
  // Requires email_management:write permission in the target workspace.
  const current = await bird.email.blocks.get("ebl_01krdgeqcxet5s7t44vh8rt9mg");
  const block = await bird.email.blocks.update(current.id, {
    revision: current.revision,
    archived: true,
  });
  console.log(block.archived_at);
}

export async function emailBlocksDuplicate() {
  // Requires email_management:write permission in the target workspace.
  const source = await bird.email.blocks.get("ebl_01krdgeqcxet5s7t44vh8rt9mg");
  const copy = await bird.email.blocks.duplicate(source.id, {
    revision: source.revision,
    name: "Legal footer (EU)",
  });
  console.log(copy.id);
}

export async function emailBlocksValidate() {
  // Requires email_management:read permission in the target workspace.
  const section =
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tbody><tr>' +
    '<td lang="en" style="font-family: Arial, sans-serif; font-size: 14px; font-style: normal; font-weight: normal; ' +
    'line-height: 20px; letter-spacing: normal; text-align: left; text-transform: none; color: #333333; margin: 0; padding: 16px;">' +
    '<p style="margin: 0;">Offer valid until {{ expiry_date }}.</p></td></tr></tbody></table>';
  const result = await bird.email.blocks.validate({
    language: "en",
    fragment: { serializer_version: 2, fragment_html: section },
  });
  console.log(result.text);
}

export async function emailBlocksPublish() {
  // Requires email_management:write permission in the target workspace.
  const blockId = "ebl_01krdgeqcxet5s7t44vh8rt9mg";
  const draft = await bird.email.blocks.languages.get(blockId, "en");
  const submission = await bird.email.blocks.publish(blockId, {
    languages: [{ language: "en", revision: draft.revision }],
  });
  console.log(submission.status, submission.published_revisions);
}

export async function emailBlocksLanguagesList() {
  // Requires email_management:read permission in the target workspace.
  const languages = await bird.email.blocks.languages.list("ebl_01krdgeqcxet5s7t44vh8rt9mg");
  for (const language of languages.data) {
    console.log(language.language, language.revision, language.published_revision_id);
  }
}

export async function emailBlocksLanguagesGet() {
  // Requires email_management:read permission in the target workspace.
  const draft = await bird.email.blocks.languages.get("ebl_01krdgeqcxet5s7t44vh8rt9mg", "en");
  console.log(draft.authoring_mode, draft.revision, draft.fragment.fragment_html);
}

export async function emailBlocksLanguagesSet() {
  // Requires email_management:write permission in the target workspace.
  const section =
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tbody><tr>' +
    '<td lang="fr" style="font-family: Arial, sans-serif; font-size: 14px; font-style: normal; font-weight: normal; ' +
    'line-height: 20px; letter-spacing: normal; text-align: left; text-transform: none; color: #333333; margin: 0; padding: 16px;">' +
    '<p style="margin: 0;">Offre valable jusqu\'au {{ expiry_date }}.</p></td></tr></tbody></table>';
  const draft = await bird.email.blocks.languages.set("ebl_01krdgeqcxet5s7t44vh8rt9mg", "fr", {
    revision: 0,
    fragment: { serializer_version: 2, fragment_html: section },
  });
  console.log(draft.revision);
}

export async function emailBlocksLanguagesDelete() {
  // Requires email_management:write permission in the target workspace.
  await bird.email.blocks.languages.delete("ebl_01krdgeqcxet5s7t44vh8rt9mg", "fr");
}

export async function emailBlocksLanguagesRevisionsList() {
  // Requires email_management:read permission in the target workspace.
  for await (const revision of bird.email.blocks.languages.revisions.list(
    "ebl_01krdgeqcxet5s7t44vh8rt9mg",
    "en",
  )) {
    console.log(revision.id, revision.version_number, revision.published_at);
  }
}

export async function emailBlocksLanguagesRevisionsGet() {
  // Requires email_management:read permission in the target workspace.
  const revision = await bird.email.blocks.languages.revisions.get(
    "ebl_01krdgeqcxet5s7t44vh8rt9mg",
    "en",
    "ebr_01krdgeqcxet5s7t44vh8rt9mg",
  );
  console.log(revision.version_number, revision.fragment.fragment_html);
}
