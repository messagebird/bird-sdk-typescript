import { describe, it, expect } from "vitest";
import { BirdClient } from "../../src/client.js";

function capture() {
  const calls: Request[] = [];
  const fn = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push(new Request(input, init));
    return new Response(JSON.stringify({ id: "eb_1", status: "scheduled" }), {
      status: 202,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  return { fn, calls };
}

function bird(fn: typeof fetch) {
  return new BirdClient({ apiKey: "bk_eu1_x", fetch: fn });
}

// The conformance drivers hand `scheduled_at` to the facade already
// wire-shaped, so a `Date` — the input these methods are hand-written to
// convert — reaches the conversion only here.
describe("broadcasts scheduled_at conversion", () => {
  it("writes a whole-second Date as a bare Z, matching the other three SDKs", async () => {
    const { fn, calls } = capture();
    await bird(fn).broadcasts.send("eb_1", { scheduled_at: new Date("2026-08-01T09:00:00Z") });
    expect((await calls[0].clone().json()).scheduled_at).toBe("2026-08-01T09:00:00Z");
  });

  it("keeps a sub-second component when the caller supplies one", async () => {
    const { fn, calls } = capture();
    await bird(fn).broadcasts.send("eb_1", { scheduled_at: new Date("2026-08-01T09:00:00.250Z") });
    expect((await calls[0].clone().json()).scheduled_at).toBe("2026-08-01T09:00:00.250Z");
  });

  it("passes a caller's own string through unchanged", async () => {
    const { fn, calls } = capture();
    await bird(fn).broadcasts.send("eb_1", { scheduled_at: "2026-08-01T09:00:00+02:00" });
    expect((await calls[0].clone().json()).scheduled_at).toBe("2026-08-01T09:00:00+02:00");
  });

  it("converts the same way on create", async () => {
    const { fn, calls } = capture();
    await bird(fn).broadcasts.create({
      from: "newsletter@acme.com",
      audience_id: "adn_1",
      template: { id: "emt_1" },
      send: true,
      scheduled_at: new Date("2026-08-01T09:00:00Z"),
    });
    expect((await calls[0].clone().json()).scheduled_at).toBe("2026-08-01T09:00:00Z");
  });
});
