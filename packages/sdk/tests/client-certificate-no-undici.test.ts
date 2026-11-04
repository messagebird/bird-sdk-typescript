import { afterEach, describe, expect, it, vi } from "vitest";
import { BirdClient, BirdError } from "../src/index.js";

// undici is an optional dependency, so an install can omit it.
vi.mock("undici", () => {
  throw new Error("Cannot find package 'undici'");
});

describe("without undici", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the standard endpoint when no certificate is set", async () => {
    const spy = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response('{"id":"ws_1"}', {
          headers: { "Content-Type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", spy);
    const bird = new BirdClient({ apiKey: "bk_eu1_x" });
    const data = await bird.request({ method: "GET", path: "/v1/workspace" });
    expect(data).toEqual({ id: "ws_1" });
    const input = spy.mock.calls[0][0];
    expect(input instanceof Request ? input.url : String(input)).toBe(
      "https://eu1.platform.bird.com/v1/workspace",
    );
    expect(spy.mock.calls[0][1]).not.toHaveProperty("dispatcher");
  });

  it("rejects the request with the install instruction", async () => {
    const bird = new BirdClient({
      apiKey: "bk_eu1_x",
      clientCertificate: { cert: "client.pem", key: "client.key" },
    });
    const err = await bird
      .request({ method: "GET", path: "/v1/workspace" })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(BirdError);
    expect((err as Error).message).toContain("install undici");
  });
});
