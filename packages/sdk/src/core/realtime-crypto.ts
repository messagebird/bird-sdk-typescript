// Crypto for Realtime end-to-end encrypted channels (`private-encrypted-…`).
// The wire contract: a channel's key is SHA-256(channel_name || master_key),
// carried to clients as base64 `shared_secret` in the channel-auth response;
// an event's payload is an XSalsa20-Poly1305 box over the JSON-serialized
// data, published as `{nonce, ciphertext}` (both base64). The master key is
// the customer's alone — it is never sent to Bird.
//
// Hashing and HMAC use WebCrypto (edge-safe); the box cipher is not in
// WebCrypto, so it comes from the generated copy of the realtime client's
// implementation.

import { BirdError } from "../errors.js";
import { seal } from "./secretbox.gen.js";

export const ENCRYPTED_CHANNEL_PREFIX = "private-encrypted-";

export function isEncryptedChannel(name: string): boolean {
  return name.startsWith(ENCRYPTED_CHANNEL_PREFIX);
}

/** The `{nonce, ciphertext}` envelope published as an encrypted event's data. */
export interface EncryptedEnvelope {
  nonce: string;
  ciphertext: string;
}

/**
 * Decode and validate the configured master key: 32 bytes, base64. Validated
 * here so a bad key fails with a message naming the config, not a cipher
 * internals error at publish time.
 */
export function decodeMasterKey(masterKey: string | undefined): Uint8Array {
  if (!masterKey) {
    throw new BirdError(
      "Publishing to a private-encrypted- channel requires the encryption " +
        "master key. Set `realtime: { encryptionMasterKey }` on the client — " +
        "generate one as 32 random bytes, base64-encoded.",
    );
  }
  let decoded: Uint8Array | null = null;
  try {
    decoded = Uint8Array.from(atob(masterKey), (c) => c.charCodeAt(0));
  } catch {
    decoded = null;
  }
  if (!decoded || decoded.length !== 32) {
    throw new BirdError(
      "realtime.encryptionMasterKey must be 32 bytes, base64-encoded.",
    );
  }
  return decoded;
}

/** SHA-256(channel_name || master_key) — the channel's secretbox key. */
export async function deriveSharedSecret(
  channelName: string,
  masterKey: Uint8Array,
): Promise<Uint8Array> {
  const channel = new TextEncoder().encode(channelName);
  const input = new Uint8Array(channel.length + masterKey.length);
  input.set(channel);
  input.set(masterKey, channel.length);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", input));
}

/** Encrypt an event payload for one encrypted channel. */
export async function encryptForChannel(
  channelName: string,
  data: unknown,
  masterKey: Uint8Array,
): Promise<EncryptedEnvelope> {
  const key = await deriveSharedSecret(channelName, masterKey);
  const nonce = crypto.getRandomValues(new Uint8Array(24));
  const plaintext = new TextEncoder().encode(JSON.stringify(data ?? null));
  const box = seal(plaintext, nonce, key);
  return { nonce: toBase64(nonce), ciphertext: toBase64(box) };
}

/** `hex(HMAC-SHA256(secret, payload))` — the channel-auth signature. */
export async function hmacSha256Hex(
  secret: string,
  payload: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)),
  );
  return Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function toBase64(bytes: Uint8Array): string {
  let raw = "";
  for (const b of bytes) raw += String.fromCharCode(b);
  return btoa(raw);
}
