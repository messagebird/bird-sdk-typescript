import { recordFetch } from "../transport.js";
import { describe, it, expect, vi } from "vitest";
import { BirdClient } from "../../src/client.js";
import { BirdConnectionError, BirdNotFoundError } from "../../src/errors.js";

const PNG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const STORAGE = "https://storage.test/blob.png?X-Amz-Signature=abc";

function capture(options: { api?: () => Response; storage?: () => Response } = {}) {
  return recordFetch((request) => {
    if (new URL(request.url).host === "storage.test") {
      return (
        options.storage?.() ??
        new Response(PNG, {
          status: 200,
          headers: { "content-type": "image/png" },
        })
      );
    }
    return options.api?.() ?? new Response(null, { status: 302, headers: { location: STORAGE } });
  });
}

function client(fn: typeof fetch) {
  return new BirdClient({ apiKey: "bk_eu1_x", fetch: fn });
}

describe("bird.whatsapp.messages.media", () => {

  // The presigned URL carries its own credential and refuses a second auth
  // mechanism, so a Bird header reaching storage is both a leak and a broken
  // request. This is the assertion the whole two-leg design exists for.
  it("sends no Bird credentials to storage", async () => {
    vi.stubEnv("DO_NOT_TRACK", "");
    vi.stubEnv("BIRD_TELEMETRY", "");
    vi.stubEnv("BIRD_CLIENT_ENRICHMENT", "");
    vi.stubEnv("CLAUDE_CODE_CHILD_SESSION", "1");
    vi.stubEnv("ANTHROPIC_MODEL", "sonnet");
    try {
      const { fn, calls } = capture();
      const media = await client(fn).whatsapp.messages.media("wam_1", "waf_1");

      // The API leg must carry the key, or this test would pass on a client that
      // never authenticates anything.
      expect(calls[0].headers.get("authorization")).toBe("Bearer bk_eu1_x");
      expect(calls[0].headers.get("Bird-Model")).toBe("sonnet");
      expect(calls[0].headers.get("Bird-Model-Source")).toBe(
        "env:ANTHROPIC_MODEL",
      );

      expect(calls[1].headers.get("authorization")).toBeNull();
      for (const [name] of calls[1].headers) {
        expect(name.toLowerCase().startsWith("bird-")).toBe(false);
      }
      expect(media.contentType).toBe("image/png");
      expect(media.contentLength).toBe(PNG.length);
      expect(Array.from(media.data)).toEqual(Array.from(PNG));
      expect(calls).toHaveLength(2);
      expect(calls[0].url).toContain("/v1/whatsapp/messages/wam_1/media/waf_1");
      expect(calls[0].redirect).toBe("manual");
      expect(calls[1].url).toBe(STORAGE);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  // The conformance corpus cannot script a 302 — vector.schema.json's scripted
  // responses carry only status and body, no headers — so this is the branch
  // the whatsapp.messages.media vector actually drives.
  it("accepts a direct 2xx carrying the bytes", async () => {
    const { fn, calls } = capture({
      api: () =>
        new Response(PNG, {
          status: 200,
          headers: { "content-type": "image/png" },
        }),
    });
    const media = await client(fn).whatsapp.messages.media("wam_1", "waf_1");

    expect(media.contentType).toBe("image/png");
    expect(Array.from(media.data)).toEqual(Array.from(PNG));
    expect(calls).toHaveLength(1);
  });

  it("falls back to application/octet-stream when storage declares no type", async () => {
    const { fn } = capture({
      storage: () => new Response(PNG, { status: 200 }),
    });
    const media = await client(fn).whatsapp.messages.media("wam_1", "waf_1");

    expect(media.contentType).toBe("application/octet-stream");
  });

  it("reports a refused download link as a connection error naming the recovery", async () => {
    const { fn } = capture({
      storage: () =>
        new Response("<Error><Code>AccessDenied</Code></Error>", {
          status: 403,
        }),
    });

    await expect(
      client(fn).whatsapp.messages.media("wam_1", "waf_1"),
    ).rejects.toThrow(BirdConnectionError);
    await expect(
      client(fn).whatsapp.messages.media("wam_1", "waf_1"),
    ).rejects.toThrow(/media again/);
  });

  it("reports a redirect with no Location as a connection error", async () => {
    const { fn } = capture({ api: () => new Response(null, { status: 302 }) });

    await expect(
      client(fn).whatsapp.messages.media("wam_1", "waf_1"),
    ).rejects.toThrow(/Location/);
  });

  // The API leg keeps the core's error mapping: an expired media object is a
  // Bird 410, not a storage failure, and must not be flattened into one.
  it("surfaces a 410 from the API leg as a Bird API error", async () => {
    const { fn } = capture({
      api: () =>
        new Response(
          JSON.stringify({
            error: { type: "not_found_error", code: "E00404" },
          }),
          {
            status: 410,
            headers: { "content-type": "application/json" },
          },
        ),
    });

    const result = await client(fn)
      .whatsapp.messages.media("wam_1", "waf_1")
      .safe();
    expect(result.error).toBeInstanceOf(BirdNotFoundError);
    expect((result.error as BirdNotFoundError).statusCode).toBe(410);
  });
});
