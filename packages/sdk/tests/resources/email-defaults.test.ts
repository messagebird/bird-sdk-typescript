import { describe, it, expect } from "vitest";
import { BirdClient } from "../../src/client.js";

function capture() {
  const calls: Request[] = [];
  const fn = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push(new Request(input, init));
    return new Response(JSON.stringify({ id: "em_1", status: "accepted" }), {
      status: 202,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  return { fn, calls };
}

// The compile-time half of this contract is asserted in
// tests/types/email-defaults.types.ts — the main tsconfig excludes this tree, so
// a `@ts-expect-error` written here would never be checked.

describe("email channel defaults", () => {
  it("fills the channel default `from` when omitted", async () => {
    const { fn, calls } = capture();
    const bird = new BirdClient({ apiKey: "bk_eu1_x", fetch: fn, email: { from: "noreply@acme.com" } });
    await bird.email.send({ to: ["a@b.com"], subject: "s", html: "<p>h</p>" });
    expect((await calls[0].clone().json()).from).toBe("noreply@acme.com");
  });

  it("lets a per-send `from` override the default", async () => {
    const { fn, calls } = capture();
    const bird = new BirdClient({ apiKey: "bk_eu1_x", fetch: fn, email: { from: "noreply@acme.com" } });
    await bird.email.send({ from: "sales@acme.com", to: ["a@b.com"], subject: "s", html: "<p>h</p>" });
    expect((await calls[0].clone().json()).from).toBe("sales@acme.com");
  });

  // The conformance corpus pins the same rule for an explicit null
  // (send_explicit_null_from_falls_back_to_config); JSON cannot express
  // `undefined`, which is the form a TypeScript caller actually writes.
  it("treats an explicit `undefined` as unset, so the default still fills", async () => {
    const { fn, calls } = capture();
    const bird = new BirdClient({ apiKey: "bk_eu1_x", fetch: fn, email: { from: "noreply@acme.com" } });
    await bird.email.send({ from: undefined, to: ["a@b.com"], subject: "s", html: "<p>h</p>" });
    expect((await calls[0].clone().json()).from).toBe("noreply@acme.com");
  });

  it("fills the channel default `ip_pool_id` when omitted", async () => {
    const { fn, calls } = capture();
    const bird = new BirdClient({
      apiKey: "bk_eu1_x",
      fetch: fn,
      email: { from: "n@acme.com", ip_pool_id: "ipp_shared" },
    });
    await bird.email.send({ to: ["a@b.com"], subject: "s", html: "<p>h</p>" });
    expect((await calls[0].clone().json()).ip_pool_id).toBe("ipp_shared");
  });

  it("applies defaults to every batch item", async () => {
    const { fn, calls } = capture();
    const bird = new BirdClient({ apiKey: "bk_eu1_x", fetch: fn, email: { from: "noreply@acme.com" } });
    await bird.email.sendBatch([
      { to: ["a@b.com"], subject: "s", html: "<p>h</p>" },
      { from: "sales@acme.com", to: ["c@d.com"], subject: "s", html: "<p>h</p>" },
    ]);
    const body = await calls[0].clone().json();
    expect(body.map((m: { from: string }) => m.from)).toEqual([
      "noreply@acme.com",
      "sales@acme.com",
    ]);
  });

  it("merges multiple defaults (reply_to, category)", async () => {
    const { fn, calls } = capture();
    const bird = new BirdClient({
      apiKey: "bk_eu1_x",
      fetch: fn,
      email: { from: "n@acme.com", reply_to: ["ops@acme.com"], category: "marketing" },
    });
    await bird.email.send({ to: ["a@b.com"], subject: "s", html: "<p>h</p>" });
    const body = await calls[0].clone().json();
    expect(body.reply_to).toEqual(["ops@acme.com"]);
    expect(body.category).toBe("marketing");
  });
});
