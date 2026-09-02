// Compile-only assertions: a field configured as an email channel default
// becomes optional on `send` and on every `sendBatch` item.
//
// Nothing here runs — `tsc -p tsconfig.types.json` is the assertion. It sits
// outside `tests/**/*.test.ts` because the main tsconfig excludes that tree, so
// a `@ts-expect-error` written in a runtime test file is never checked.

import { BirdClient } from "../../src/client.js";
import { COMPOSE_FIELDS } from "../../src/resources/emailMailboxesMessages.js";
import type { EmailChannelDefaults } from "../../src/resources/emailDefaults.js";
import type { EmailMailboxComposeRequest } from "../../src/generated/types.gen.js";

const noDefault = new BirdClient({ apiKey: "bk_eu1_x" });
const withFrom = new BirdClient({
  apiKey: "bk_eu1_x",
  email: { from: "noreply@acme.com" },
});

// @ts-expect-error `from` is required when no email.from default is configured
void noDefault.email.send({ to: ["a@b.com"], subject: "s", html: "<p>h</p>" });
void withFrom.email.send({ to: ["a@b.com"], subject: "s", html: "<p>h</p>" });
void withFrom.email.send({ from: "x@acme.com", to: ["a@b.com"], subject: "s", html: "h" });

// @ts-expect-error a batch item needs `from` too when no default is configured
void noDefault.email.sendBatch({ messages: [{ to: ["a@b.com"], subject: "s", html: "<p>h</p>" }] });
void withFrom.email.sendBatch({ messages: [{ to: ["a@b.com"], subject: "s", html: "<p>h</p>" }] });
void withFrom.email.sendBatch({
  messages: [{ from: "x@acme.com", to: ["a@b.com"], subject: "s", html: "h" }],
});

// The deprecated bare-array form keeps the same per-item relaxation.
// @ts-expect-error a bare-array batch item needs `from` when no default is configured
void noDefault.email.sendBatch([{ to: ["a@b.com"], subject: "s", html: "<p>h</p>" }]);
void withFrom.email.sendBatch([{ to: ["a@b.com"], subject: "s", html: "<p>h</p>" }]);

// A default configured for one field does not relax another.
const withPool = new BirdClient({ apiKey: "bk_eu1_x", email: { ip_pool_id: "ipp_shared" } });
// @ts-expect-error ip_pool_id is defaulted, `from` still is not
void withPool.email.send({ to: ["a@b.com"], subject: "s", html: "<p>h</p>" });

// The compose merge carries a hand-listed subset of the defaults, because a
// compose body rejects any field it does not declare. This is the drift guard:
// a default that becomes compose-accepted and is left off COMPOSE_FIELDS stops
// type-checking here, rather than being silently ignored at runtime — the bug
// class the merge itself was added to fix.
type ComposeDefault = Extract<
  keyof EmailChannelDefaults,
  keyof EmailMailboxComposeRequest
>;
const _everyComposeDefaultIsMerged: ComposeDefault extends
  (typeof COMPOSE_FIELDS)[number]
  ? true
  : never = true;
void _everyComposeDefaultIsMerged;
