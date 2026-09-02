// The email channel-defaults contract: the configurable shape, the type
// relaxation a configured default buys, and the merge itself.
//
// Its own module because the nested email resources (mailboxes, mailbox
// messages) need the shape too, and importing it from `email.ts` — which
// constructs them — is a cycle the circular-deps lint rejects.

import type { EmailMessageSendRequest } from "../generated/types.gen.js";

/**
 * Channel-level defaults set at client construction. Field names mirror the
 * send params (so they read as pre-filled fields). Any field set here becomes
 * optional in `send` and is filled when omitted (per-send value wins).
 */
export type EmailChannelDefaults = Partial<
  Pick<
    EmailMessageSendRequest,
    | "from"
    | "reply_to"
    | "category"
    | "track_opens"
    | "track_clicks"
    | "headers"
    | "tags"
    | "metadata"
    | "ip_pool_id"
  >
>;

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
/** Keys with a configured default. These keys are optional in `send`. */
type DefaultedKeys<D> = D extends object
  ? Extract<keyof D, keyof EmailMessageSendRequest>
  : never;
/** `send` params with defaulted fields made optional. */
export type EmailSend<D> = PartialBy<EmailMessageSendRequest, DefaultedKeys<D>>;
/** `sendBatch` params — every item under `messages` relaxed the same way `send` is. */
export type EmailSendBatch<D> = { messages: Array<EmailSend<D>> };

/**
 * Merge configured channel defaults under one set of per-call params.
 *
 * A field handed no value (`undefined`, or a `null` from a JSON-shaped input)
 * reads as unset, so its default still fills it. Spreading the params over the
 * defaults instead would let that no-value win and drop the field off the wire,
 * which the field-by-field merges in the other SDKs cannot do.
 *
 * `accepts` narrows the merge to the fields one body declares, for a request
 * that rejects a field the send body allows.
 */
export function withDefaults<T extends object>(
  defaults: EmailChannelDefaults | undefined,
  params: T,
  accepts?: readonly string[],
): T {
  if (defaults === undefined) return params;
  const fill: Record<string, unknown> =
    accepts === undefined
      ? { ...defaults }
      : Object.fromEntries(
          Object.entries(defaults).filter(([key]) => accepts.includes(key)),
        );
  const merged: Record<string, unknown> = { ...fill, ...params };
  for (const [key, value] of Object.entries(fill)) {
    if (merged[key] === undefined || merged[key] === null) merged[key] = value;
  }
  return merged as T;
}
