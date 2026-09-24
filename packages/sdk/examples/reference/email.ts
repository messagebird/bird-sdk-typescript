// HAND-WRITTEN example source for GENERATED email methods. Compiled + type-checked
// (examples/tsconfig.json includes **/*.ts, aliasing @messagebird/sdk -> ../src).
// Each `bird:snippet` region is the single source of truth for that key: the
// surfacegen TS writer injects it (unmarked) as the @example on the generated
// method, and docsnippet-gen extracts it here for the docs site + README.
// (Override methods — email.send/sendBatch — keep their examples inline in
// src/resources/email.ts, since nothing regenerates over a hand-written method.)

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function emailGet() {
  const msg = await bird.email.get("em_abc123");
  msg.status; // "accepted" | "processed" | "delivered" | "bounced" | …
  msg.delivered_count;
  msg.bounced_count;
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
  const mailbox = await bird.email.mailboxes.create({ display_name: "Support" });
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

export async function mailboxStats() {
  const stats = await bird.email.mailboxes.stats("mbx_01abc");
  console.log(stats.summary?.sends_accepted);
}

export async function mailboxLabels() {
  const labels = await bird.email.mailboxes.labels("mbx_01abc");
  console.log(labels.data.map((label) => label.name));
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
    labels: { add: ["archive"] },
  });
  console.log(thread.id);
}

export async function mailboxThreadDelete() {
  await bird.email.threads.delete("thr_01abc", { permanent: true });
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

export async function insights_email_competitive_brands_search() {
  // Requires Insights preview access for the organization.
  const report = await bird.email.competitive.brands.search({ q: "Everlane" });
  console.log(report.data);
}

export async function insights_email_competitive_watchlist_get() {
  // Requires Insights preview access for the organization.
  const report = await bird.email.competitive.watchlist.get({ range: 30 });
  console.log(report.data);
}

export async function insights_email_competitive_watchlist_brands_create() {
  // Requires Insights preview access for the organization.
  const matches = await bird.email.competitive.brands.search({ q: "Everlane" });
  const match = matches.data.find((brand) => brand.name === "Everlane");
  if (!match) throw new Error("No exact Everlane match");
  const entry = await bird.email.competitive.watchlist.brands.create({ brand_id: match.brand_id });
  console.log(entry.id);
}

export async function insights_email_competitive_watchlist_brands_get() {
  // Requires Insights preview access for the organization.
  const watchlist = await bird.email.competitive.watchlist.get({ range: 30 });
  const entry = watchlist.data.find((row) => row.name === "Everlane" && row.watchlist_brand_id);
  if (!entry?.watchlist_brand_id) throw new Error("Add Everlane to the watchlist first");
  const watchlistBrandId = entry.watchlist_brand_id;
  const report = await bird.email.competitive.watchlist.brands.get(watchlistBrandId, { range: 30 });
  console.log(report);
}

export async function insights_email_competitive_watchlist_brands_sendTime() {
  // Requires Insights preview access for the organization.
  const watchlist = await bird.email.competitive.watchlist.get({ range: 30 });
  const entry = watchlist.data.find((row) => row.name === "Everlane" && row.watchlist_brand_id);
  if (!entry?.watchlist_brand_id) throw new Error("Add Everlane to the watchlist first");
  const watchlistBrandId = entry.watchlist_brand_id;
  const report = await bird.email.competitive.watchlist.brands.sendTime(watchlistBrandId, { timezone: "UTC" });
  console.log(report);
}

export async function insights_email_competitive_watchlist_brands_delete() {
  // Requires Insights preview access for the organization.
  const watchlist = await bird.email.competitive.watchlist.get({ range: 30 });
  const entry = watchlist.data.find((row) => row.name === "Everlane" && row.watchlist_brand_id);
  if (!entry?.watchlist_brand_id) throw new Error("Add Everlane to the watchlist first");
  const watchlistBrandId = entry.watchlist_brand_id;
  await bird.email.competitive.watchlist.brands.delete(watchlistBrandId);
}

export async function insights_email_competitive_watchlist_notable() {
  // Requires Insights preview access for the organization.
  const report = await bird.email.competitive.watchlist.notable({ range: 30 });
  console.log(report);
}

export async function insights_email_competitive_volumeSeries() {
  // Requires Insights preview access for the organization.
  const watchlist = await bird.email.competitive.watchlist.get({ range: 30 });
  const entry = watchlist.data.find((row) => row.name === "Everlane" && row.watchlist_brand_id);
  if (!entry?.watchlist_brand_id) throw new Error("Add Everlane to the watchlist first");
  const watchlistBrandId = entry.watchlist_brand_id;
  const report = await bird.email.competitive.volumeSeries({ range: 30, brand_ids: [watchlistBrandId] });
  console.log(report);
}

export async function insights_email_competitive_watchlist_brands_campaigns_list() {
  // Requires Insights preview access for the organization.
  const watchlist = await bird.email.competitive.watchlist.get({ range: 30 });
  const entry = watchlist.data.find((row) => row.name === "Everlane" && row.watchlist_brand_id);
  if (!entry?.watchlist_brand_id) throw new Error("Add Everlane to the watchlist first");
  const watchlistBrandId = entry.watchlist_brand_id;
  for await (const campaign of bird.email.competitive.watchlist.brands.campaigns.list(watchlistBrandId, { range: 30, limit: 25 })) {
    console.log(campaign.id);
  }
}

export async function insights_email_competitive_watchlist_brands_campaigns_get() {
  // Requires Insights preview access for the organization.
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
  // Requires Insights preview access for the organization.
  for await (const domain of bird.email.inboxInsights.domains.list({ limit: 25 })) {
    console.log(domain.domain, domain.monitored);
  }
}

export async function insights_email_inboxInsights_domains_update() {
  // Requires Insights preview access for the organization.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.domains.update(sendingDomain, { monitored: false });
  console.log(report.monitored);
}

export async function insights_email_inboxInsights_domainMonitoring_upsert() {
  // Requires Insights preview access for the organization.
  const result = await bird.email.inboxInsights.domainMonitoring.upsert();
  console.log(result.outcome, result.domain);
}

export async function insights_email_inboxInsights_placement() {
  // Requires Insights preview access for the organization.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.placement({ sending_domain: sendingDomain });
  console.log(report);
}

export async function insights_email_inboxInsights_authentication() {
  // Requires Insights preview access for the organization.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.authentication({ sending_domain: sendingDomain });
  console.log(report);
}

export async function insights_email_inboxInsights_complaints() {
  // Requires Insights preview access for the organization.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.complaints({ sending_domain: sendingDomain });
  console.log(report);
}

export async function insights_email_inboxInsights_spamTraps() {
  // Requires Insights preview access for the organization.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.spamTraps({ sending_domain: sendingDomain });
  console.log(report);
}

export async function insights_email_inboxInsights_blocklists() {
  // Requires Insights preview access for the organization.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.blocklists({ sending_domain: sendingDomain });
  console.log(report);
}

export async function insights_email_inboxInsights_benchmarks_industry() {
  // Requires Insights preview access for the organization.
  let sendingDomain: string | undefined;
  for await (const domain of bird.email.inboxInsights.domains.list({ search: "mail.example.com" })) {
    if (domain.domain === "mail.example.com") { sendingDomain = domain.domain; break; }
  }
  if (!sendingDomain) throw new Error("Verify mail.example.com in this workspace first");
  const report = await bird.email.inboxInsights.benchmarks.industry({ sending_domain: sendingDomain });
  console.log(report);
}

export async function emailStatsQuery() {
  for await (const group of bird.email.stats.query({
    from: "2026-08-03",
    to: "2026-08-16",
    metrics: ["delivered", "bounce_rate"],
    group_by: "recipient_domain",
    grain: "week",
    limit: 25,
  })) {
    console.log(group.dimensions, group.metrics, group.series);
  }
}
