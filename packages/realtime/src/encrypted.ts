// The `@messagebird/realtime/encrypted` subpath: the cipher for end-to-end
// encrypted channels (`private-encrypted-…`), packaged as the client's
// `encryption` option. A separate entry point because the cipher is the one
// heavy part of the feature — the default bundle stays free of it, and only
// apps that subscribe to encrypted channels pay for it:
//
//   import { BirdRealtime } from "@messagebird/realtime";
//   import { encryption } from "@messagebird/realtime/encrypted";
//
//   const bird = new BirdRealtime({ appKey, region: "us1", encryption });
//   bird.subscribe("private-encrypted-orders");
import type { EncryptionProvider } from "./types.js";
import { open } from "./secretbox.js";

/** The XSalsa20-Poly1305 provider that unlocks `private-encrypted-` channels. */
export const encryption: EncryptionProvider = { open };

export type { EncryptionProvider } from "./types.js";
