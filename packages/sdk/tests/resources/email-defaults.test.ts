import { recordFetch, jsonResponse } from "../transport.js";
import { describe, it, expect } from "vitest";
import { BirdClient } from "../../src/client.js";

function capture() {
  return recordFetch(() => jsonResponse(202, { id: "em_1", status: "accepted" }));
}

// The compile-time half of this contract is asserted in
// tests/types/email-defaults.types.ts — the main tsconfig excludes this tree, so
// a `@ts-expect-error` written here would never be checked.

describe("email channel defaults", () => {
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

  it("applies defaults to every batch item", async () => {
    const { fn, calls } = capture();
    const bird = new BirdClient({ apiKey: "bk_eu1_x", fetch: fn, email: { from: "noreply@acme.com" } });
    await bird.email.sendBatch({
      messages: [
        { to: ["a@b.com"], subject: "s", html: "<p>h</p>" },
        { from: "sales@acme.com", to: ["c@d.com"], subject: "s", html: "<p>h</p>" },
      ],
    });
    const body = await calls[0].clone().json();
    expect(body.messages.map((m: { from: string }) => m.from)).toEqual([
      "noreply@acme.com",
      "sales@acme.com",
    ]);
  });

  it("wraps a deprecated bare-array batch into the messages envelope", async () => {
    const { fn, calls } = capture();
    const bird = new BirdClient({ apiKey: "bk_eu1_x", fetch: fn, email: { from: "noreply@acme.com" } });
    await bird.email.sendBatch([{ to: ["a@b.com"], subject: "s", html: "<p>h</p>" }]);
    const body = await calls[0].clone().json();
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].from).toBe("noreply@acme.com");
  });

  it("merges multiple defaults (reply_to, category)", async () => {
    const { fn, calls } = capture();
    const bird = new BirdClient({
      apiKey: "bk_eu1_x",
      fetch: fn,
      email: { from: "n@acme.com", ip_pool_id: "ipp_shared", reply_to: ["ops@acme.com"], category: "marketing" },
    });
    await bird.email.send({ to: ["a@b.com"], subject: "s", html: "<p>h</p>" });
    const body = await calls[0].clone().json();
    expect(body.from).toBe("n@acme.com");
    expect(body.ip_pool_id).toBe("ipp_shared");
    expect(body.reply_to).toEqual(["ops@acme.com"]);
    expect(body.category).toBe("marketing");
  });
});
