// HAND-WRITTEN example source for GENERATED sms methods. Compiled +
// type-checked (examples/tsconfig.json includes **/*.ts, aliasing
// @messagebird/sdk -> ../src). Each `bird:snippet` region is the single source
// of truth for that key: the surfacegen TS writer injects it (unmarked) as the
// @example on the generated method, and docsnippet-gen extracts it here for the
// docs site + README. The sends stay hand-written, so their examples stay inline
// in src/resources/sms.ts.

import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function smsGet() {
  const msg = await bird.sms.get("sms_abc123");
  msg.status; // "accepted" | "delivered" | …
}

export async function smsList() {
  for await (const msg of bird.sms.list({ direction: "outbound" })) {
    console.log(msg.id, msg.status);
  }
}

export async function smsListEvents() {
  const events = await bird.sms.listEvents("sms_abc123");
  for (const event of events.data ?? []) {
    console.log(event.type, event.occurred_at);
  }
}

export async function smsStatsSummary() {
  const summary = await bird.sms.stats.summary({
    from: "2026-05-01", // both calendar days for a day window, or
    to: "2026-05-31", //   both RFC 3339 instants for an hour window
  });
  console.log(summary.delivery, summary.latency);
}

export async function smsStatsDaily() {
  const stats = await bird.sms.stats.daily({ from: "2026-05-01", to: "2026-05-31" });
  for (const point of stats.data ?? []) {
    console.log(point.bucket, point.delivery);
  }
}

export async function smsStatsHourly() {
  const stats = await bird.sms.stats.hourly({
    from: "2026-05-30T00:00:00Z",
    to: "2026-05-31T00:00:00Z",
  });
  for (const point of stats.data ?? []) {
    console.log(point.bucket, point.delivery);
  }
}

export async function smsStatsByCountry() {
  const stats = await bird.sms.stats.byCountry({
    from: "2026-05-01",
    to: "2026-05-31",
    sort: "delivery_rate",
  });
  for (const row of stats.data ?? []) {
    console.log(row.country, row.delivery);
  }
}

export async function smsStatsByCarrier() {
  const stats = await bird.sms.stats.byCarrier({ from: "2026-05-01", to: "2026-05-31" });
  for (const row of stats.data ?? []) {
    console.log(row.carrier, row.delivery);
  }
}

export async function smsStatsByCategory() {
  const stats = await bird.sms.stats.byCategory({ from: "2026-05-01", to: "2026-05-31" });
  for (const row of stats.data ?? []) {
    console.log(row.category, row.delivery);
  }
}

export async function smsStatsByOriginator() {
  const stats = await bird.sms.stats.byOriginator({ from: "2026-05-01", to: "2026-05-31" });
  for (const row of stats.data ?? []) {
    console.log(row.originator, row.delivery);
  }
}

export async function smsStatsByStatus() {
  const stats = await bird.sms.stats.byStatus({ from: "2026-05-01", to: "2026-05-31" });
  for (const row of stats.data ?? []) {
    console.log(row.status, row.count);
  }
}

export async function smsStatsByErrorCode() {
  const stats = await bird.sms.stats.byErrorCode({ from: "2026-05-01", to: "2026-05-31" });
  for (const row of stats.data ?? []) {
    // The same value as the error_code filter on bird.sms.list.
    console.log(row.error_code, row.delivery);
  }
}

export async function smsStatsByTag() {
  const stats = await bird.sms.stats.byTag({ from: "2026-05-01", to: "2026-05-31" });
  for (const row of stats.data ?? []) {
    // A message carrying several tags counts once under each, so rows do not sum
    // to the period total.
    console.log(row.tag, row.delivery);
  }
}

export async function smsStatsInboundSummary() {
  const summary = await bird.sms.stats.inbound.summary({ from: "2026-05-01", to: "2026-05-31" });
  console.log(summary.received);
}

export async function smsStatsInboundDaily() {
  const stats = await bird.sms.stats.inbound.daily({ from: "2026-05-01", to: "2026-05-31" });
  for (const point of stats.data ?? []) {
    console.log(point.bucket, point.received);
  }
}

export async function smsStatsInboundHourly() {
  const stats = await bird.sms.stats.inbound.hourly({
    from: "2026-05-30T00:00:00Z",
    to: "2026-05-31T00:00:00Z",
  });
  for (const point of stats.data ?? []) {
    console.log(point.bucket, point.received);
  }
}

export async function smsStatsInboundByCountry() {
  const stats = await bird.sms.stats.inbound.byCountry({ from: "2026-05-01", to: "2026-05-31" });
  for (const row of stats.data ?? []) {
    console.log(row.country, row.received);
  }
}

export async function smsStatsInboundByOperator() {
  const stats = await bird.sms.stats.inbound.byOperator({ from: "2026-05-01", to: "2026-05-31" });
  for (const row of stats.data ?? []) {
    // Messages whose operator the carrier did not report are excluded, so these
    // rows can sum to less than the inbound summary for the same period.
    console.log(row.mcc_mnc, row.received);
  }
}

export async function smsStatsInboundByNumber() {
  const stats = await bird.sms.stats.inbound.byNumber({ from: "2026-05-01", to: "2026-05-31" });
  for (const row of stats.data ?? []) {
    console.log(row.number, row.received);
  }
}

export async function smsSuppressionsList() {
  for await (const suppression of bird.smsSuppressions.list()) {
    console.log(suppression.originator, suppression.destination, suppression.reason);
  }
}

export async function smsSuppressionsGet() {
  const suppression = await bird.smsSuppressions.get("sup_abc123");
  console.log(suppression.reason, suppression.blocking);
}

export async function smsSuppressionsAdd() {
  // A suppression covers one sender and one subscriber, so stopping every sender
  // means one call per sender.
  const suppression = await bird.smsSuppressions.add({
    destination: "+15550001234",
    originator: "+15557654321",
  });
  console.log(suppression.id);
}

export async function smsSuppressionsRemove() {
  // Only a `manual` suppression can be ended: a subscriber's own stop keyword and
  // a carrier's opt-out are refused.
  await bird.smsSuppressions.remove("sup_abc123");
}
export async function smsKeywordRulesList() {
  const rules = await bird.smsKeywordRules.list({ country: "NL" });
  for (const rule of rules.data) {
    console.log(rule.operation, rule.keywords);
  }
}

export async function smsKeywordRulesGet() {
  const rule = await bird.smsKeywordRules.get("skr_abc123");
  console.log(rule.operation, rule.reply);
}

export async function smsKeywordRulesCreate() {
  const rule = await bird.smsKeywordRules.create({
    operation: "stop",
    country: "NL",
    reply: "You are unsubscribed from MyBrand. Reply START to resume.",
  });
  // effective_keywords is Bird's set plus any of your own.
  console.log(rule.id, rule.effective_keywords);
}

export async function smsKeywordRulesUpdate() {
  // Omitting keywords leaves the set alone; an empty array clears your additions
  // back to Bird's.
  const rule = await bird.smsKeywordRules.update("skr_abc123", {
    reply: "You are unsubscribed. Reply START to resume.",
  });
  console.log(rule.reply);
}

export async function smsKeywordRulesDelete() {
  await bird.smsKeywordRules.delete("skr_abc123");
}
