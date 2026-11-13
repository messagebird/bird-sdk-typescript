import { recordFetch } from "../transport.js";
import { describe, it, expect } from "vitest";
import { BirdClient } from "../../src/client.js";
import { BirdAPIError, BirdConnectionError, BirdTooEarlyError } from "../../src/errors.js";

const WAV = Uint8Array.from([0x52, 0x49, 0x46, 0x46]);
const STORAGE = "https://storage.test/recording.wav?X-Amz-Signature=abc";

function capture(options: { api?: () => Response; storage?: () => Response } = {}) {
  return recordFetch((request) => {
    if (new URL(request.url).host === "storage.test") {
      return (
        options.storage?.() ??
        new Response(WAV, { status: 200, headers: { "content-type": "audio/wav" } })
      );
    }
    return options.api?.() ?? new Response(null, { status: 302, headers: { location: STORAGE } });
  });
}

function client(fn: typeof fetch) {
  return new BirdClient({ apiKey: "bk_eu1_x", fetch: fn });
}

describe("bird.voice.legs.recordings.audio", () => {
  // The presigned URL carries its own credential and refuses a second auth
  // mechanism, so a Bird header reaching storage is both a leak and a broken
  // request.
  it("sends no Bird credentials to storage", async () => {
    const { fn, calls } = capture();
    const audio = await client(fn).voice.legs.recordings.audio("vcl_1", "vrc_1");

    expect(calls).toHaveLength(2);
    expect(calls[0].url).toContain("/v1/voice/legs/vcl_1/recordings/vrc_1/audio");
    expect(calls[0].headers.get("authorization")).toBe("Bearer bk_eu1_x");
    expect(calls[0].redirect).toBe("manual");
    expect(calls[1].url).toBe(STORAGE);
    expect(calls[1].headers.get("authorization")).toBeNull();
    for (const [name] of calls[1].headers) {
      expect(name.toLowerCase().startsWith("bird-")).toBe(false);
    }
    expect(audio.contentType).toBe("audio/wav");
    expect(audio.contentLength).toBe(WAV.length);
    expect(Array.from(audio.data)).toEqual(Array.from(WAV));
  });

  // The conformance corpus cannot script a 302, so this is the branch the
  // voice.legs.recordings.audio vector actually drives.
  it("accepts a direct 2xx carrying the bytes", async () => {
    const { fn, calls } = capture({
      api: () => new Response(WAV, { status: 200, headers: { "content-type": "audio/wav" } }),
    });
    const audio = await client(fn).voice.legs.recordings.audio("vcl_1", "vrc_1");

    expect(Array.from(audio.data)).toEqual(Array.from(WAV));
    expect(calls).toHaveLength(1);
  });

  it("reports a refused download link as a connection error naming the recovery", async () => {
    const { fn } = capture({
      storage: () => new Response("<Error><Code>AccessDenied</Code></Error>", { status: 403 }),
    });

    await expect(client(fn).voice.legs.recordings.audio("vcl_1", "vrc_1")).rejects.toThrow(
      BirdConnectionError,
    );
    await expect(client(fn).voice.legs.recordings.audio("vcl_1", "vrc_1")).rejects.toThrow(
      /audio again/,
    );
  });

  // A leg that is still recording is the API's own 425, which the caller needs
  // as an API error to tell "wait" from "gone".
  it("surfaces a 425 from the API leg as a Bird API error", async () => {
    const { fn } = capture({
      api: () =>
        new Response(JSON.stringify({ error: { type: "too_early_error", code: "E21083" } }), {
          status: 425,
          headers: { "content-type": "application/json" },
        }),
    });

    const result = await client(fn).voice.legs.recordings.audio("vcl_1", "vrc_1").safe();
    expect(result.error).toBeInstanceOf(BirdTooEarlyError);
    expect((result.error as BirdAPIError).statusCode).toBe(425);
    expect((result.error as BirdAPIError).code).toBe("E21083");
  });
});
