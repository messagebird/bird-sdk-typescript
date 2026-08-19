// `bird.realtime` — publish to Realtime channels, plus the `channels` and
// `members` collections nested under it.
//
// Every Realtime operation authenticates to the Realtime edge with the app's own
// key/secret pair on top of the workspace API key. Those are credentials, so pass
// them as client config (`realtime: { key, secret }`); the request core stamps
// them on the operations that declare them.

import type {
  RealtimeChannelInclude,
  RealtimeChannelListItem,
  RealtimeChannelMember,
} from "../generated/types.gen.js";
import {
  publishRealtimeAppBatch,
  publishRealtimeAppEvent,
} from "../generated/sdk.gen.js";
import {
  RealtimeResourceBase,
  type RealtimePublishParams,
  type RealtimePublishBatchParams,
  type RealtimePublishResult,
  type RealtimeBatchPublishResult,
} from "./realtime.gen.js";
import { RealtimeChannelsResource } from "./realtimeChannels.gen.js";
import { RealtimeMembersResource } from "./realtimeMembers.gen.js";
import { Resource } from "./base.js";
import type { APIPromise, RequestOptions } from "../core/result.js";
import {
  decodeMasterKey,
  deriveSharedSecret,
  encryptForChannel,
  hmacSha256Hex,
  isEncryptedChannel,
  toBase64,
} from "../core/realtime-crypto.js";
import { BirdError } from "../errors.js";

export type {
  RealtimePublishBatchParams,
  RealtimeBatchPublishResult,
} from "./realtime.gen.js";

// The rest of the Realtime surface, re-exported here so `bird.realtime`'s public
// types have one import site regardless of which file generates them.
export type { RealtimeChannelInclude, RealtimeChannelListItem, RealtimeChannelMember };
export type {
  RealtimePublishParams,
  RealtimePublishResult,
} from "./realtime.gen.js";
export type {
  RealtimeChannelsList,
  RealtimeChannelInfo,
  RealtimeChannelMembers,
  RealtimeChannelListQuery,
  RealtimeChannelGetQuery,
} from "./realtimeChannels.gen.js";
export type { RealtimeMemberSendParams } from "./realtimeMembers.gen.js";

/**
 * Realtime app credentials — `new BirdClient({ realtime: { key, secret } })`.
 * They come from the app's credentials (shown once at creation) and must belong
 * to the calling workspace.
 */
export interface RealtimeOptions {
  /** The Realtime app key, sent as `X-Realtime-Key`. */
  key?: string;
  /** The Realtime app secret, sent as `X-Realtime-Secret`. */
  secret?: string;
  /**
   * The end-to-end encryption master key for `private-encrypted-` channels:
   * 32 random bytes, base64-encoded. Yours alone — it is used locally to
   * encrypt publishes and derive each channel's `shared_secret`, and is never
   * sent to Bird. Losing it makes rotating to a new one the only recovery.
   */
  encryptionMasterKey?: string;
}

/**
 * What `authorizeChannel` returns: the JSON your auth endpoint sends back to
 * the browser client, field names already on the wire spelling.
 */
export interface ChannelAuthorization {
  /** `<key>:<hmac>` signature the edge verifies. */
  auth: string;
  /** Echo of the signed member data (presence channels). */
  member_data?: string;
  /** The channel's decryption key, base64 (encrypted channels). */
  shared_secret?: string;
}

/**
 * `bird.realtime` — publish events to a Realtime app's channels and inspect its
 * live state. Reached as `bird.realtime.*`.
 */
export class RealtimeResource extends RealtimeResourceBase {
  /** Channel state — `bird.realtime.channels.list(...)`, `.get(...)`, `.members(...)`. */
  readonly channels: RealtimeChannelsResource;

  /** Members — `bird.realtime.members.send(...)`, `.disconnect(...)`. */
  readonly members: RealtimeMembersResource;

  readonly #options?: RealtimeOptions;

  constructor(
    core: ConstructorParameters<typeof Resource>[0],
    client: ConstructorParameters<typeof Resource>[1],
    options?: RealtimeOptions,
  ) {
    super(core, client);
    this.channels = new RealtimeChannelsResource(core, client);
    this.members = new RealtimeMembersResource(core, client);
    this.#options = options;
  }

  /**
   * Publish, with end-to-end encryption when the channel asks for it: a
   * `private-encrypted-` channel's payload is sealed locally under the
   * configured master key before the request leaves the process. One channel
   * per encrypted publish — each channel derives its own key, so a fan-out
   * would deliver ciphertext other channels' subscribers cannot open.
   *
   * @example Publish to an encrypted channel
   * // Client config: realtime: { key, secret, encryptionMasterKey }
   * await bird.realtime.publish("rap_01krdgeqcxet5s7t44vh8rt9mg", {
   *   event: "order.updated",
   *   channels: ["private-encrypted-orders"],
   *   data: { order_id: "ord_123", status: "shipped" },
   * });
   */
  override publish(
    realtimeAppId: string,
    params: RealtimePublishParams,
    options?: RequestOptions,
  ): APIPromise<RealtimePublishResult> {
    const encrypted = params.channels.filter(isEncryptedChannel);
    if (encrypted.length === 0) {
      return super.publish(realtimeAppId, params, options);
    }
    if (params.channels.length > 1) {
      throw new BirdError(
        "A publish to a private-encrypted- channel must name exactly that " +
          "one channel: every channel derives its own key, so a multi-channel " +
          "publish would hand the other channels undecryptable ciphertext. " +
          "Publish per channel instead.",
      );
    }
    const masterKey = decodeMasterKey(this.#options?.encryptionMasterKey);
    return this.call<RealtimePublishResult>(
      "POST",
      options,
      async ({ signal, headers }) => {
        const body = {
          ...params,
          data: await encryptForChannel(encrypted[0]!, params.data, masterKey),
        };
        return publishRealtimeAppEvent({
          client: this.client,
          path: { realtime_app_id: realtimeAppId },
          body,
          headers,
          signal,
        });
      },
      ["RealtimeKey", "RealtimeSecret"],
    );
  }

  /**
   * Publish a batch, sealing each event addressed to a `private-encrypted-`
   * channel under that channel's derived key (batch events carry one channel
   * each, so items encrypt independently).
   */
  override publishBatch(
    realtimeAppId: string,
    params: RealtimePublishBatchParams,
    options?: RequestOptions,
  ): APIPromise<RealtimeBatchPublishResult> {
    if (!params.events.some((e) => isEncryptedChannel(e.channel))) {
      return super.publishBatch(realtimeAppId, params, options);
    }
    const masterKey = decodeMasterKey(this.#options?.encryptionMasterKey);
    return this.call<RealtimeBatchPublishResult>(
      "POST",
      options,
      async ({ signal, headers }) => {
        const events = await Promise.all(
          params.events.map(async (e) =>
            isEncryptedChannel(e.channel)
              ? { ...e, data: await encryptForChannel(e.channel, e.data, masterKey) }
              : e,
          ),
        );
        return publishRealtimeAppBatch({
          client: this.client,
          path: { realtime_app_id: realtimeAppId },
          body: { ...params, events },
          headers,
          signal,
        });
      },
      ["RealtimeKey", "RealtimeSecret"],
    );
  }

  /**
   * Sign a channel subscription for the browser client — the body your auth
   * endpoint returns. Runs locally (no request): the signature is
   * `HMAC-SHA256(secret, "<connectionId>:<channelName>[:<memberData>]")`,
   * prefixed with the app key. For a presence channel pass `memberData`, the
   * exact JSON string carrying `member_id` (and optionally `member_info`) —
   * it is signed and echoed byte-identical. For a `private-encrypted-`
   * channel the response also carries the channel's `shared_secret`, derived
   * from the configured encryption master key.
   *
   * @example An Express auth endpoint
   * app.post("/bird/auth", async (req, res) => {
   *   const { connection_id, channel_name } = req.body;
   *   if (!mayJoin(req.session.user, channel_name)) return res.sendStatus(403);
   *   res.json(
   *     await bird.realtime.authorizeChannel({
   *       connectionId: connection_id,
   *       channelName: channel_name,
   *     }),
   *   );
   * });
   */
  async authorizeChannel(params: {
    /** The subscribing connection's id, as POSTed by the client. */
    connectionId: string;
    /** The channel being subscribed, as POSTed by the client. */
    channelName: string;
    /** Presence channels: the member-identity JSON string to sign and echo. */
    memberData?: string;
  }): Promise<ChannelAuthorization> {
    const { key, secret } = this.#options ?? {};
    if (!key || !secret) {
      throw new BirdError(
        "authorizeChannel signs with the Realtime app credentials. Set " +
          "`realtime: { key, secret }` on the client.",
      );
    }
    const toSign =
      params.memberData === undefined
        ? `${params.connectionId}:${params.channelName}`
        : `${params.connectionId}:${params.channelName}:${params.memberData}`;
    const out: ChannelAuthorization = {
      auth: `${key}:${await hmacSha256Hex(secret, toSign)}`,
    };
    if (params.memberData !== undefined) out.member_data = params.memberData;
    if (isEncryptedChannel(params.channelName)) {
      const masterKey = decodeMasterKey(this.#options?.encryptionMasterKey);
      out.shared_secret = toBase64(
        await deriveSharedSecret(params.channelName, masterKey),
      );
    }
    return out;
  }
}
