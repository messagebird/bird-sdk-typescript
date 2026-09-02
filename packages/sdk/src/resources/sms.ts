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
import { SmsStatsResource } from "./smsStats.js";
import type { APIPromise, RequestOptions } from "../core/result.js";

/**
 * Body for `bird.sms.send`. Supply either `text` (with `category` and `from`)
 * or `template`.
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

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
  ) {
    super(core, client);
    this.stats = new SmsStatsResource(core, client);
  }

  /**
   * Send one SMS to a single recipient. Supply either `text` (with a `category` and `from`)
   * or a stored `template` (by `id` or `slug`, with its `parameters`). The API
   * accepts the message for delivery. Read it back with `get` for the latest status.
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
