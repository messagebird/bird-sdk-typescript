import { BirdError } from "../errors.js";

export type RequestPresenceStep =
  | { readonly kind: "property"; readonly key: string }
  | { readonly kind: "items" }
  | { readonly kind: "values" };

export interface RequestPresenceRule {
  readonly method: string;
  readonly url: string;
  readonly operation: string;
  readonly schema: string;
  readonly field: string;
  readonly source: string;
  readonly path: string;
  readonly steps: readonly RequestPresenceStep[];
}

// Internal so validation failures survive the lifecycle and .safe() without
// becoming retryable connection errors or widening the public error exports.
export class RequestPresenceError extends BirdError {
  readonly operation: string;
  readonly schema: string;
  readonly field: string;
  readonly source: string;
  readonly path: string;
  readonly pointer: string;

  constructor(rule: RequestPresenceRule, pointer: readonly string[]) {
    const location =
      "/" +
      pointer
        .map((part) => part.replaceAll("~", "~0").replaceAll("/", "~1"))
        .join("/");
    super(
      `${rule.schema}.${rule.field} is required for ${rule.operation} (${rule.source}; ${location}); send null or a value.`,
    );
    this.name = "RequestPresenceError";
    this.operation = rule.operation;
    this.schema = rule.schema;
    this.field = rule.field;
    this.source = rule.source;
    this.path = rule.path;
    this.pointer = location;
  }
}

// Rules are emitted from the canonical manifest and resolved catalog. This
// traversal knows only property/container steps, never schema presence rules.
export function createRequestPresenceValidator(
  rules: readonly RequestPresenceRule[],
): (options: unknown) => Promise<unknown> {
  const byRequest = new Map<string, RequestPresenceRule[]>();
  for (const rule of rules) {
    const key = `${rule.method} ${rule.url}`;
    const bucket = byRequest.get(key) ?? [];
    bucket.push(rule);
    byRequest.set(key, bucket);
  }
  return async (options: unknown): Promise<unknown> => {
    if (options === null || typeof options !== "object") return options;
    const request = options as {
      method?: unknown;
      url?: unknown;
      body?: unknown;
    };
    if (typeof request.method !== "string" || typeof request.url !== "string")
      return options;
    for (const rule of byRequest.get(
      `${request.method.toUpperCase()} ${request.url}`,
    ) ?? []) {
      visit(rule, request.body, 0, []);
    }
    return options;
  };
}

function visit(
  rule: RequestPresenceRule,
  node: unknown,
  index: number,
  pointer: readonly string[],
): void {
  const step = rule.steps[index];
  if (!step)
    throw new Error(
      `Invalid generated presence path for ${rule.operation}: ${rule.path}`,
    );
  // An absent/null containing object has no child property to supply. Optional
  // ancestors must not make their required children optional when they exist.
  if (pointer.length > 0 && (node === undefined || node === null)) return;
  if (step.kind === "items") {
    if (!Array.isArray(node)) throw new RequestPresenceError(rule, pointer);
    for (let i = 0; i < node.length; i++)
      visit(rule, node[i], index + 1, [...pointer, String(i)]);
    return;
  }
  if (node === null || typeof node !== "object" || Array.isArray(node))
    throw new RequestPresenceError(rule, pointer);
  if (step.kind === "values") {
    for (const [key, value] of Object.entries(node))
      visit(rule, value, index + 1, [...pointer, key]);
    return;
  }
  const object = node as Record<string, unknown>;
  const next = [...pointer, step.key];
  const present =
    Object.hasOwn(object, step.key) && object[step.key] !== undefined;
  if (index === rule.steps.length - 1) {
    if (!present) throw new RequestPresenceError(rule, next);
    return; // Explicit null is admitted for every generated leaf rule.
  }
  if (present) visit(rule, object[step.key], index + 1, next);
}
