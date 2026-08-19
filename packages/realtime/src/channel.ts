import { Emitter } from "./emitter.js";
import {
  CLIENT_EVENT_PREFIX,
  Inbound,
  Outbound,
  SYSTEM,
  UserFacing,
  isInternal,
  type Frame,
} from "./protocol.js";
import { BirdRealtimeError } from "./errors.js";
import type {
  Authorizer,
  ChannelAuthResponse,
  EncryptionProvider,
  Member,
} from "./types.js";

export type SendFn = (frame: Frame) => boolean;

/**
 * The subscribe lifecycle. Every transition happens inside this class, and an
 * async continuation (the authorize round-trip) is validated against a
 * monotonic attempt id — state that moved underneath it invalidates it.
 */
type SubscriptionState =
  "idle" | "authorizing" | "pending" | "subscribed" | "failed";

/**
 * A public channel: no authorization. Subscribe/unsubscribe are driven by the
 * client; the channel decodes lifecycle frames and fans application events out
 * to bindings.
 */
export class Channel extends Emitter {
  #state: SubscriptionState = "idle";
  #attempt = 0;

  constructor(
    readonly name: string,
    protected readonly send: SendFn,
  ) {
    super();
  }

  /** True while the server has this channel subscribed. */
  get subscribed(): boolean {
    return this.#state === "subscribed";
  }

  /** Public channels need no auth. Subclasses return an auth payload. */
  async authorize(_connectionId: string): Promise<ChannelAuthResponse | null> {
    return null;
  }

  /**
   * Drive one subscribe attempt: authorize, then send — unless the state moved
   * while authorize was in flight (reconnect, unsubscribe, a server error), in
   * which case the late continuation is dropped. `stillCurrent` is the
   * client's view (same connection id, channel still registered).
   */
  async startSubscribe(
    connectionId: string,
    stillCurrent: () => boolean,
  ): Promise<void> {
    if (this.#state !== "idle" && this.#state !== "failed") return;
    const attempt = ++this.#attempt;
    this.#state = "authorizing";
    let auth: ChannelAuthResponse | null;
    try {
      auth = await this.authorize(connectionId);
    } catch (err) {
      if (attempt === this.#attempt)
        this.handleSubscriptionError({ error: String(err) });
      return;
    }
    if (attempt !== this.#attempt || !stillCurrent()) return;
    // Only the winning attempt gets to act on its auth payload.
    this.acceptAuth(auth);
    const data: Record<string, unknown> = { channel: this.name };
    if (auth) {
      data.auth = auth.auth;
      if (auth.member_data) data.member_data = auth.member_data;
    }
    this.#state = "pending";
    this.send({ event: Outbound.Subscribe, data });
  }

  /**
   * Hook for the accepted (attempt-validated) auth payload — a stale
   * authorize resolution never reaches it, so subclass state derived from
   * auth can't be clobbered by a late continuation.
   */
  protected acceptAuth(_auth: ChannelAuthResponse | null): void {}

  /**
   * Invalidate any in-flight attempt without emitting: the connection dropped
   * (a reconnect re-subscribes) or a connection-level error arrived (the
   * caller may retry).
   */
  invalidateAttempt(): void {
    this.#attempt += 1;
    if (this.#state !== "subscribed") this.#state = "idle";
  }

  /** Trigger a client event (`client-*`). Requires an active subscription. */
  trigger(event: string, data?: unknown): boolean {
    if (!event.startsWith(CLIENT_EVENT_PREFIX)) {
      throw new BirdRealtimeError(
        `Client events must be prefixed with "${CLIENT_EVENT_PREFIX}"`,
      );
    }
    if (this.#state !== "subscribed") return false;
    return this.send({ event, channel: this.name, data });
  }

  /** Route a frame addressed to this channel. Internal frames are consumed. */
  handleEvent(frame: Frame): void {
    switch (frame.event) {
      case Inbound.SubscriptionSucceeded:
        this.#state = "subscribed";
        this.emit(UserFacing.SubscriptionSucceeded);
        return;
      case Inbound.SubscriptionError:
        // The server does not emit channel-scoped rejections today (they
        // arrive as channel-less bird:error frames — see the client). Handled
        // anyway: if the protocol ever grows one, it must fail the channel,
        // not be swallowed as an unknown internal frame.
        this.handleSubscriptionError(frame.data);
        return;
      case Inbound.ConnectionCount:
        this.emit(UserFacing.ConnectionCount, frame.data);
        return;
      default:
        if (isInternal(frame.event)) return; // handled by subclasses or ignored
        this.emit(frame.event, frame.data);
    }
  }

  /** A failed subscription (authorizer error or server rejection). */
  handleSubscriptionError(data?: unknown): void {
    this.#attempt += 1;
    this.#state = "failed";
    this.emit(UserFacing.SubscriptionError, data);
  }

  reset(): void {
    this.#attempt += 1;
    this.#state = "idle";
  }

  /** Subclass hook so PresenceChannel can mark success with its payload. */
  protected markSubscribed(): void {
    this.#state = "subscribed";
  }
}

/** A private channel: subscription is authorized via the configured authorizer. */
export class PrivateChannel extends Channel {
  constructor(
    name: string,
    send: SendFn,
    protected readonly authorizer: Authorizer,
  ) {
    super(name, send);
  }

  override async authorize(
    connectionId: string,
  ): Promise<ChannelAuthResponse | null> {
    return this.authorizer({ connectionId, channelName: this.name });
  }
}

/** A presence channel: authorized like a private channel, plus member tracking. */
export class PresenceChannel extends PrivateChannel {
  readonly members = new Map<string, Member>();
  #myId: string | null = null;
  #pendingMyId: string | null = null;

  /** The local member's id, known once the subscription succeeds. */
  get myId(): string | null {
    return this.#myId;
  }

  protected override acceptAuth(auth: ChannelAuthResponse | null): void {
    // member_data is the customer-signed identity blob; its member_id is us.
    // Held as pending until the server confirms the subscription. Runs only
    // for the attempt-validated auth, so a stale authorize can't clobber it.
    if (!auth?.member_data) return;
    try {
      const d = JSON.parse(auth.member_data) as {
        member_id?: string | number;
      };
      this.#pendingMyId =
        d.member_id === undefined ? null : String(d.member_id);
    } catch {
      this.#pendingMyId = null; // malformed blob; the server will reject it
    }
  }

  override handleEvent(frame: Frame): void {
    switch (frame.event) {
      case Inbound.SubscriptionSucceeded: {
        this.markSubscribed();
        this.#myId = this.#pendingMyId;
        this.loadMembers(frame.data);
        this.emit(UserFacing.SubscriptionSucceeded, { members: this.members });
        return;
      }
      case Inbound.MemberAdded: {
        const m = this.toMember(frame.data);
        if (m) {
          this.members.set(m.member_id, m);
          this.emit(UserFacing.MemberAdded, m);
        }
        return;
      }
      case Inbound.MemberRemoved: {
        const m = this.toMember(frame.data);
        if (m && this.members.delete(m.member_id))
          this.emit(UserFacing.MemberRemoved, m);
        return;
      }
      default:
        super.handleEvent(frame);
    }
  }

  override handleSubscriptionError(data?: unknown): void {
    this.members.clear();
    this.#myId = null;
    this.#pendingMyId = null;
    super.handleSubscriptionError(data);
  }

  override reset(): void {
    super.reset();
    this.members.clear();
    this.#myId = null;
    this.#pendingMyId = null;
  }

  private loadMembers(data: unknown): void {
    this.members.clear();
    const presence = (
      data as { presence?: { ids?: string[]; hash?: Record<string, unknown> } }
    )?.presence;
    if (!presence?.ids) return;
    for (const id of presence.ids) {
      this.members.set(id, { member_id: id, member_info: presence.hash?.[id] });
    }
  }

  private toMember(data: unknown): Member | null {
    const d = data as
      { member_id?: string | number; member_info?: unknown } | undefined;
    if (!d || d.member_id === undefined) return null;
    return { member_id: String(d.member_id), member_info: d.member_info };
  }
}

/**
 * An end-to-end encrypted channel: authorized like a private channel, with the
 * decryption key riding the auth response as `shared_secret` (derived from a
 * master key only the customer's backend holds — it never reaches Bird).
 * Application events arrive as `{nonce, ciphertext}` envelopes and are
 * decrypted before they reach bindings. An event that fails to open triggers
 * one re-authorization (a rotated master key derives a new shared secret) and
 * is then retried once; an event that still fails is dropped and reported as
 * `bird:decryption_error` — never delivered as ciphertext.
 */
export class EncryptedChannel extends PrivateChannel {
  #key: Uint8Array | null = null;
  #connectionId: string | null = null;
  // Application events decrypt through a serial queue: a re-authorization is
  // async, and without the queue an event arriving behind a rotated-key event
  // would overtake it and emit out of order.
  #queue: Promise<void> = Promise.resolve();

  constructor(
    name: string,
    send: SendFn,
    authorizer: Authorizer,
    private readonly encryption: EncryptionProvider,
  ) {
    super(name, send, authorizer);
  }

  override async authorize(
    connectionId: string,
  ): Promise<ChannelAuthResponse | null> {
    this.#connectionId = connectionId;
    const auth = await super.authorize(connectionId);
    // A missing OR malformed key fails the subscription here: accepting it
    // would subscribe successfully and then drop every event as a
    // decryption_error, hiding the misconfigured auth endpoint.
    if (!auth?.shared_secret || !decodeKey(auth.shared_secret)) {
      throw new BirdRealtimeError(
        `Channel authorization for ${this.name} returned no usable ` +
          '"shared_secret" (expected 32 bytes, base64). An encrypted ' +
          "channel's auth endpoint must return one — the server SDK's " +
          "authorizeChannel does when its realtime config carries the " +
          "encryption master key.",
      );
    }
    return auth;
  }

  protected override acceptAuth(auth: ChannelAuthResponse | null): void {
    if (auth?.shared_secret) {
      this.#key = decodeKey(auth.shared_secret) ?? this.#key;
    }
  }

  /** Client events are not supported on encrypted channels. */
  override trigger(_event: string, _data?: unknown): boolean {
    throw new BirdRealtimeError(
      "Client events are not supported on encrypted channels",
    );
  }

  override handleEvent(frame: Frame): void {
    // Lifecycle frames are plaintext protocol; only application events carry
    // an envelope.
    if (frame.event.startsWith(SYSTEM) || isInternal(frame.event)) {
      super.handleEvent(frame);
      return;
    }
    // Each link catches its own error, so a binding that throws cannot wedge
    // the queue (a rejected link would short-circuit every later event). The
    // error still surfaces like a sync handler's throw would — asynchronously,
    // where window.onerror sees it.
    this.#queue = this.#queue.then(() =>
      this.#decryptAndEmit(frame).catch((err) => {
        setTimeout(() => {
          throw err;
        }, 0);
      }),
    );
  }

  async #decryptAndEmit(frame: Frame): Promise<void> {
    const envelope = this.#envelope(frame.data);
    let plain =
      envelope && this.#key
        ? this.encryption.open(envelope.box, envelope.nonce, this.#key)
        : null;
    if (plain === null && envelope) {
      // A rotated master key derives a new shared secret; one re-authorize
      // picks it up. A second failure means this event predates the rotation
      // (or is garbage) and re-trying cannot help.
      await this.#refreshKey();
      plain = this.#key
        ? this.encryption.open(envelope.box, envelope.nonce, this.#key)
        : null;
    }
    if (plain === null) {
      this.emit(UserFacing.DecryptionError, {
        channel: this.name,
        event: frame.event,
      });
      return;
    }
    this.emit(frame.event, decodePlaintext(plain));
  }

  async #refreshKey(): Promise<void> {
    if (!this.#connectionId) return;
    try {
      const auth = await this.authorizer({
        connectionId: this.#connectionId,
        channelName: this.name,
      });
      if (auth.shared_secret) {
        this.#key = decodeKey(auth.shared_secret) ?? this.#key;
      }
    } catch {
      // The stale key stays; the event is dropped and reported by the caller.
    }
  }

  #envelope(data: unknown): { nonce: Uint8Array; box: Uint8Array } | null {
    const d = data as
      | { nonce?: unknown; ciphertext?: unknown }
      | null
      | undefined;
    if (typeof d?.nonce !== "string" || typeof d?.ciphertext !== "string")
      return null;
    const nonce = decodeBase64(d.nonce);
    const box = decodeBase64(d.ciphertext);
    if (!nonce || nonce.length !== 24 || !box) return null;
    return { nonce, box };
  }
}

/** Decrypted bytes are UTF-8; JSON when possible, else the raw string. */
function decodePlaintext(plain: Uint8Array): unknown {
  const text = new TextDecoder().decode(plain);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function decodeBase64(value: string): Uint8Array | null {
  try {
    const raw = atob(value);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

/** A shared secret is exactly 32 base64 bytes; anything else is unusable. */
function decodeKey(sharedSecret: string): Uint8Array | null {
  const key = decodeBase64(sharedSecret);
  return key?.length === 32 ? key : null;
}

/** Select the channel implementation from the name prefix. */
export function channelFor(
  name: string,
  send: SendFn,
  authorizer: Authorizer,
  encryption?: EncryptionProvider,
): Channel {
  if (name.startsWith("private-encrypted-")) {
    if (!encryption) {
      // Failing loudly here is deliberate: routing this name to a plain
      // private channel would subscribe successfully and hand the caller raw
      // ciphertext.
      throw new BirdRealtimeError(
        `Subscribing to "${name}" requires the encryption provider: ` +
          'import { encryption } from "@messagebird/realtime/encrypted" and ' +
          "pass it as the client's `encryption` option.",
      );
    }
    return new EncryptedChannel(name, send, authorizer, encryption);
  }
  if (name.startsWith("presence-"))
    return new PresenceChannel(name, send, authorizer);
  if (name.startsWith("private-"))
    return new PrivateChannel(name, send, authorizer);
  return new Channel(name, send);
}
