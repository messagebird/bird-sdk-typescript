export {
  BirdClient,
  type BirdClientOptions,
  type BirdRequest,
} from "./client.js";
export {
  // base + transport
  BirdError,
  BirdConnectionError,
  BirdTimeoutError,
  BirdAPIError,
  // one per error `type`
  BirdAuthError,
  BirdPermissionError,
  BirdNotFoundError,
  BirdConflictError,
  BirdBadRequestError,
  BirdBillingError,
  BirdPreconditionError,
  BirdPayloadTooLargeError,
  BirdInternalError,
  BirdNotImplementedError,
  BirdMisdirectedError,
  BirdServiceUnavailableError,
  BirdValidationError,
  BirdRateLimitError,
  BirdWebhookVerificationError,
  BirdMissingApiKeyError,
  type ErrorDetail,
  type NextAction,
} from "./errors.js";
export { regionFromApiKey, baseUrlForRegion } from "./region.js";
export type {
  APIPromise,
  PaginatedPromise,
  CursorPage,
  RequestOptions,
  SafeResult,
} from "./core/result.js";
export type { BirdResponse } from "./core/http.js";
export type {
  EmailMessage,
  EmailSendParams,
  EmailSendBatchParams,
  EmailSendBatchResult,
  EmailListQuery,
  EmailChannelDefaults,
} from "./resources/email.js";
export type {
  // response types
  EmailStatsSummary,
  EmailStatsResponse,
  EmailStatsTagsResponse,
  EmailStatsByCategoryResponse,
  EmailStatsBySendingIpResponse,
  EmailStatsBySendingDomainResponse,
  EmailStatsByRecipientDomainResponse,
  EmailStatsByMailboxProviderResponse,
  EmailStatsByMailboxProviderRegionResponse,
  EmailStatsByTemplateResponse,
  EmailStatsByLocationResponse,
  EmailStatsByClientResponse,
  EmailStatsByBounceCodeResponse,
  EmailStatsByComplaintTypeResponse,
  EmailStatsByBroadcastResponse,
  // per-method query params
  EmailStatsSummaryQuery,
  EmailStatsDailyQuery,
  EmailStatsHourlyQuery,
  EmailStatsByTagQuery,
  EmailStatsByCategoryQuery,
  EmailStatsBySendingIpQuery,
  EmailStatsBySendingDomainQuery,
  EmailStatsByRecipientDomainQuery,
  EmailStatsByMailboxProviderQuery,
  EmailStatsByMailboxProviderRegionQuery,
  EmailStatsByTemplateQuery,
  EmailStatsByLocationQuery,
  EmailStatsByClientQuery,
  EmailStatsByBounceCodeQuery,
  EmailStatsByComplaintTypeQuery,
  EmailStatsByBroadcastQuery,
} from "./resources/emailStats.gen.js";
export type {
  SmsSendParams,
  SmsSendBatchParams,
  SmsSendBatchResult,
} from "./resources/sms.js";
export type { SmsMessage, SmsListQuery } from "./resources/sms.gen.js";
export type {
  SmsTemplate,
  SmsTemplateSummary,
  SmsTemplateListQuery,
} from "./resources/smsTemplates.gen.js";
export type {
  SmsTemplateList,
  SmsTemplateVersionLanguage,
  SmsTemplateLanguageSummary,
} from "./generated/types.gen.js";
export type {
  SmsTemplateVersion,
  SmsTemplateVersionSummary,
  SmsTemplatesVersionsListQuery,
} from "./resources/smsTemplatesVersions.gen.js";
export type {
  SmsTemplateLanguage,
  SmsTemplateLanguageList,
} from "./resources/smsTemplatesVersionsLanguages.gen.js";
export type {
  SmsStatsSummary,
  SmsStatsResponse,
  SmsStatsByCountryResponse,
  SmsStatsByCarrierResponse,
  SmsStatsByCategoryResponse,
  SmsStatsByOriginatorResponse,
  SmsStatsByStatusResponse,
  SmsStatsByErrorCodeResponse,
  SmsStatsSummaryQuery,
  SmsStatsDailyQuery,
  SmsStatsHourlyQuery,
  SmsStatsByCountryQuery,
  SmsStatsByCarrierQuery,
  SmsStatsByCategoryQuery,
  SmsStatsByOriginatorQuery,
  SmsStatsByStatusQuery,
  SmsStatsByErrorCodeQuery,
} from "./resources/smsStats.gen.js";
export type {
  SmsInboundStatsSummaryResponse,
  SmsInboundStatsResponse,
  SmsInboundStatsByCountryResponse,
  SmsInboundStatsByOperatorResponse,
  SmsInboundStatsByNumberResponse,
  SmsStatsInboundSummaryQuery,
  SmsStatsInboundDailyQuery,
  SmsStatsInboundHourlyQuery,
  SmsStatsInboundByCountryQuery,
  SmsStatsInboundByOperatorQuery,
  SmsStatsInboundByNumberQuery,
} from "./resources/smsStatsInbound.gen.js";
export type {
  SmsSuppression,
  SmsSuppressionsListQuery,
  SmsSuppressionsAddParams,
} from "./resources/smsSuppressions.gen.js";
export type {
  SmsKeywordRule,
  SmsKeywordRuleList,
  SmsKeywordRulesListQuery,
  SmsKeywordRulesCreateParams,
  SmsKeywordRulesUpdateParams,
} from "./resources/smsKeywordRules.gen.js";
export type { SmsEventList, SmsListEventsQuery } from "./resources/sms.gen.js";
export type {
  PhoneNumberLookup,
  EmailLookup,
  LookupPhoneNumberParams,
  LookupEmailParams,
} from "./resources/lookup.gen.js";
export type { WhatsappSendParams } from "./resources/whatsapp.js";
export type { WhatsappMedia } from "./resources/whatsappMessages.js";
export type {
  WhatsAppMessage,
  WhatsappListQuery,
  WhatsappListEventsQuery,
  WhatsAppEventList,
} from "./resources/whatsapp.gen.js";
export type {
  WhatsAppNumber,
  WhatsAppNumberEvent,
  WhatsappNumbersListQuery,
  WhatsappNumbersListEventsQuery,
} from "./resources/whatsappNumbers.gen.js";
export type { WhatsAppNumberProfile } from "./resources/whatsappNumbersProfile.gen.js";
export type {
  WhatsAppBusinessAccount,
  WhatsappBusinessAccountsListQuery,
} from "./resources/whatsappBusinessAccounts.gen.js";
export type {
  WhatsAppKeywordRule,
  WhatsAppKeywordRuleList,
  WhatsappKeywordRulesListQuery,
  WhatsappKeywordRulesCreateParams,
  WhatsappKeywordRulesUpdateParams,
} from "./resources/whatsappKeywordRules.gen.js";
export type {
  WhatsAppTemplate,
  WhatsappTemplatesListQuery,
} from "./resources/whatsappTemplates.gen.js";
export type {
  WhatsAppTemplateVersion,
  WhatsAppTemplateVersionSummary,
  WhatsappTemplatesVersionsListQuery,
} from "./resources/whatsappTemplatesVersions.gen.js";
export type {
  WhatsAppTemplateLanguage,
  WhatsAppTemplateLanguageList,
} from "./resources/whatsappTemplatesVersionsLanguages.gen.js";
export type {
  WhatsAppStatsSummary,
  WhatsAppStatsResponse,
  WhatsAppStatsByErrorCodeResponse,
  WhatsAppStatsByTemplateResponse,
  WhatsAppStatsByTemplateCategoryResponse,
  WhatsAppStatsByTagResponse,
  WhatsAppStatsByPhoneNumberResponse,
  WhatsAppStatsByCountryResponse,
  WhatsappStatsSummaryQuery,
  WhatsappStatsDailyQuery,
  WhatsappStatsHourlyQuery,
  WhatsappStatsByErrorCodeQuery,
  WhatsappStatsByTemplateQuery,
  WhatsappStatsByTemplateCategoryQuery,
  WhatsappStatsByTagQuery,
  WhatsappStatsByPhoneNumberQuery,
  WhatsappStatsByCountryQuery,
} from "./resources/whatsappStats.gen.js";
export type {
  WhatsAppInboundStatsSummaryResponse,
  WhatsAppInboundStatsResponse,
  WhatsAppInboundStatsByPhoneNumberResponse,
  WhatsappStatsInboundSummaryQuery,
  WhatsappStatsInboundDailyQuery,
  WhatsappStatsInboundHourlyQuery,
  WhatsappStatsInboundByPhoneNumberQuery,
} from "./resources/whatsappStatsInbound.gen.js";
export type {
  Verification,
  VerificationCheckResult,
  VerifyVerificationsCreateParams,
  VerifyVerificationsCheckParams,
  VerifyVerificationsNextChannelParams,
} from "./resources/verifyVerifications.gen.js";
export type {
  Preference,
  PreferencesListQuery,
} from "./resources/preferences.gen.js";
export type {
  PreferenceCreateParams,
  PreferenceWriteResult,
} from "./resources/preferences.js";
export type {
  EmailBroadcast,
  EmailBroadcastClickedLinkList,
  EmailBroadcastCounts,
  EmailBroadcastSendQuota,
  EmailEvent,
  EmailRecipient,
  BroadcastsListQuery,
  BroadcastsListEventsQuery,
  BroadcastsListRecipientsQuery,
} from "./resources/broadcasts.gen.js";
export type {
  BroadcastCreateParams,
  BroadcastUpdateParams,
  BroadcastSendParams,
} from "./resources/broadcasts.js";
export type { Workspace } from "./resources/workspace.gen.js";
export type {
  PreferenceStatus,
  PreferenceCoverage,
  TemplateStatus,
  EmailBroadcastClickedLink,
  EmailBroadcastStatus,
  EmailSendAllowanceWindow,
  RecipientRole,
} from "./generated/types.gen.js";
export type {
  Contact,
  ContactCreateParams,
  ContactUpdateParams,
  ContactBatchParams,
  ContactUpsertResult,
  ContactListQuery,
} from "./resources/contacts.gen.js";
export type {
  ContactsPreferencesListQuery,
} from "./resources/contactsPreferences.gen.js";
export type {
  Audience,
  AudienceMember,
  AudienceCreateParams,
  AudienceUpdateParams,
  AudienceAddContactsParams,
  AudienceRemoveContactsParams,
  AudienceListQuery,
  AudienceListContactsQuery,
} from "./resources/audiences.gen.js";
export type {
  ContactProperty,
  ContactPropertyCreateParams,
  ContactPropertyUpdateParams,
  ContactPropertyListQuery,
} from "./resources/contactProperties.gen.js";
export type {
  Domain,
  DomainCreateParams,
  DomainUpdateParams,
  DomainListQuery,
} from "./resources/domains.gen.js";
export type {
  DnsRecord,
  DomainDkim,
  DomainCapabilities,
} from "./generated/types.gen.js";
export type {
  Suppression,
  SuppressionsListQuery,
  SuppressionsAddParams,
} from "./resources/suppressions.gen.js";
export type { SuppressionScope } from "./generated/types.gen.js";
export type {
  BirdWebhookEvent,
  WebhookHeaders,
  WebhookOptions,
} from "./resources/webhooks.js";
export type {
  WebhookEndpoint,
  WebhookEndpointCreated,
  WebhookTestResponse,
  WebhookAttemptList,
  WebhookRotateSecretResponse,
  WebhooksListQuery,
  WebhooksCreateParams,
  WebhooksTestParams,
  WebhooksAttemptsQuery,
  WebhooksUpdateParams,
} from "./resources/webhooks.gen.js";
export type {
  // response types
  RealtimePublishResult,
  RealtimeBatchPublishResult,
  RealtimeChannelsList,
  RealtimeChannelListItem,
  RealtimeChannelInfo,
  RealtimeChannelMembers,
  RealtimeChannelMember,
  RealtimeChannelInclude,
  // request params and query
  RealtimePublishParams,
  RealtimePublishBatchParams,
  RealtimeChannelListQuery,
  RealtimeChannelGetQuery,
  // credentials: client config
  RealtimeOptions,
  // channel authorization (authorizeChannel's return shape)
  ChannelAuthorization,
} from "./resources/realtime.js";
export { WebhookEventType } from "./event-types.gen.js";
export type { WebhookEventTypeValue } from "./event-types.gen.js";
export {
  EmailClientFamily,
  EmailClientPlatform,
  EmailCompatibilityRuleID,
  EmailInboxInsightsGmailTab,
  EmailInboxInsightsDmarcReadinessReason,
  EmailInboxInsightsDmarcVerdict,
  EmailInboxInsightsTrapType,
  EmailInboxInsightsTrapSource,
  EmailCompetitiveCampaignSignal,
  EmailEventType,
  EmailLookupFlag,
  EmailLookupReason,
  EmailLookupResult,
  EmailTemplateSource,
  EmailTemplateTheme,
  LookupFlag,
  LookupPropertyStatus,
  NumberCapability,
  NumberType,
  NumbersOrderStatus,
  PreferenceChannel,
  PreferenceOrigin,
  SMSErrorCode,
  SMSKeywordOperation,
  SMSSuppressionCoverage,
  SMSSuppressionEndReason,
  SMSSuppressionOrigin,
  SMSSuppressionReason,
  TemplateLanguageStatus,
  VerificationAttemptFailureReason,
  VerificationChannel,
  VerificationTerminalReason,
  WhatsAppBusinessAccountMarketingMessagesStatus,
  WhatsAppBusinessAccountReviewStatus,
  WhatsAppBusinessAccountStatus,
  WhatsAppBusinessPortfolioMarketingMessagesStatus,
  WhatsAppBusinessVerificationStatus,
  WhatsAppBusinessVertical,
  WhatsAppDisplayNameStatus,
  WhatsAppErrorCode,
  WhatsAppEventType,
  WhatsAppInteractiveButtonType,
  WhatsAppInteractiveHeaderType,
  WhatsAppInteractiveReplyType,
  WhatsAppInteractiveType,
  WhatsAppKeywordOperation,
  WhatsAppNumberErrorCode,
  WhatsAppNumberMessagingLimit,
  WhatsAppNumberQualityRating,
  WhatsAppNumberStatus,
  WhatsAppNumberThroughputLevel,
  WhatsAppTemplateCategory,
  WhatsAppTemplateLanguageStatus,
  WhatsAppTemplateParameterType,
  WhatsAppTemplateQualityScore,
  WhatsAppTemplateRejectionCategory,
  WhatsAppUsernameStatus,
} from "./open-enums.gen.js";
export type {
  EmailClientFamilyValue,
  EmailClientPlatformValue,
  EmailCompatibilityRuleIDValue,
  EmailInboxInsightsGmailTabValue,
  EmailInboxInsightsDmarcReadinessReasonValue,
  EmailInboxInsightsDmarcVerdictValue,
  EmailInboxInsightsTrapTypeValue,
  EmailInboxInsightsTrapSourceValue,
  EmailCompetitiveCampaignSignalValue,
  EmailEventTypeValue,
  EmailLookupFlagValue,
  EmailLookupReasonValue,
  EmailLookupResultValue,
  EmailTemplateSourceValue,
  EmailTemplateThemeValue,
  LookupFlagValue,
  LookupPropertyStatusValue,
  NumberCapabilityValue,
  NumberTypeValue,
  NumbersOrderStatusValue,
  PreferenceChannelValue,
  PreferenceOriginValue,
  SMSErrorCodeValue,
  SMSKeywordOperationValue,
  SMSSuppressionCoverageValue,
  SMSSuppressionEndReasonValue,
  SMSSuppressionOriginValue,
  SMSSuppressionReasonValue,
  TemplateLanguageStatusValue,
  VerificationAttemptFailureReasonValue,
  VerificationChannelValue,
  VerificationTerminalReasonValue,
  WhatsAppBusinessAccountMarketingMessagesStatusValue,
  WhatsAppBusinessAccountReviewStatusValue,
  WhatsAppBusinessAccountStatusValue,
  WhatsAppBusinessPortfolioMarketingMessagesStatusValue,
  WhatsAppBusinessVerificationStatusValue,
  WhatsAppBusinessVerticalValue,
  WhatsAppDisplayNameStatusValue,
  WhatsAppErrorCodeValue,
  WhatsAppEventTypeValue,
  WhatsAppInteractiveButtonTypeValue,
  WhatsAppInteractiveHeaderTypeValue,
  WhatsAppInteractiveReplyTypeValue,
  WhatsAppInteractiveTypeValue,
  WhatsAppKeywordOperationValue,
  WhatsAppNumberErrorCodeValue,
  WhatsAppNumberMessagingLimitValue,
  WhatsAppNumberQualityRatingValue,
  WhatsAppNumberStatusValue,
  WhatsAppNumberThroughputLevelValue,
  WhatsAppTemplateCategoryValue,
  WhatsAppTemplateLanguageStatusValue,
  WhatsAppTemplateParameterTypeValue,
  WhatsAppTemplateQualityScoreValue,
  WhatsAppTemplateRejectionCategoryValue,
  WhatsAppUsernameStatusValue,
} from "./open-enums.gen.js";
export type {
  Mailbox,
  EmailMailboxesCreateParams,
  EmailMailboxesUpdateParams,
  EmailMailboxesUpdateQuery,
  EmailMailboxesListQuery,
  EmailMailboxesStatsQuery,
  MailboxStatsResponse,
  EmailMailboxLabelList,
} from "./resources/emailMailboxes.gen.js";
export type {
  EmailMailboxesMessagesCreateParams,
  EmailThreadMessage,
} from "./resources/emailMailboxesMessages.js";
export type {
  ReceiveRule,
  EmailMailboxesReceiveRulesCreateParams,
  EmailMailboxesReceiveRulesListQuery,
} from "./resources/emailMailboxesReceiveRules.gen.js";
export type {
  EmailThread,
  EmailThreadsListQuery,
  EmailThreadsDeleteQuery,
  EmailThreadsUpdateParams,
} from "./resources/emailThreads.gen.js";
export type {
  EmailThreadMessageBody,
  EmailThreadMessageAttachmentList,
  EmailThreadsMessagesListQuery,
  EmailThreadsMessagesReplyParams,
} from "./resources/emailThreadsMessages.gen.js";
export type {
  EmailTemplate,
  EmailTemplateSummary,
  EmailTemplatePreview,
  EmailTemplatesListQuery,
  EmailTemplatesUpdateParams,
  EmailTemplatesDuplicateParams,
  EmailTemplatesPreviewParams,
} from "./resources/emailTemplates.gen.js";
export type { EmailTemplatesCreateParams } from "./resources/emailTemplates.js";
export type {
  EmailTemplateBroadcastSummary,
  EmailTemplatesBroadcastsListQuery,
} from "./resources/emailTemplatesBroadcasts.gen.js";
export type {
  EmailTemplateVersion,
  EmailTemplateVersionSummary,
  EmailTemplateSubmitResult,
  EmailTemplatesVersionsListQuery,
  EmailTemplatesVersionsSubmitParams,
  EmailTemplatesVersionsRollbackParams,
} from "./resources/emailTemplatesVersions.gen.js";
export type {
  EmailTemplateLanguage,
  EmailTemplateLanguageList,
  EmailTemplateLanguageSaved,
  EmailTemplatesVersionsLanguagesSetParams,
  EmailTemplatesVersionsLanguagesUpdateParams,
} from "./resources/emailTemplatesVersionsLanguages.gen.js";

export type {
  EmailCompetitiveVolumeSeries,
  EmailCompetitiveVolumeSeriesQuery,
} from "./resources/emailCompetitive.gen.js";

export type {
  EmailCompetitiveBrandSearchResults,
  EmailCompetitiveBrandsSearchQuery,
} from "./resources/emailCompetitiveBrands.gen.js";

export type {
  EmailCompetitiveWatchlist,
  EmailCompetitiveNotableFeed,
  EmailCompetitiveWatchlistGetQuery,
  EmailCompetitiveWatchlistNotableQuery,
} from "./resources/emailCompetitiveWatchlist.gen.js";

export type {
  EmailCompetitiveWatchlistBrand,
  EmailCompetitiveBrandProfile,
  EmailCompetitiveSendTimeGrid,
  EmailCompetitiveWatchlistBrandsCreateParams,
  EmailCompetitiveWatchlistBrandsGetQuery,
  EmailCompetitiveWatchlistBrandsSendTimeQuery,
} from "./resources/emailCompetitiveWatchlistBrands.gen.js";

export type {
  EmailCompetitiveCampaign,
  EmailCompetitiveWatchlistBrandsCampaignsListQuery,
} from "./resources/emailCompetitiveWatchlistBrandsCampaigns.gen.js";

export type {
  EmailInboxInsightsPlacement,
  EmailInboxInsightsAuthentication,
  EmailInboxInsightsComplaints,
  EmailInboxInsightsSpamTraps,
  EmailInboxInsightsBlocklists,
  EmailInboxInsightsPlacementQuery,
  EmailInboxInsightsAuthenticationQuery,
  EmailInboxInsightsComplaintsQuery,
  EmailInboxInsightsSpamTrapsQuery,
  EmailInboxInsightsBlocklistsQuery,
} from "./resources/emailInboxInsights.gen.js";

export type {
  EmailInboxInsightsIndustryBenchmark,
  EmailInboxInsightsBenchmarksIndustryQuery,
} from "./resources/emailInboxInsightsBenchmarks.gen.js";

export type {
  EmailInboxInsightsDomainMonitoringResult,
} from "./resources/emailInboxInsightsDomainMonitoring.gen.js";

export type {
  EmailInboxInsightsDomain,
  EmailInboxInsightsDomainsListQuery,
  EmailInboxInsightsDomainsUpdateParams,
} from "./resources/emailInboxInsightsDomains.gen.js";
