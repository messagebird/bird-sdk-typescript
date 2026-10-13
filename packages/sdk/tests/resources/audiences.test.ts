import { scriptedFetch, jsonResponse } from "../transport.js";
import { describe, it, expect } from "vitest";
import { BirdClient } from "../../src/client.js";

// Conformance drivers discard decoded responses.
describe("audiences.membership", () => {
  it("keeps an unavailable count distinct from a zero", async () => {
    const { fn } = scriptedFetch([
      () => jsonResponse(200, {}),
      () => jsonResponse(200, { membership: { total: 0, data_as_of: "2026-10-12T09:41:07.512843Z" } }),
    ]);
    const bird = new BirdClient({ apiKey: "bk_eu1_x", fetch: fn });

    expect(await bird.audiences.membership("adn_01krdgeqcxet5s7t44vh8rt201")).toStrictEqual({});
    expect(await bird.audiences.membership("adn_01krdgeqcxet5s7t44vh8rt201")).toStrictEqual({
      membership: { total: 0, data_as_of: "2026-10-12T09:41:07.512843Z" },
    });
  });
});
