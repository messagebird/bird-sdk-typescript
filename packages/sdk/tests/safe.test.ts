import { recordFetch as fakeFetch, optionalJsonResponse as jsonRes } from "./transport.js";
import { describe, it, expect } from "vitest";
import { BirdClient } from "../src/client.js";
import { BirdError, BirdPermissionError } from "../src/index.js";

const client = (fn: typeof fetch) => new BirdClient({ apiKey: "bk_eu1_x", fetch: fn });

describe(".safe()", () => {
  it("does not swallow into a BirdError: an abort rejection is the native AbortError", async () => {
    const { fn } = fakeFetch(() => jsonRes(200, {}));
    const ac = new AbortController();
    ac.abort();
    const err = await client(fn)
      .request({ method: "GET", path: "/v1/things" }, { signal: ac.signal })
      .safe()
      .catch((e: unknown) => e);
    expect(err).not.toBeInstanceOf(BirdError);
    expect((err as Error).name).toBe("AbortError");
  });

  it("list().safe() resolves the first page as a result with its response", async () => {
    const message = { id: "em_1", subject: "Hi", status: "accepted" };
    const { fn } = fakeFetch(() =>
      jsonRes(200, { data: [message], next_cursor: null, prev_cursor: null, refresh_cursor: null }),
    );
    const { data, error, response } = await client(fn).email.list().safe();
    expect(error).toBeNull();
    expect(data?.data[0].id).toBe("em_1");
    expect(response?.status).toBe(200);
  });

  it("list().safe() returns the error and a null response on failure", async () => {
    const { fn } = fakeFetch(() => jsonRes(403, { type: "permission_error", message: "denied" }));
    const { data, error, response } = await client(fn).email.list().safe();
    expect(data).toBeNull();
    expect(response).toBeNull();
    expect(error).toBeInstanceOf(BirdPermissionError);
    expect(error).toBeInstanceOf(BirdError);
  });
});

