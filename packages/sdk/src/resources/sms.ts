// Use the `bird.sms` channel to send SMS messages and read their status.

import {
  createSmsMessage,
  createSmsMessageBatch,
} from "../generated/sdk.gen.js";
import type {
  SmsMessage,
  SmsMessageBatchRequest,
  SmsMessageBatchResponse,
  SmsMessageSendRequest,
} from "../generated/types.gen.js";
import { Resource } from "./base.js";
import { SmsResourceBase } from "./sms.gen.js";
import { SmsMessagesResource } from "./smsMessages.js";
import { SmsStatsResource } from "./smsStats.js";
import type { APIPromise, RequestOptions } from "../core/result.js";

/**
 * Body for `bird.sms.send`. Supply direct content (`text` and/or `media_urls`
 * with `category` and `from`), a stored `template`, or `binary`. A workspace template requires an owned `from`; a built-in
 * template selects its sender and rejects `from`. A `subject` or `media_urls`
 * selects MMS for +1 recipients; supply text or at least one absolute HTTP(S) media URL.
 * Templates and binary cannot carry MMS fields.
 */
export type SmsSendParams = SmsMessageSendRequest;
/** Body for `bird.sms.sendBatch`. Contains up to 100 sends. */
export type SmsSendBatchParams = SmsMessageBatchRequest;
/** Result of `bird.sms.sendBatch`. */
export type SmsSendBatchResult = SmsMessageBatchResponse;
/** Filters and cursor params for `bird.sms.list`. */

export class SmsResource extends SmsResourceBase {
  /** SMS statistics: `bird.sms.stats.summary(...)`, `.daily(...)`, `.inbound.byNumber(...)`, … */
  readonly stats: SmsStatsResource;
  readonly messages: SmsMessagesResource;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.messages = new SmsMessagesResource(core, client);
    this.stats = new SmsStatsResource(core, client);
  }

  /**
   * Send one SMS or MMS to a single recipient. Supply direct content (`text`
   * and/or `media_urls`, with `category` and `from`) or a stored `template` (by `id` or `slug`, with its `parameters`). A workspace
   * template requires an owned `from`; a built-in template selects its sender and
   * rejects `from`. The API accepts the message for delivery. Read it back with
   * `get` for the latest status. For MMS to a +1 recipient, supply `subject`
   * and/or `media_urls` with text or at least one absolute HTTP(S) media URL.
   *
   * @example Send free text
   * const msg = await bird.sms.send({
   *   from: "+15557654321",
   *   to: "+14155550100",
   *   text: "Your verification code is 123456.",
   *   category: "authentication",
   * });
   * console.log(msg.id, msg.status);
   *
   * @example Send by template
   * await bird.sms.send({
   *   to: "+14155550100",
   *   template: { slug: "bird_otp_verification", parameters: { code: "123456" } },
   * });
   */
  send(
    params: SmsSendParams,
    options?: RequestOptions,
  ): APIPromise<SmsMessage> {
    return this.call<SmsMessage>("POST", options, ({ signal, headers }) =>
      createSmsMessage({ client: this.client, body: params, headers, signal }),
    );
  }

  /**
   * Send up to 100 independent SMS messages in one call. Each item under
   * `messages` is a full send (free text or template); all items are validated
   * before any are queued.
   *
   * Passing a bare array of sends is deprecated — wrap them in
   * `{ messages: [...] }`.
   *
   * @example
   * const result = await bird.sms.sendBatch({
   *   messages: [
   *     {
   *       from: "+15557654321",
   *       to: "+15551111111",
   *       text: "Hi Alice!",
   *       category: "marketing",
   *     },
   *     {
   *       from: "+15557654321",
   *       to: "+15552222222",
   *       text: "Hi Bob!",
   *       category: "marketing",
   *     },
   *   ],
   * });
   */
  sendBatch(
    params: SmsSendBatchParams | SmsSendParams[],
    options?: RequestOptions,
  ): APIPromise<SmsSendBatchResult> {
    const body: SmsSendBatchParams = Array.isArray(params)
      ? { messages: params }
      : params;
    return this.call<SmsSendBatchResult>(
      "POST",
      options,
      ({ signal, headers }) =>
        createSmsMessageBatch({
          client: this.client,
          body,
          headers,
          signal,
        }),
    );
  }
}
