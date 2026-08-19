import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { BirdClient } from "../../src/client.js";
import { BirdError } from "../../src/errors.js";
import { open, seal } from "../../src/core/secretbox.gen.js";
import {
  deriveSharedSecret,
  decodeMasterKey,
} from "../../src/core/realtime-crypto.js";

// The cross-SDK vectors (beak gen:realtime-encryption), generated from
// x/crypto's secretbox. They pin this SDK to the shared wire contract.
const vectors = JSON.parse(
  readFileSync(
    new URL("../realtime-encryption-vectors.json", import.meta.url),
    "utf8",
  ),
) as {
  derive_shared_secret: {
    id: string;
    channel: string;
    master_key: string;
    shared_secret: string;
  }[];
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
  authorize_channel: {
    id: string;
    key: string;
    secret: string;
    master_key?: string;
    connection_id: string;
    channel: string;
    member_data?: string;
    auth: string;
    shared_secret?: string;
  }[];
};

const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const toB64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));

const APP = "rap_01krdgeqcxet5s7t44vh8rt9mg";
const MASTER = vectors.encrypt[0]!.master_key;

function fakeFetch() {
  const calls: Request[] = [];
  const bodies: unknown[] = [];
  const fn = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const req = new Request(input, init);
    calls.push(req);
    bodies.push(JSON.parse(await req.clone().text()));
    return new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  return { fn, calls, bodies };
}

function bird(fn: typeof fetch, encryptionMasterKey?: string) {
  return new BirdClient({
    apiKey: "bk_eu1_test",
    fetch: fn,
    realtime: { key: "rk_live", secret: "rs_live", encryptionMasterKey },
  });
}

describe("realtime crypto vectors", () => {
  it("derives every shared secret to the canonical bytes", async () => {
    for (const v of vectors.derive_shared_secret) {
      const secret = await deriveSharedSecret(
        v.channel,
        decodeMasterKey(v.master_key),
      );
      expect(toB64(secret), v.id).toBe(v.shared_secret);
    }
  });

  it("seals every encrypt vector to the canonical bytes", async () => {
    for (const v of vectors.encrypt) {
      const key = await deriveSharedSecret(
        v.channel,
        decodeMasterKey(v.master_key),
      );
      const box = seal(
        new TextEncoder().encode(v.plaintext),
        b64(v.nonce),
        key,
      );
      expect(toB64(box), v.id).toBe(v.ciphertext);
    }
  });

  it("opens every decrypt vector per its verdict", async () => {
    for (const v of vectors.decrypt) {
      const key = await deriveSharedSecret(
        v.channel,
        decodeMasterKey(v.master_key),
      );
      const plain = open(b64(v.ciphertext), b64(v.nonce), key);
      if (v.result === "valid") {
        expect(plain && new TextDecoder().decode(plain), v.id).toBe(v.plaintext);
      } else {
        expect(plain, v.id).toBeNull();
      }
    }
  });
});

describe("bird.realtime.authorizeChannel", () => {
  it("signs every authorize vector to the canonical response", async () => {
    for (const v of vectors.authorize_channel) {
      const client = new BirdClient({
        apiKey: "bk_eu1_test",
        realtime: {
          key: v.key,
          secret: v.secret,
          encryptionMasterKey: v.master_key,
        },
      });
      const out = await client.realtime.authorizeChannel({
        connectionId: v.connection_id,
        channelName: v.channel,
        memberData: v.member_data,
      });
      expect(out.auth, v.id).toBe(v.auth);
      expect(out.member_data, v.id).toBe(v.member_data);
      expect(out.shared_secret, v.id).toBe(v.shared_secret);
    }
  });

  it("refuses an encrypted channel without a master key", async () => {
    const client = new BirdClient({
      apiKey: "bk_eu1_test",
      realtime: { key: "rk", secret: "rs" },
    });
    await expect(
      client.realtime.authorizeChannel({
        connectionId: "1.1",
        channelName: "private-encrypted-orders",
      }),
    ).rejects.toThrow(/encryptionMasterKey/);
  });

  it("refuses to sign without app credentials", async () => {
    const client = new BirdClient({ apiKey: "bk_eu1_test" });
    await expect(
      client.realtime.authorizeChannel({
        connectionId: "1.1",
        channelName: "private-room",
      }),
    ).rejects.toThrow(/realtime: \{ key, secret \}/);
  });
});

describe("bird.realtime.publish encryption", () => {
  it("seals the payload before it leaves the process", async () => {
    const { fn, bodies } = fakeFetch();
    await bird(fn, MASTER).realtime.publish(APP, {
      event: "order.updated",
      channels: ["private-encrypted-orders"],
      data: { id: 42, status: "shipped" },
    });
    const body = bodies[0] as {
      data: { nonce: string; ciphertext: string };
      channels: string[];
    };
    expect(body.channels).toEqual(["private-encrypted-orders"]);
    expect(JSON.stringify(body)).not.toContain("shipped");
    const key = await deriveSharedSecret(
      "private-encrypted-orders",
      decodeMasterKey(MASTER),
    );
    const plain = open(b64(body.data.ciphertext), b64(body.data.nonce), key);
    expect(plain).not.toBeNull();
    expect(JSON.parse(new TextDecoder().decode(plain!))).toEqual({
      id: 42,
      status: "shipped",
    });
  });

  it("leaves plain channels untouched", async () => {
    const { fn, bodies } = fakeFetch();
    await bird(fn, MASTER).realtime.publish(APP, {
      event: "order.updated",
      channels: ["orders"],
      data: { id: 42 },
    });
    expect((bodies[0] as { data: unknown }).data).toEqual({ id: 42 });
  });

  it("rejects a multi-channel publish that includes an encrypted channel", () => {
    const { fn } = fakeFetch();
    expect(() =>
      bird(fn, MASTER).realtime.publish(APP, {
        event: "e",
        channels: ["private-encrypted-orders", "orders"],
        data: {},
      }),
    ).toThrow(BirdError);
  });

  it("rejects an encrypted publish without a master key", () => {
    const { fn } = fakeFetch();
    expect(() =>
      bird(fn).realtime.publish(APP, {
        event: "e",
        channels: ["private-encrypted-orders"],
        data: {},
      }),
    ).toThrow(/encryptionMasterKey/);
  });

  it("seals only the encrypted items of a batch", async () => {
    const { fn, bodies } = fakeFetch();
    await bird(fn, MASTER).realtime.publishBatch(APP, {
      events: [
        { event: "e1", channel: "orders", data: { plain: true } },
        { event: "e2", channel: "private-encrypted-orders", data: { secret: 1 } },
      ],
    });
    const body = bodies[0] as {
      events: { channel: string; data: unknown }[];
    };
    expect(body.events[0]!.data).toEqual({ plain: true });
    const envelope = body.events[1]!.data as { nonce: string; ciphertext: string };
    const key = await deriveSharedSecret(
      "private-encrypted-orders",
      decodeMasterKey(MASTER),
    );
    const plain = open(b64(envelope.ciphertext), b64(envelope.nonce), key);
    expect(JSON.parse(new TextDecoder().decode(plain!))).toEqual({ secret: 1 });
  });
});
