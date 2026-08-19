import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { BirdRealtime } from "../src/client.js";
import { EncryptedChannel, channelFor } from "../src/channel.js";
import { encryption } from "../src/encrypted.js";
import { open, seal } from "../src/secretbox.js";
import { encode } from "../src/protocol.js";
import type { Authorizer, WebSocketLike } from "../src/types.js";

// The cross-SDK vectors, generated from x/crypto's secretbox (the canonical
// implementation) by beak gen:realtime-encryption. They are what pins this
// package's clean-room cipher to the wire contract.
const vectors = JSON.parse(
  readFileSync(new URL("./realtime-encryption-vectors.json", import.meta.url), "utf8"),
) as {
  encrypt: {
    id: string;
    channel: string;
    master_key: string;
    plaintext: string;
    nonce: string;
    ciphertext: string;
  }[];
  decrypt: {
    id: string;
    channel: string;
    master_key: string;
    nonce: string;
    ciphertext: string;
    plaintext?: string;
    result: string;
  }[];
  derive_shared_secret: { id: string; channel: string; master_key: string; shared_secret: string }[];
};

const b64decode = (s: string) =>
  Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const b64encode = (b: Uint8Array) => btoa(String.fromCharCode(...b));

async function deriveKey(channel: string, masterKeyB64: string): Promise<Uint8Array> {
  const master = b64decode(masterKeyB64);
  const input = new Uint8Array([...new TextEncoder().encode(channel), ...master]);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", input));
}

describe("secretbox", () => {
  it("opens every valid decrypt vector and refuses every invalid one", async () => {
    for (const v of vectors.decrypt) {
      const key = await deriveKey(v.channel, v.master_key);
      const plain = open(b64decode(v.ciphertext), b64decode(v.nonce), key);
      if (v.result === "valid") {
        expect(plain, v.id).not.toBeNull();
        expect(new TextDecoder().decode(plain!), v.id).toBe(v.plaintext);
      } else {
        expect(plain, v.id).toBeNull();
      }
    }
  });

  it("seals every encrypt vector to the canonical bytes", async () => {
    for (const v of vectors.encrypt) {
      const key = await deriveKey(v.channel, v.master_key);
      const box = seal(new TextEncoder().encode(v.plaintext), b64decode(v.nonce), key);
      expect(b64encode(box), v.id).toBe(v.ciphertext);
    }
  });

  it("round-trips payloads across block boundaries", () => {
    const key = new Uint8Array(32).fill(7);
    const nonce = new Uint8Array(24).fill(9);
    // 64-byte Salsa20 blocks shifted by the 32-byte Poly1305 key make the
    // boundary cases 32, 96, 160…; probe around them and past 10 KB.
    for (const size of [0, 1, 31, 32, 33, 95, 96, 97, 1024, 10240]) {
      const msg = new Uint8Array(size).map((_, i) => i & 0xff);
      const opened = open(seal(msg, nonce, key), nonce, key);
      expect(opened).not.toBeNull();
      expect(Array.from(opened!)).toEqual(Array.from(msg));
    }
  });
});

// ---- EncryptedChannel behavior -------------------------------------------

class FakeSocket implements WebSocketLike {
  sent: string[] = [];
  onopen: ((ev?: unknown) => void) | null = null;
  onclose: ((ev: { code: number; reason?: string }) => void) | null = null;
  onmessage: ((ev: { data: unknown }) => void) | null = null;
  onerror: ((ev?: unknown) => void) | null = null;
  send(data: string): void {
    this.sent.push(data);
  }
  close(): void {}
  deliver(event: string, data?: unknown, channel?: string): void {
    this.onmessage?.({ data: encode({ event, channel, data }) });
  }
}

const CHANNEL = "private-encrypted-orders";
const tick = () => new Promise((r) => setTimeout(r, 0));

/** An authorizer serving shared secrets from a rotatable key list. */
function keyedAuthorizer(keys: () => string): Authorizer {
  return async () => ({ auth: "app-key:sig", shared_secret: keys() });
}

function encryptedClient(authorizer: Authorizer) {
  const sockets: FakeSocket[] = [];
  const bird = new BirdRealtime({
    appKey: "app-key",
    region: "us1",
    encryption,
    authorizer,
    webSocket: () => {
      const s = new FakeSocket();
      sockets.push(s);
      return s;
    },
  });
  sockets[0]!.onopen?.();
  sockets[0]!.deliver("bird:connection_established", {
    connection_id: "77.1",
    activity_timeout: 120,
  });
  return { bird, socket: sockets[0]! };
}

function sealEnvelope(payload: unknown, key: Uint8Array) {
  const nonce = crypto.getRandomValues(new Uint8Array(24));
  const box = seal(new TextEncoder().encode(JSON.stringify(payload)), nonce, key);
  return { nonce: b64encode(nonce), ciphertext: b64encode(box) };
}

describe("EncryptedChannel", () => {
  const keyA = new Uint8Array(32).fill(1);
  const keyB = new Uint8Array(32).fill(2);

  it("decrypts application events before they reach bindings", async () => {
    const { bird, socket } = encryptedClient(keyedAuthorizer(() => b64encode(keyA)));
    const channel = bird.subscribe(CHANNEL);
    await tick();
    socket.deliver("bird_internal:subscription_succeeded", {}, CHANNEL);
    const received: unknown[] = [];
    channel.bind("order-updated", (data) => received.push(data));
    socket.deliver("order-updated", sealEnvelope({ id: 42 }, keyA), CHANNEL);
    await tick();
    expect(received).toEqual([{ id: 42 }]);
  });

  it("re-authorizes once on a rotated key, then decrypts", async () => {
    let current = keyA;
    let authCalls = 0;
    const { bird, socket } = encryptedClient(async () => {
      authCalls++;
      return { auth: "app-key:sig", shared_secret: b64encode(current) };
    });
    const channel = bird.subscribe(CHANNEL);
    await tick();
    socket.deliver("bird_internal:subscription_succeeded", {}, CHANNEL);
    // The master key rotates after the subscription authorized with keyA.
    current = keyB;
    const received: unknown[] = [];
    channel.bind("order-updated", (data) => received.push(data));
    socket.deliver("order-updated", sealEnvelope({ id: 1 }, keyB), CHANNEL);
    await tick();
    await tick();
    expect(received).toEqual([{ id: 1 }]);
    expect(authCalls).toBe(2);
  });

  it("drops an undecryptable event and reports bird:decryption_error", async () => {
    const { bird, socket } = encryptedClient(keyedAuthorizer(() => b64encode(keyA)));
    const channel = bird.subscribe(CHANNEL);
    await tick();
    socket.deliver("bird_internal:subscription_succeeded", {}, CHANNEL);
    const received: unknown[] = [];
    const errors: unknown[] = [];
    channel.bind("order-updated", (data) => received.push(data));
    channel.bind("bird:decryption_error", (data) => errors.push(data));
    socket.deliver("order-updated", sealEnvelope({ id: 1 }, keyB), CHANNEL);
    await tick();
    await tick();
    expect(received).toEqual([]);
    expect(errors).toEqual([{ channel: CHANNEL, event: "order-updated" }]);
  });

  it("keeps event order across a mid-stream re-authorization", async () => {
    let current = keyA;
    const { bird, socket } = encryptedClient(async () => ({
      auth: "app-key:sig",
      shared_secret: b64encode(current),
    }));
    const channel = bird.subscribe(CHANNEL);
    await tick();
    socket.deliver("bird_internal:subscription_succeeded", {}, CHANNEL);
    current = keyB;
    const received: unknown[] = [];
    channel.bind("evt", (data) => received.push(data));
    // First event needs the re-auth round-trip; the second would decrypt
    // instantly and must still arrive after it.
    socket.deliver("evt", sealEnvelope("first", keyB), CHANNEL);
    socket.deliver("evt", sealEnvelope("second", keyB), CHANNEL);
    await tick();
    await tick();
    expect(received).toEqual(["first", "second"]);
  });

  it("keeps decrypting after a binding throws, and still surfaces the error", async () => {
    const { bird, socket } = encryptedClient(keyedAuthorizer(() => b64encode(keyA)));
    const channel = bird.subscribe(CHANNEL);
    await tick();
    socket.deliver("bird_internal:subscription_succeeded", {}, CHANNEL);
    const received: unknown[] = [];
    let threw = false;
    channel.bind("evt", (data) => {
      received.push(data);
      if (!threw) {
        threw = true;
        throw new Error("customer handler bug");
      }
    });
    // The queue surfaces a binding's throw by rethrowing inside setTimeout
    // (where window.onerror would see it). Wrap setTimeout so the test can
    // capture that rethrow instead of crashing the runner.
    const realSetTimeout = globalThis.setTimeout;
    const surfaced: unknown[] = [];
    globalThis.setTimeout = ((fn: () => void, ms?: number) =>
      realSetTimeout(() => {
        try {
          fn();
        } catch (err) {
          surfaced.push(err);
        }
      }, ms)) as typeof setTimeout;
    try {
      socket.deliver("evt", sealEnvelope("first", keyA), CHANNEL);
      socket.deliver("evt", sealEnvelope("second", keyA), CHANNEL);
      await tick();
      await tick();
    } finally {
      globalThis.setTimeout = realSetTimeout;
    }
    expect(received).toEqual(["first", "second"]);
    expect(String(surfaced[0])).toContain("customer handler bug");
  });

  it("fails the subscription when the shared_secret is not 32 base64 bytes", async () => {
    const { bird, socket } = encryptedClient(async () => ({
      auth: "app-key:sig",
      shared_secret: b64encode(new Uint8Array(16)),
    }));
    const channel = bird.subscribe(CHANNEL);
    const failures: unknown[] = [];
    channel.bind("bird:subscription_error", (data) => failures.push(data));
    await tick();
    expect(failures).toHaveLength(1);
    expect(String((failures[0] as { error?: unknown })?.error)).toContain(
      "32 bytes",
    );
    expect(socket.sent.some((s) => s.includes("bird:subscribe"))).toBe(false);
  });

  it("fails the subscription when the auth response has no shared_secret", async () => {
    const { bird, socket } = encryptedClient(async () => ({ auth: "app-key:sig" }));
    const channel = bird.subscribe(CHANNEL);
    const failures: unknown[] = [];
    channel.bind("bird:subscription_error", (data) => failures.push(data));
    await tick();
    expect(failures).toHaveLength(1);
    expect(String((failures[0] as { error?: unknown })?.error)).toContain(
      "shared_secret",
    );
    expect(socket.sent.some((s) => s.includes("bird:subscribe"))).toBe(false);
  });

  it("never sends the shared secret to the edge", async () => {
    const { bird, socket } = encryptedClient(keyedAuthorizer(() => b64encode(keyA)));
    bird.subscribe(CHANNEL);
    await tick();
    const subscribe = socket.sent.find((s) => s.includes("bird:subscribe"));
    expect(subscribe).toBeDefined();
    expect(subscribe).not.toContain("shared_secret");
  });

  it("refuses client events", async () => {
    const { bird } = encryptedClient(keyedAuthorizer(() => b64encode(keyA)));
    const channel = bird.subscribe(CHANNEL);
    expect(() => channel.trigger("client-typing", {})).toThrow(
      /not supported on encrypted channels/,
    );
  });

  it("throws at subscribe time when no encryption provider is configured", () => {
    expect(() =>
      channelFor(CHANNEL, () => true, async () => ({ auth: "x" })),
    ).toThrow(/@messagebird\/realtime\/encrypted/);
  });

  it("routes the prefix to EncryptedChannel, ahead of private-", () => {
    const channel = channelFor(
      CHANNEL,
      () => true,
      async () => ({ auth: "x" }),
      encryption,
    );
    expect(channel).toBeInstanceOf(EncryptedChannel);
  });
});
