// `bird.preferences` — the cross-channel stated-preference store: consent
// grants and opt-outs keyed by channel and handle (plus an optional sender
// scope). `create` and `delete` are hand-written: `consented_at` is a
// date-time the generated writer can't assemble, and the delete is
// conditional — a 200 with `applied: false` means a newer statement
// survived — so a void-returning delete would read a refusal as success.

import { createPreference, deletePreference } from "../generated/sdk.gen.js";
import type {
  PreferenceCreate,
  PreferenceWriteResult,
} from "../generated/types.gen.js";
import { PreferencesResourceBase } from "./preferences.gen.js";
import type { APIPromise, RequestOptions } from "../core/result.js";

export type { PreferenceWriteResult };

/**
 * Body for `bird.preferences.create` — one statement for a handle on one
 * channel. Wire data is snake_case verbatim; `consented_at` is the one
 * relaxation, accepting a `Date` (serialized with `toISOString()`) alongside
 * the wire's RFC 3339 string.
 */
export type PreferenceCreateParams = Omit<PreferenceCreate, "consented_at"> & {
  /**
   * When the person consented, on a `granted` statement. Required evidence
   * when granting over a stored opt-out: the grant applies only if this is
   * later than the opt-out it reverses. May not be in the future.
   */
  consented_at?: Date | string;
};

export class PreferencesResource extends PreferencesResourceBase {
  /**
   * Record one preference statement — a grant or an opt-out — for a handle on
   * one channel. Writing is an upsert by key (channel, handle, and optional
   * sender scope): statements are causally ordered, so one dated older than
   * the key's current statement is refused and returned with `applied:
   * false` rather than applied out of order. A `201` (the key had no record)
   * and a `200` (the key already had one) return the same shape either way.
   *
   * @example Record a stated opt-out
   * const result = await bird.preferences.create({
   *   channel: "sms",
   *   handle: "+15550001234",
   *   status: "revoked",
   * });
   * console.log(result.applied, result.preference?.id);
   */
  create(
    params: PreferenceCreateParams,
    options?: RequestOptions,
  ): APIPromise<PreferenceWriteResult> {
    const { consented_at, ...rest } = params;
    const body: PreferenceCreate =
      consented_at === undefined
        ? rest
        : {
            ...rest,
            consented_at:
              consented_at instanceof Date
                ? consented_at.toISOString()
                : consented_at,
          };
    return this.call<PreferenceWriteResult>("POST", options, ({ signal, headers }) =>
      createPreference({ client: this.client, body, headers, signal }));
  }

  /**
   * Delete a preference, returning its key to having no record. Never void:
   * the delete is ordered like any statement, so a `200` with `applied:
   * false` means a newer statement survived and is returned in `preference`
   * rather than deleted. A statement the person made themselves — an
   * unsubscribe link, a stop keyword — cannot be deleted this way; record a
   * `granted` statement with `consented_at` evidence to restore messaging
   * instead.
   *
   * @example Delete a preference
   * const result = await bird.preferences.delete("prf_01krdgeqcxet5s7t44vh8rt9mg");
   * if (!result.applied) {
   *   console.log("refused — a newer statement survived:", result.preference?.status);
   * }
   */
  delete(
    preferenceId: string,
    options?: RequestOptions,
  ): APIPromise<PreferenceWriteResult> {
    return this.call<PreferenceWriteResult>("DELETE", options, ({ signal, headers }) =>
      deletePreference({
        client: this.client,
        path: { preference_id: preferenceId },
        headers,
        signal,
      }));
  }
}
