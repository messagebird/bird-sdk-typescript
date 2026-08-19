// XSalsa20-Poly1305 secretbox (the NaCl construction), implemented from the
// specification. It exists because encrypted channels fix this exact cipher on
// the wire and WebCrypto does not provide it. Poly1305 uses BigInt: the
// payload cap is 10 KB (640 blocks), so auditability wins over a limb
// implementation's speed. Like every JS crypto, this is not constant-time in a
// way the runtime can guarantee; the tag check at least avoids early exit.
//
// This file is the canonical implementation; the server SDK's copy is
// generated from it (beak gen:realtime-encryption-vectors) so the two cannot
// drift.

// "expand 32-byte k"
const SIGMA = new Uint8Array([
  101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107,
]);

function rotl(x: number, c: number): number {
  return (x << c) | (x >>> (32 - c));
}

function load32(b: Uint8Array, i: number): number {
  return (
    (b[i]! | (b[i + 1]! << 8) | (b[i + 2]! << 16) | (b[i + 3]! << 24)) >>> 0
  );
}

function store32(b: Uint8Array, i: number, v: number): void {
  b[i] = v & 0xff;
  b[i + 1] = (v >>> 8) & 0xff;
  b[i + 2] = (v >>> 16) & 0xff;
  b[i + 3] = (v >>> 24) & 0xff;
}

/**
 * The Salsa20 core over the 4x4 state built from `key` and a 16-byte `input`.
 * With `feedForward` this is the Salsa20 block function (stream generation);
 * without it, the state words at the diagonal and input positions form the
 * HSalsa20 output used for XSalsa20's subkey derivation.
 */
function salsa20Core(
  key: Uint8Array,
  input: Uint8Array,
  feedForward: boolean,
): Uint8Array {
  const j = new Int32Array(16);
  j[0] = load32(SIGMA, 0);
  j[1] = load32(key, 0);
  j[2] = load32(key, 4);
  j[3] = load32(key, 8);
  j[4] = load32(key, 12);
  j[5] = load32(SIGMA, 4);
  j[6] = load32(input, 0);
  j[7] = load32(input, 4);
  j[8] = load32(input, 8);
  j[9] = load32(input, 12);
  j[10] = load32(SIGMA, 8);
  j[11] = load32(key, 16);
  j[12] = load32(key, 20);
  j[13] = load32(key, 24);
  j[14] = load32(key, 28);
  j[15] = load32(SIGMA, 12);

  let x0 = j[0]!, x1 = j[1]!, x2 = j[2]!, x3 = j[3]!;
  let x4 = j[4]!, x5 = j[5]!, x6 = j[6]!, x7 = j[7]!;
  let x8 = j[8]!, x9 = j[9]!, x10 = j[10]!, x11 = j[11]!;
  let x12 = j[12]!, x13 = j[13]!, x14 = j[14]!, x15 = j[15]!;
  for (let round = 0; round < 20; round += 2) {
    x4 ^= rotl((x0 + x12) | 0, 7);
    x8 ^= rotl((x4 + x0) | 0, 9);
    x12 ^= rotl((x8 + x4) | 0, 13);
    x0 ^= rotl((x12 + x8) | 0, 18);
    x9 ^= rotl((x5 + x1) | 0, 7);
    x13 ^= rotl((x9 + x5) | 0, 9);
    x1 ^= rotl((x13 + x9) | 0, 13);
    x5 ^= rotl((x1 + x13) | 0, 18);
    x14 ^= rotl((x10 + x6) | 0, 7);
    x2 ^= rotl((x14 + x10) | 0, 9);
    x6 ^= rotl((x2 + x14) | 0, 13);
    x10 ^= rotl((x6 + x2) | 0, 18);
    x3 ^= rotl((x15 + x11) | 0, 7);
    x7 ^= rotl((x3 + x15) | 0, 9);
    x11 ^= rotl((x7 + x3) | 0, 13);
    x15 ^= rotl((x11 + x7) | 0, 18);
    x1 ^= rotl((x0 + x3) | 0, 7);
    x2 ^= rotl((x1 + x0) | 0, 9);
    x3 ^= rotl((x2 + x1) | 0, 13);
    x0 ^= rotl((x3 + x2) | 0, 18);
    x6 ^= rotl((x5 + x4) | 0, 7);
    x7 ^= rotl((x6 + x5) | 0, 9);
    x4 ^= rotl((x7 + x6) | 0, 13);
    x5 ^= rotl((x4 + x7) | 0, 18);
    x11 ^= rotl((x10 + x9) | 0, 7);
    x8 ^= rotl((x11 + x10) | 0, 9);
    x9 ^= rotl((x8 + x11) | 0, 13);
    x10 ^= rotl((x9 + x8) | 0, 18);
    x12 ^= rotl((x15 + x14) | 0, 7);
    x13 ^= rotl((x12 + x15) | 0, 9);
    x14 ^= rotl((x13 + x12) | 0, 13);
    x15 ^= rotl((x14 + x13) | 0, 18);
  }

  const x = [x0, x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12, x13, x14, x15];
  const out = new Uint8Array(feedForward ? 64 : 32);
  if (feedForward) {
    for (let i = 0; i < 16; i++) store32(out, 4 * i, (x[i]! + j[i]!) | 0);
    return out;
  }
  const picks = [0, 5, 10, 15, 6, 7, 8, 9];
  for (let i = 0; i < 8; i++) store32(out, 4 * i, x[picks[i]!]!);
  return out;
}

/**
 * The XSalsa20 keystream for a 24-byte nonce: an HSalsa20 subkey from the
 * nonce's first 16 bytes, then Salsa20 blocks over the remaining 8 bytes plus
 * a little-endian 64-bit block counter.
 */
function xsalsa20Stream(
  length: number,
  nonce: Uint8Array,
  key: Uint8Array,
): Uint8Array {
  const subkey = salsa20Core(key, nonce.subarray(0, 16), false);
  const input = new Uint8Array(16);
  input.set(nonce.subarray(16, 24));
  const stream = new Uint8Array(length);
  for (let block = 0; block * 64 < length; block++) {
    // The counter fits a float well past any 10 KB payload; bytes 12-15 stay 0.
    store32(input, 8, block);
    const chunk = salsa20Core(subkey, input, true);
    stream.set(chunk.subarray(0, Math.min(64, length - block * 64)), block * 64);
  }
  return stream;
}

const P1305 = (1n << 130n) - 5n;
const CLAMP = 0x0ffffffc0ffffffc0ffffffc0fffffffn;
const MASK128 = (1n << 128n) - 1n;

function leToBigInt(b: Uint8Array): bigint {
  let v = 0n;
  for (let i = b.length - 1; i >= 0; i--) v = (v << 8n) | BigInt(b[i]!);
  return v;
}

function poly1305(msg: Uint8Array, key: Uint8Array): Uint8Array {
  const r = leToBigInt(key.subarray(0, 16)) & CLAMP;
  const s = leToBigInt(key.subarray(16, 32));
  let acc = 0n;
  for (let i = 0; i < msg.length; i += 16) {
    const block = msg.subarray(i, Math.min(i + 16, msg.length));
    acc = ((acc + leToBigInt(block) + (1n << BigInt(8 * block.length))) * r) % P1305;
  }
  acc = (acc + s) & MASK128;
  const tag = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    tag[i] = Number(acc & 0xffn);
    acc >>= 8n;
  }
  return tag;
}

function tagsEqual(a: Uint8Array, b: Uint8Array): boolean {
  let d = 0;
  for (let i = 0; i < 16; i++) d |= a[i]! ^ b[i]!;
  return d === 0;
}

/**
 * Seal `plaintext` under a 24-byte `nonce` and 32-byte `key`, returning the
 * 16-byte Poly1305 tag followed by the ciphertext (the NaCl box layout).
 */
export function seal(
  plaintext: Uint8Array,
  nonce: Uint8Array,
  key: Uint8Array,
): Uint8Array {
  const stream = xsalsa20Stream(32 + plaintext.length, nonce, key);
  const out = new Uint8Array(16 + plaintext.length);
  for (let i = 0; i < plaintext.length; i++) {
    out[16 + i] = plaintext[i]! ^ stream[32 + i]!;
  }
  out.set(poly1305(out.subarray(16), stream.subarray(0, 32)));
  return out;
}

/**
 * Open a sealed box (tag || ciphertext). Returns the plaintext, or null when
 * the tag does not authenticate under this key and nonce — a wrong or rotated
 * key and a tampered message are indistinguishable by design.
 */
export function open(
  box: Uint8Array,
  nonce: Uint8Array,
  key: Uint8Array,
): Uint8Array | null {
  if (box.length < 16 || nonce.length !== 24 || key.length !== 32) return null;
  const ciphertext = box.subarray(16);
  const stream = xsalsa20Stream(32 + ciphertext.length, nonce, key);
  if (!tagsEqual(poly1305(ciphertext, stream.subarray(0, 32)), box.subarray(0, 16))) {
    return null;
  }
  const out = new Uint8Array(ciphertext.length);
  for (let i = 0; i < ciphertext.length; i++) {
    out[i] = ciphertext[i]! ^ stream[32 + i]!;
  }
  return out;
}
