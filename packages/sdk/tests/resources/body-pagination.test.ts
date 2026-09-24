import { expect, it } from "vitest";
import { BirdHTTPClient } from "../../src/core/http.js";
import type { CursorPage, RequestOptions } from "../../src/core/result.js";
import { Resource } from "../../src/resources/base.js";
import { createClient } from "../../src/generated/client/index.js";

interface Envelope extends CursorPage<number> {
  period: { to: string };
  data_as_of: null;
}

class QueryResource extends Resource {
  readonly attempts: Array<{ cursor?: string; key: string; headers: Record<string, string> }> = [];

  query(options?: RequestOptions) {
    return this.paginated<number, Envelope>("POST", options, async ({ headers }, cursor) => {
      this.attempts.push({ cursor, key: headers["Idempotency-Key"], headers });
      if (this.attempts.length === 2) {
        return { error: {}, response: new Response(null, { status: 503, headers: { "Retry-After": "0" } }) };
      }
      return {
        data: {
          data: [cursor === undefined ? 1 : 2],
          next_cursor: cursor === undefined ? "next" : null,
          prev_cursor: "previous",
          refresh_cursor: "refresh",
          period: { to: "exclusive-response-bound" },
          data_as_of: null,
        },
        response: new Response(null, { status: 200 }),
      };
    });
  }
}

it("preserves the response envelope and uses one idempotency key per POST page", async () => {
  const resource = new QueryResource(new BirdHTTPClient({ timeout: 1_000, maxRetries: 1 }), createClient());
  const options = { idempotencyKey: "first-page", headers: { "idempotency-key": "header-key", "X-Trace": "trace" } };
  const pages = resource.query(options);
  const first = await pages;
  expect(first.period.to).toBe("exclusive-response-bound");
  expect(first.data_as_of).toBeNull();
  const data: number[] = [];
  for await (const item of pages) data.push(item);
  expect(data).toEqual([1, 2]);
  expect(resource.attempts).toHaveLength(3);
  expect(resource.attempts[0].key).toBe("first-page");
  expect(resource.attempts[1].key).toBeTruthy();
  expect(resource.attempts[1].key).not.toBe("first-page");
  expect(resource.attempts[2]).toEqual(resource.attempts[1]);
  expect(resource.attempts[1].headers["idempotency-key"]).toBeUndefined();
  expect(resource.attempts[1].headers["X-Trace"]).toBe("trace");
  expect(options.headers["idempotency-key"]).toBe("header-key");
  expect(options.idempotencyKey).toBe("first-page");
});
