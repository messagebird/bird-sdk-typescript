import { readFileSync } from "node:fs";
import { describe, it, expect, vi } from "vitest";
import {
  BirdClient,
  BirdError,
  BirdAPIError,
  BirdAuthError,
  BirdMissingApiKeyError,
  BirdRateLimitError,
  regionFromApiKey,
  baseUrlForRegion,
} from "../src/index.js";

import { detectCallerInfo } from "../src/detect-caller.js";

const errorFields = {
  code: "E1",
  type: "bad_request_error",
  errorName: "Bad",
  message: "msg",
  docUrl: "",
  requestId: "",
};

describe("BirdClient", () => {
  it("keeps SDK provenance when default and call headers use different casing", async () => {
    for (const key of [
      "DO_NOT_TRACK",
      "BIRD_TELEMETRY",
      "BIRD_CLIENT_ENRICHMENT",
    ])
      vi.stubEnv(key, "");
    try {
      const sent: Request[] = [];
      const client = new BirdClient({
        apiKey: "bk_us1_test123",
        defaultHeaders: {
          "bird-caller-source": "spoofed",
          "BIRD-CALLER-EXECUTION": "spoofed",
        },
        fetch: (async (input, init) => {
          sent.push(new Request(input, init));
          return new Response("{}", { status: 200 });
        }) as typeof fetch,
      });
      await client.request(
        { method: "GET", path: "/v1/workspace" },
        {
          headers: {
            "bird-caller": "spoofed",
            "bird-caller-source": "spoofed",
            "BIRD-CALLER-EXECUTION": "spoofed",
          },
        },
      );
      await client.workspace.get({
        headers: {
          "bird-caller": "spoofed",
          "BIRD-CALLER-SOURCE": "spoofed",
          "bird-caller-execution": "spoofed",
        },
      });
      const info = detectCallerInfo();
      expect(sent).toHaveLength(2);
      for (const request of sent) {
        expect(request.headers.get("Bird-Caller")).toBe(info.name || null);
        expect(request.headers.get("Bird-Caller-Source")).toBe(
          info.name ? info.source : null,
        );
        expect(request.headers.get("Bird-Caller-Execution")).toBe(
          info.name ? info.execution : null,
        );
      }
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("constructs with required options", () => {
    const client = new BirdClient({ apiKey: "bk_us1_test123" });
    expect(client).toBeInstanceOf(BirdClient);
  });

  it("constructs with custom base URL", () => {
    const client = new BirdClient({
      apiKey: "bk_us1_test123",
      baseUrl: "http://localhost:8080",
    });
    expect(client).toBeInstanceOf(BirdClient);
  });

  it("throws when the region cannot be determined", () => {
    expect(() => new BirdClient({ apiKey: "bk_live_legacy" })).toThrow(
      /region/i,
    );
  });

  it("accepts an unparseable key when baseUrl is given", () => {
    const client = new BirdClient({
      apiKey: "bk_live_legacy",
      baseUrl: "http://localhost:8080",
    });
    expect(client).toBeInstanceOf(BirdClient);
  });
});

describe("region resolution", () => {
  it("extracts the region from a key prefix", () => {
    expect(regionFromApiKey("bk_eu1_abc123")).toBe("eu1");
    expect(regionFromApiKey("bk_us1_abc123")).toBe("us1");
  });

  it("returns undefined for keys without a region segment", () => {
    expect(regionFromApiKey("bk_live_abc123")).toBeUndefined();
    expect(regionFromApiKey("bk_LIVE_x_y")).toBeUndefined();
    expect(regionFromApiKey("garbage")).toBeUndefined();
  });

  it("builds the regional data-plane host", () => {
    expect(baseUrlForRegion("eu1")).toBe("https://eu1.platform.bird.com");
  });
});

describe("Error hierarchy", () => {
  it("BirdAPIError extends BirdError", () => {
    const err = new BirdAPIError({ ...errorFields, statusCode: 400 });
    expect(err).toBeInstanceOf(BirdError);
    expect(err).toBeInstanceOf(BirdAPIError);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("E1");
  });

  it("BirdAuthError extends BirdAPIError", () => {
    const err = new BirdAuthError({
      ...errorFields,
      statusCode: 401,
      type: "auth_error",
    });
    expect(err).toBeInstanceOf(BirdAPIError);
    expect(err.statusCode).toBe(401);
  });

  it("BirdRateLimitError extends BirdAPIError", () => {
    const err = new BirdRateLimitError({
      ...errorFields,
      statusCode: 429,
      type: "rate_limit_error",
      retryAfter: 30,
    });
    expect(err).toBeInstanceOf(BirdAPIError);
    expect(err.statusCode).toBe(429);
    expect(err.retryAfter).toBe(30);
  });
});

describe("receiver-only client (no apiKey)", () => {
  const secret = "whsec_C2FVsBQIhrscChlQIMV+b5sSYspob7oD";

  it("constructs from a webhook secret alone", () => {
    const client = new BirdClient({ webhooks: { secret } });
    expect(client).toBeInstanceOf(BirdClient);
  });

  it("rejects API calls with BirdMissingApiKeyError", async () => {
    const client = new BirdClient({ webhooks: { secret } });
    await expect(client.workspace.get()).rejects.toThrow(
      BirdMissingApiKeyError,
    );
  });

  it("rejects the raw escape hatch before building a request", () => {
    const client = new BirdClient({ webhooks: { secret } });
    expect(() =>
      client.request({ method: "GET", path: "/v1/workspace" }),
    ).toThrow(BirdMissingApiKeyError);
  });

  it("throws at construction when neither apiKey nor webhook secret is configured", () => {
    expect(() => new BirdClient({})).toThrow(BirdError);
  });
});

describe("configured model wire contract", () => {
  const fixtures = JSON.parse(
    readFileSync(
      new URL("./caller-detection-cases.json", import.meta.url),
      "utf8",
    ),
  ) as {
    cases: { env: Record<string, string> }[];
    enrichment_cases: {
      name: string;
      env: Record<string, string>;
      headers: Record<string, string>;
      want: Record<string, string>;
    }[];
  };
  const keys = new Set([
    "DO_NOT_TRACK",
    "BIRD_TELEMETRY",
    "BIRD_CLIENT_ENRICHMENT",
    ...fixtures.cases.flatMap((c) => Object.keys(c.env)),
  ]);
  for (const tc of fixtures.enrichment_cases) {
    it(tc.name, async () => {
      try {
        for (const key of keys) vi.stubEnv(key, "");
        for (const [key, value] of Object.entries(tc.env))
          vi.stubEnv(key, value);
        const seen: Headers[] = [];
        const fetcher: typeof fetch = async (input, init) => {
          const request = new Request(input, init);
          seen.push(request.headers);
          return new Response(JSON.stringify({ id: "fixture" }), {
            status: request.method === "POST" ? 201 : 200,
            headers: { "Content-Type": "application/json" },
          });
        };
        const client = new BirdClient({
          apiKey: "bk_eu1_fixture",
          fetch: fetcher,
          defaultHeaders: {
            "Bird-Enrichment": "1",
            ...(Object.keys(tc.headers).some(
              (key) => key.toLowerCase() === "bird-model",
            )
              ? { "Bird-Model": "sonnet" }
              : {}),
          },
        });
        await client.request({
          method: "GET",
          path: "/fixture",
          headers: tc.headers,
        });
        await client.request(
          { method: "GET", path: "/fixture" },
          { headers: tc.headers },
        );
        await client.email.send(
          {
            from: "a@example.invalid",
            to: ["b@example.invalid"],
            subject: "fixture",
            text: "fixture",
          },
          { headers: tc.headers },
        );
        expect(seen).toHaveLength(3);
        for (const headers of seen) {
          for (const [key, want] of Object.entries(tc.want))
            expect(headers.get(key) ?? "").toBe(want);
          expect(
            [...headers.values()].some((value) => value.includes("private-")),
          ).toBe(false);
        }
      } finally {
        vi.unstubAllEnvs();
      }
    });
  }
});
