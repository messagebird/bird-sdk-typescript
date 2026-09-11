// `bird.broadcasts` — one piece of template content sent to a stored audience.
// The reads plus cancel and delete are generated. `create` and `send` are
// hand-written because each takes a `scheduled_at` the generated writer cannot
// assemble from a native `Date`; `update` is hand-written only because
// surfaces.yaml declares that override once for all four facades, and on
// TypeScript it is a passthrough over the generated body.

import {
  createEmailBroadcast,
  sendEmailBroadcast,
  updateEmailBroadcast,
} from "../generated/sdk.gen.js";
import type {
  EmailBroadcast,
  EmailBroadcastCreateRequest,
  EmailBroadcastUpdateRequest,
} from "../generated/types.gen.js";
import { BroadcastsResourceBase } from "./broadcasts.gen.js";
import { withDefaults, type EmailChannelDefaults } from "./emailDefaults.js";
import type { APIPromise, RequestOptions } from "../core/result.js";

// The channel defaults a broadcast create accepts. `scheduled_at` and `send`
// are not channel policy, and a broadcast takes its content from the template,
// so the list stops at the sending-policy fields the body declares. Exported
// for the type test, which fails if a default this body accepts is missing.
export const BROADCAST_FIELDS = [
  "from",
  "reply_to",
  "category",
  "track_opens",
  "track_clicks",
  "headers",
  "tags",
  "metadata",
  "ip_pool_id",
] as const;

/**
 * Body for `bird.broadcasts.create`. `scheduled_at` is the one relaxation over
 * the wire type, accepting a `Date` alongside the RFC 3339 string.
 */
export type BroadcastCreateParams = Omit<
  EmailBroadcastCreateRequest,
  "scheduled_at"
> & {
  /**
   * When to send the broadcast: at least 30 seconds and at most 365 days from
   * now. Only meaningful alongside `send`; on its own the request is refused.
   */
  scheduled_at?: Date | string;
};

export type BroadcastUpdateParams = EmailBroadcastUpdateRequest;

export type BroadcastSendParams = {
  /**
   * When to send the broadcast: at least 30 seconds and at most 365 days from
   * now. Omit it to send straight away.
   */
  scheduled_at?: Date | string;
};

// `toISOString()` always writes a millisecond component, so a whole second
// leaves as ".000Z" where Go, Python, PHP and the conformance vector all write
// a bare "Z" for the same instant; trimming it keeps the four wire bodies
// identical. A string is the caller's own and passes through unchecked.
function scheduledAtWire(value: Date | string | undefined): string | undefined {
  if (!(value instanceof Date)) {
    return value;
  }
  return value.toISOString().replace(/\.000Z$/, "Z");
}

export class BroadcastsResource extends BroadcastsResourceBase {
  #defaults?: EmailChannelDefaults;

  constructor(
    core: ConstructorParameters<typeof BroadcastsResourceBase>[0],
    client: ConstructorParameters<typeof BroadcastsResourceBase>[1],
    defaults?: EmailChannelDefaults,
  ) {
    super(core, client);
    this.#defaults = defaults;
  }

  /**
   * Create a broadcast. It is a draft unless `send` is set, in which case it
   * goes out immediately, or at `scheduled_at` when one is given. A send needs
   * a `from` on a verified domain, an `audience_id`, and a `template` with a
   * published version; without them the call is refused with a `422` rather
   * than saved as a draft.
   *
   * @example Create a draft broadcast
   * const broadcast = await bird.broadcasts.create({
   *   from: "newsletter@example.com",
   *   audience_id: "adn_01krdgeqcxet5s7t44vh8rt9mg",
   *   template: { id: "emt_01krdgeqcxet5s7t44vh8rt9mg" },
   * });
   * console.log(broadcast.id, broadcast.status);
   */
  create(
    params: BroadcastCreateParams,
    options?: RequestOptions,
  ): APIPromise<EmailBroadcast> {
    const { scheduled_at, ...rest } = params;
    const merged: EmailBroadcastCreateRequest =
      scheduled_at === undefined
        ? rest
        : { ...rest, scheduled_at: scheduledAtWire(scheduled_at) };
    // Create only: an update leaves an unset field at whatever the draft holds,
    // so a default filled there would overwrite a value the caller never named.
    const body = withDefaults(this.#defaults, merged, BROADCAST_FIELDS);
    return this.call<EmailBroadcast>("POST", options, ({ signal, headers }) =>
      createEmailBroadcast({ client: this.client, body, headers, signal }));
  }

  /**
   * Change a broadcast that is still a draft or is scheduled, and return it as
   * it now stands. Omitted fields keep their current value; `template`,
   * `reply_to` and `ip_pool_id` take an explicit `null` to clear. A broadcast
   * that has started sending can no longer be edited and is refused with a
   * `409`.
   *
   * @example Point a draft at a different template
   * const broadcast = await bird.broadcasts.update(
   *   "eb_01krdgeqcxet5s7t44vh8rt9mg",
   *   { template: { id: "emt_01krdgeqcxet5s7t44vh8rt9mg" } },
   * );
   * console.log(broadcast.status);
   */
  update(
    broadcastId: string,
    params: BroadcastUpdateParams,
    options?: RequestOptions,
  ): APIPromise<EmailBroadcast> {
    return this.call<EmailBroadcast>("PATCH", options, ({ signal, headers }) =>
      updateEmailBroadcast({
        client: this.client,
        path: { broadcast_id: broadcastId },
        body: params,
        headers,
        signal,
      }));
  }

  /**
   * Send a draft broadcast, immediately or at `scheduled_at`. The broadcast
   * needs a `from` on a verified domain, an `audience_id`, and a `template`
   * with a published version. One that has already started sending or has
   * reached a final state is refused with a `409`.
   *
   * @example Send a draft now
   * const broadcast = await bird.broadcasts.send(
   *   "eb_01krdgeqcxet5s7t44vh8rt9mg",
   * );
   * console.log(broadcast.status);
   */
  send(
    broadcastId: string,
    params: BroadcastSendParams = {},
    options?: RequestOptions,
  ): APIPromise<EmailBroadcast> {
    const scheduled_at = scheduledAtWire(params.scheduled_at);
    return this.call<EmailBroadcast>("POST", options, ({ signal, headers }) =>
      sendEmailBroadcast({
        client: this.client,
        path: { broadcast_id: broadcastId },
        body: scheduled_at === undefined ? {} : { scheduled_at },
        headers,
        signal,
      }));
  }
}
