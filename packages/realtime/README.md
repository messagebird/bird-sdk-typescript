# @messagebird/realtime

The official Bird Realtime browser client: subscribe to channels and receive events in real time over a WebSocket.

> Looking for the server-side SDK (send messages, manage resources, verify webhooks — including publishing Realtime events)? That's [`@messagebird/sdk`](https://www.npmjs.com/package/@messagebird/sdk).

> Draft — the API is settling. Web (browser) only for now.

## Install

```sh
npm install @messagebird/realtime
```

## Quickstart

Browsable example: [`examples/quickstart-realtime.ts`](./examples/quickstart-realtime.ts)

```ts
import { BirdRealtime } from "@messagebird/realtime";

const bird = new BirdRealtime({
  appKey: "your-app-key",
  region: "us1", // us1 | eu1 — picks the edge automatically
});

const channel = bird.subscribe("orders");
channel.bind<{ id: number }>("order-updated", (data) => {
  console.log("order changed", data.id);
});

// Connection lifecycle
bird.connection.bind<{ previous: string; current: string }>("state_change", ({ previous, current }) => {
  console.log(`connection: ${previous} → ${current}`);
});
```

### Private and presence channels

Private (`private-…`) and presence (`presence-…`) channels are authorized by your backend. The client POSTs `{ connection_id, channel_name }` to your auth endpoint (same-origin by default — see `allowCrossOriginAuth`); your server signs it with the app secret and returns `{ auth, member_data? }`.

```ts
import type { Member } from "@messagebird/realtime";

const bird = new BirdRealtime({
  appKey: "your-app-key",
  region: "us1",
  authEndpoint: "/bird/auth", // your backend
});

// `subscribe` is typed by the name prefix, so presence members need no cast.
const room = bird.subscribe("presence-room-1");
room.bind("bird:subscription_succeeded", () => {
  console.log("me:", room.myId, "members:", [...room.members.values()]);
});
room.bind<Member>("bird:member_added", (member) => console.log("joined", member.member_id));
```

Server subscription rejections (bad signature, capacity) arrive on the connection, not the channel — the wire carries no channel attribution — so bind `bird.connection.bind("error", …)` to observe them; an authorizer failure does emit `bird:subscription_error` on the channel.

### Encrypted channels

`private-encrypted-…` channels carry end-to-end encrypted payloads: your server seals them with a master key only it holds, and this client unseals them with the `shared_secret` your auth endpoint returns (the server SDK's `authorizeChannel` adds it automatically). The cipher ships as a separate entry point so the default bundle stays free of it:

```ts
import { BirdRealtime } from "@messagebird/realtime";
import { encryption } from "@messagebird/realtime/encrypted";

const bird = new BirdRealtime({
  appKey: "your-app-key",
  region: "us1",
  authEndpoint: "/bird/auth",
  encryption,
});

const orders = bird.subscribe("private-encrypted-orders");
orders.bind("order.updated", (data) => console.log(data)); // decrypted
```

Bindings receive plaintext. Subscribing without the `encryption` option throws rather than delivering ciphertext; an event that cannot be decrypted (even after re-authorizing once to pick up a rotated key) is dropped and reported as `bird:decryption_error` on the channel. `trigger()` throws on encrypted channels — client events are not supported there.

### Signing in a member

`signin()` tells the edge who this connection belongs to, which is what lets the events API address a member and the disconnect API terminate them. The client POSTs `{ connection_id }` to `memberAuthEndpoint`; your server returns `{ auth, member_data }`, where `member_data` is the JSON string it signed.

```ts
const bird = new BirdRealtime({
  appKey: "your-app-key",
  region: "us1",
  memberAuthEndpoint: "/bird/auth/member", // your backend
});

const member = await bird.signin();
console.log("signed in as", member.member_id);

// The API terminated this member's connections.
bird.connection.bind("error", (e) => {
  if (e.code === 4009) console.log("session ended elsewhere");
});

// A re-signin after a reconnect failed: still connected, but no identity.
bird.connection.bind("signin_error", (e) => console.warn(e.message));
```

The identity lives on the connection, so it is dropped when the connection drops and re-established on the next one. Call `signin()` once. The re-signin has no promise to reject, which is what `signin_error` is for; it is a separate event from `error` so a failing member endpoint cannot disturb channel subscriptions.

### Events addressed to a member

Your server can send an event to a member rather than to a channel, reaching every connection that member holds. Once `signin()` succeeds the client subscribes to the member's reserved channel automatically; bind on `bird.member`:

```ts
await bird.signin();

bird.member.bind("order.shipped", (data) => {
  console.log("your order moved", data);
});
```

Delivery is tied to the identity, not to the page: after a reconnect the client signs in again and resubscribes, and while a connection has no identity nothing arrives. Publish with [`bird.realtime.members.send(...)`](https://bird.com/docs/api/reference/send-realtime-app-member-event) from the server SDK.

### Watchlist events

On apps with the `watchlist_events` setting, a signed-in identity whose `member_data` carries a `watchlist` array of member ids is told when those members come online (their first connection signs in) or go offline (their last one leaves). The current status of the whole list arrives right after signin; bind on `bird.member.watchlist`:

```ts
await bird.signin(); // member_data included: {"member_id":"u_1","watchlist":["u_2","u_3"]}

bird.member.watchlist.bind("online", (memberIds) => console.log("online:", memberIds));
bird.member.watchlist.bind("offline", (memberIds) => console.log("offline:", memberIds));
```

The watchlist is part of the signed identity, so your member auth endpoint decides who a member may watch, and re-signing in with a different list is how it changes.

### Client events

On a subscribed private/presence channel you can trigger `client-` events:

```ts
room.trigger("client-typing", { member_id: "42" });
```

### Errors

Everything the SDK throws extends `BirdRealtimeError`; the default authorizer's failures are `RealtimeAuthError` with `endpoint` and `status`.

## Design

- **Modern & tiny.** TypeScript-first, ESM, native `WebSocket` + `fetch`, no runtime dependencies, tree-shakeable.
- **Automatic reconnect** with exponential backoff + jitter, and channels are re-subscribed transparently (with fresh auth) on reconnect.
- **TLS always** for non-loopback hosts; `allowInsecure` is honored only for `localhost` development.

## Channels & events

| Name prefix | Type     | Authorized |
| ----------- | -------- | ---------- |
| _(none)_    | public   | no         |
| `private-`  | private  | yes        |
| `presence-` | presence | yes        |

`signin()` adds a fourth authorized surface: it signs `<connection_id>::member::<member_data>` rather than a channel name, so a presence auth response can never be replayed as a signin.

Lifecycle events you can bind to: `bird:subscription_succeeded`, `bird:subscription_error` (authorizer failures), `bird:connection_count`, and (presence) `bird:member_added` / `bird:member_removed`.

## License

MIT
