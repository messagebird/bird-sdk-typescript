import { describe, expect, it } from "vitest";
import { BirdClient } from "../../src/client.js";
import { BirdHTTPClient } from "../../src/core/http.js";
import {
  createRequestPresenceValidator,
  RequestPresenceError,
  type RequestPresenceRule,
} from "../../src/core/requestPresence.js";
import { jsonResponse, recordFetch } from "../transport.js";

describe("required nullable request presence through the public facade", () => {
  for (const value of [{}, { route: undefined }]) {
    it(`rejects an unset route before fetch (${Object.keys(value).join(",") || "missing"})`, async () => {
      const transport = recordFetch(() => jsonResponse(200, {}));
      const client = new BirdClient({
        apiKey: "bk_eu1_test",
        fetch: transport.fn,
        maxRetries: 3,
      });
      const result = await client.voice.numbers
        .update("number-id", { inbound_configuration: value } as never)
        .safe();
      expect(result.error).toBeInstanceOf(RequestPresenceError);
      expect(result.error).toMatchObject({
        operation: "updateVoiceNumber",
        field: "route",
        pointer: "/inbound_configuration/route",
      });
      expect(transport.calls).toHaveLength(0);
    });
  }

  for (const route of [null, { type: "reject" }]) {
    it(`sends ${route === null ? "null" : "a value"} unchanged`, async () => {
      const transport = recordFetch(() => jsonResponse(200, {}));
      const client = new BirdClient({
        apiKey: "bk_eu1_test",
        fetch: transport.fn,
      });
      await client.voice.numbers.update("number-id", {
        inbound_configuration: { route },
      } as never);
      expect(transport.calls).toHaveLength(1);
      expect(await transport.calls[0]!.json()).toEqual({
        inbound_configuration: { route },
      });
    });
  }

  it("does not require a child of an omitted optional ancestor", async () => {
    const transport = recordFetch(() => jsonResponse(200, {}));
    const client = new BirdClient({
      apiKey: "bk_eu1_test",
      fetch: transport.fn,
    });
    await client.voice.numbers.update("number-id", { name: "Support" });
    expect(transport.calls).toHaveLength(1);
    expect(await transport.calls[0]!.json()).toEqual({ name: "Support" });
  });

  it("checks every destination array item", async () => {
    const transport = recordFetch(() => jsonResponse(200, {}));
    const client = new BirdClient({
      apiKey: "bk_eu1_test",
      fetch: transport.fn,
    });
    const result = await client.voice.destinations
      .update({
        destinations: [
          { country_code: "PT", daily_spend_limit: { limit: null } },
          { country_code: "NL", daily_spend_limit: {} },
        ],
      } as never)
      .safe();
    expect(result.error).toMatchObject({
      operation: "updateVoiceDestinations",
      field: "limit",
      pointer: "/destinations/1/daily_spend_limit/limit",
    });
    expect(transport.calls).toHaveLength(0);
  });
});

const nestedRule: RequestPresenceRule = {
  method: "PATCH",
  url: "/example/{id}",
  operation: "updateExample",
  schema: "#/components/schemas/Leaf",
  source: "#/components/schemas/Leaf/properties/value",
  field: "value",
  path: "groups[][].*.value",
  steps: [
    { kind: "property", key: "groups" },
    { kind: "items" },
    { kind: "items" },
    { kind: "values" },
    { kind: "property", key: "value" },
  ],
};

describe("generic manifest path traversal", () => {
  it("checks every map value and nested array while admitting null", async () => {
    const validate = createRequestPresenceValidator([nestedRule]);
    await expect(
      validate({
        method: "PATCH",
        url: "/example/{id}",
        body: { groups: [[{ a: { value: null }, b: { value: 0 } }]] },
      }),
    ).resolves.toBeDefined();
    await expect(
      validate({
        method: "PATCH",
        url: "/example/{id}",
        body: { groups: [[{ a: { value: null }, "b/c": {} }]] },
      }),
    ).rejects.toMatchObject({
      pointer: "/groups/0/0/b~1c/value",
      operation: "updateExample",
    });
  });

  it("uses the generated method and template path together", async () => {
    const validate = createRequestPresenceValidator([nestedRule]);
    await expect(
      validate({ method: "GET", url: "/example/{id}", body: {} }),
    ).resolves.toBeDefined();
    await expect(
      validate({ method: "PATCH", url: "/elsewhere", body: {} }),
    ).resolves.toBeDefined();
  });
});

for (const mode of ["thrown", "outcome"] as const) {
  it(`does not retry or remap a ${mode} local presence error`, async () => {
    const core = new BirdHTTPClient({ timeout: 2_000, maxRetries: 3 });
    const error = new RequestPresenceError(nestedRule, [
      "groups",
      "0",
      "0",
      "entry",
      "value",
    ]);
    let attempts = 0;
    await expect(
      core.request(
        async () => {
          attempts++;
          if (mode === "thrown") throw error;
          return { error };
        },
        { method: "PATCH" },
      ),
    ).rejects.toBe(error);
    expect(attempts).toBe(1);
  });
}
