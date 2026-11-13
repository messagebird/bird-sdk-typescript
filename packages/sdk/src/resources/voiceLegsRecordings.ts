// `bird.voice.legs.recordings` — the recordings of one leg.

import { getVoiceLegRecordingAudio } from "../generated/sdk.gen.js";
import { Resource } from "./base.js";
import type { APIPromise, RequestOptions } from "../core/result.js";
import type { FetchOutcome } from "../core/http.js";
import { BirdConnectionError } from "../errors.js";
// The storage leg is the one WhatsApp media takes, so both downloads keep the
// client's credentials off it the same way.
import { fetchStorage, mediaFrom } from "./whatsappMessages.js";

/**
 * The downloaded audio of one recording. `contentType` is what storage
 * declared, `audio/wav`.
 */
export interface VoiceRecordingAudio {
  data: Uint8Array;
  contentType: string;
  contentLength: number;
}

export class VoiceLegsRecordingsResource extends Resource {
  /**
   * Download one recording as a WAV file. `legId` and `recordingId` are the
   * `leg_id` and `id` of an entry in `recordings`, which
   * `bird.voice.calls.recordings.list` returns.
   *
   * A 425 means the leg is still recording: call again in a few seconds. A 404
   * means the capture failed, or the recording is older than 30 days.
   *
   * @example
   * const audio = await bird.voice.legs.recordings.audio(
   *   "vcl_01krdgeqcxet5s7t44vh8rt9mg",
   *   "vrc_01krdgeqcxet5s7t44vh8rt9mg",
   * );
   * console.log(audio.contentType, audio.contentLength);
   */
  audio(
    legId: string,
    recordingId: string,
    options?: RequestOptions,
  ): APIPromise<VoiceRecordingAudio> {
    return this.call<VoiceRecordingAudio>(
      "GET",
      options,
      async ({ signal, headers }): Promise<FetchOutcome<VoiceRecordingAudio>> => {
        const outcome = await getVoiceLegRecordingAudio({
          client: this.client,
          path: { leg_id: legId, recording_id: recordingId },
          headers,
          signal,
          // Stop here rather than let fetch follow: the target is pre-authorized
          // and this client's Authorization header must not reach it.
          redirect: "manual",
          parseAs: "arrayBuffer",
        });
        const res = outcome.response;
        if (!res) return outcome as FetchOutcome<VoiceRecordingAudio>;
        if (res.status !== 302) {
          // A failure falls through untouched so the core maps it; a 2xx is an
          // edge answering with the bytes directly, which is also the only arm
          // the conformance corpus can script (its responses carry no headers).
          if (!res.ok) return outcome as FetchOutcome<VoiceRecordingAudio>;
          return { data: mediaFrom(res, outcome.data as ArrayBuffer), response: res };
        }
        const location = res.headers.get("Location");
        if (!location) {
          throw new BirdConnectionError("recording redirect carried no Location header");
        }
        const stored = await fetchStorage(
          this.client.getConfig().fetch ?? fetch,
          location,
          signal,
          "audio",
        );
        return { data: mediaFrom(stored.response, stored.body), response: res };
      },
      undefined,
      302,
    );
  }
}
