import { BirdClient } from "@messagebird/sdk";

const bird = new BirdClient({ apiKey: process.env.BIRD_API_KEY! });

export async function ambBusinessAccountsDelete() {
  await bird.amb.businessAccounts.delete("abz_01krdgeqcxet5s7t44vh8rt9mg");
}

export async function ambBusinessAccountsReconnect() {
  const result = await bird.amb.businessAccounts.reconnect(
    "abz_01krdgeqcxet5s7t44vh8rt9mg",
  );
  console.log(result);
}

export async function ambBusinessAccountsEventsList() {
  const result = await bird.amb.businessAccounts.events.list(
    "abz_01krdgeqcxet5s7t44vh8rt9mg",
    { limit: 20 },
  );
  console.log(result);
}

export async function ambBusinessAccountsSettingsGet() {
  const result = await bird.amb.businessAccounts.settings.get(
    "abz_01krdgeqcxet5s7t44vh8rt9mg",
  );
  console.log(result);
}

export async function ambBusinessAccountsSettingsUpdate() {
  const result = await bird.amb.businessAccounts.settings.update(
    "abz_01krdgeqcxet5s7t44vh8rt9mg",
    { brand_name: "Acme Support", logo_asset_id: null },
  );
  console.log(result);
}

export async function ambBusinessAccountsSubmissionsList() {
  const result = await bird.amb.businessAccounts.submissions.list(
    "abz_01krdgeqcxet5s7t44vh8rt9mg",
    { limit: 2 },
  );
  console.log(result);
}

export async function ambBusinessAccountsSubmissionsCreate() {
  const result = await bird.amb.businessAccounts.submissions.create(
    "abz_01krdgeqcxet5s7t44vh8rt9mg",
    {
      readiness_attachment_id: "tca_01krdgeqcxet5s7t44vh8rt9mg",
      use_cases_attachment_id: "tca_01krdgeqcxet5s7t44vh8rt9mh",
      video_attachment_id: "tca_01krdgeqcxet5s7t44vh8rt9mj",
    },
  );
  console.log(result);
}

export async function ambBusinessAccountsGet() {
  const result = await bird.amb.businessAccounts.get(
    "abz_01krdgeqcxet5s7t44vh8rt9mg",
  );
  console.log(result);
}

export async function ambBusinessAccountsUpdate() {
  const result = await bird.amb.businessAccounts.update(
    "abz_01krdgeqcxet5s7t44vh8rt9mg",
    { name: "Acme Support" },
  );
  console.log(result);
}

export async function ambBusinessAccountsList() {
  const result = await bird.amb.businessAccounts.list({ limit: 2 });
  console.log(result);
}

export async function ambBusinessAccountsCreate() {
  const result = await bird.amb.businessAccounts.create({
    name: "Acme Retail",
    apple_business_id: "b52d6267-2b62-4f8a-8842-0533d0f1dc07",
  });
  console.log(result);
}

export async function ambConversationsGet() {
  const result = await bird.amb.conversations.get(
    "acv_01krdgeqcxet5s7t44vh8rt9mg",
  );
  console.log(result);
}

export async function ambConversationsUpdate() {
  const result = await bird.amb.conversations.update(
    "acv_01krdgeqcxet5s7t44vh8rt9mg",
    { assigned_to: null, labels: [], read: false },
  );
  console.log(result);
}

export async function ambConversationsListMessages() {
  const result = await bird.amb.conversations.listMessages(
    "acv_01krdgeqcxet5s7t44vh8rt9mg",
    { limit: 2 },
  );
  console.log(result);
}

export async function ambConversationsTyping() {
  const result = await bird.amb.conversations.typing(
    "acv_01krdgeqcxet5s7t44vh8rt9mg",
    { event: "typing_start" },
  );
  console.log(result);
}

export async function ambConversationsList() {
  const result = await bird.amb.conversations.list({
    business_account_id: "abz_01krdgeqcxet5s7t44vh8rt9mg",
    limit: 2,
  });
  console.log(result);
}

export async function ambListEvents() {
  const result = await bird.amb.listEvents("amb_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(result);
}

export async function ambGet() {
  const result = await bird.amb.get("amb_01krdgeqcxet5s7t44vh8rt9mg");
  console.log(result);
}

export async function ambList() {
  const result = await bird.amb.list({
    business_account_id: "abz_01krdgeqcxet5s7t44vh8rt9mg",
    limit: 2,
  });
  console.log(result);
}

export async function ambSend() {
  const result = await bird.amb.send({
    from: "b52d6267-2b62-4f8a-8842-0533d0f1dc07",
    to: "opaque-customer",
    content: { type: "text", body: "Your order is ready." },
  });
  console.log(result);
}

export async function ambRoutingRulesGet() {
  const result = await bird.amb.routingRules.get(
    "arr_01krdgeqcxet5s7t44vh8rt9mg",
  );
  console.log(result);
}

export async function ambRoutingRulesUpdate() {
  const result = await bird.amb.routingRules.update(
    "arr_01krdgeqcxet5s7t44vh8rt9mg",
    { queue: "sales", precedence: 0, is_default: false },
  );
  console.log(result);
}

export async function ambRoutingRulesDelete() {
  const result = await bird.amb.routingRules.delete(
    "arr_01krdgeqcxet5s7t44vh8rt9mg",
  );
  console.log(result);
}

export async function ambRoutingRulesList() {
  const result = await bird.amb.routingRules.list({
    business_account_id: "abz_01krdgeqcxet5s7t44vh8rt9mg",
  });
  console.log(result);
}

export async function ambRoutingRulesCreate() {
  const result = await bird.amb.routingRules.create({
    business_account_id: "abz_01krdgeqcxet5s7t44vh8rt9mg",
    match_kind: "intent",
    match_intent_id: "support",
    queue: "support",
    precedence: 0,
    is_default: false,
    match_group_id: null,
  });
  console.log(result);
}

export async function ambStatsByBusiness() {
  const result = await bird.amb.stats.byBusiness({ limit: 2 });
  console.log(result);
}

export async function ambStatsByCategory() {
  const result = await bird.amb.stats.byCategory({ limit: 2 });
  console.log(result);
}

export async function ambStatsConversationsDaily() {
  const result = await bird.amb.stats.conversations.daily();
  console.log(result);
}

export async function ambStatsConversationsHourly() {
  const result = await bird.amb.stats.conversations.hourly();
  console.log(result);
}

export async function ambStatsConversationsSummary() {
  const result = await bird.amb.stats.conversations.summary();
  console.log(result);
}

export async function ambStatsDaily() {
  const result = await bird.amb.stats.daily({
    business_account_id: "abz_01krdgeqcxet5s7t44vh8rt9mg",
  });
  console.log(result);
}

export async function ambStatsByErrorCode() {
  const result = await bird.amb.stats.byErrorCode({ limit: 2 });
  console.log(result);
}

export async function ambStatsByGroup() {
  const result = await bird.amb.stats.byGroup({ limit: 2 });
  console.log(result);
}

export async function ambStatsHourly() {
  const result = await bird.amb.stats.hourly({
    business_account_id: "abz_01krdgeqcxet5s7t44vh8rt9mg",
  });
  console.log(result);
}

export async function ambStatsInboundByBusiness() {
  const result = await bird.amb.stats.inbound.byBusiness({ limit: 2 });
  console.log(result);
}

export async function ambStatsInboundDaily() {
  const result = await bird.amb.stats.inbound.daily();
  console.log(result);
}

export async function ambStatsInboundHourly() {
  const result = await bird.amb.stats.inbound.hourly();
  console.log(result);
}

export async function ambStatsInboundByIntent() {
  const result = await bird.amb.stats.inbound.byIntent({ limit: 2 });
  console.log(result);
}

export async function ambStatsInboundSummary() {
  const result = await bird.amb.stats.inbound.summary();
  console.log(result);
}

export async function ambStatsByIntent() {
  const result = await bird.amb.stats.byIntent({ limit: 2 });
  console.log(result);
}

export async function ambStatsByMessageKind() {
  const result = await bird.amb.stats.byMessageKind({ limit: 2 });
  console.log(result);
}

export async function ambStatsSummary() {
  const result = await bird.amb.stats.summary({
    business_account_id: "abz_01krdgeqcxet5s7t44vh8rt9mg",
  });
  console.log(result);
}

export async function ambStatsByTag() {
  const result = await bird.amb.stats.byTag({ limit: 2 });
  console.log(result);
}

export async function ambSuppressionsGet() {
  const result = await bird.amb.suppressions.get(
    "asp_01krdgeqcxet5s7t44vh8rt9mg",
  );
  console.log(result);
}

export async function ambSuppressionsDelete() {
  const result = await bird.amb.suppressions.delete(
    "asp_01krdgeqcxet5s7t44vh8rt9mg",
  );
  console.log(result);
}

export async function ambSuppressionsList() {
  const result = await bird.amb.suppressions.list({
    business_account_id: "abz_01krdgeqcxet5s7t44vh8rt9mg",
    limit: 2,
  });
  console.log(result);
}

export async function ambSuppressionsCreate() {
  const result = await bird.amb.suppressions.create({
    address: "opaque-customer",
    address_type: "opaque_user_id",
  });
  console.log(result);
}
