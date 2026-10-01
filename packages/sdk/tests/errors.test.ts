import { describe, it, expect } from "vitest";
import { BirdError, BirdAPIError, BirdAuthError, BirdRateLimitError } from "../src/index.js";
import {
  mapResponseToError,
  parseRetryAfter,
  BirdInternalError,
  BirdPreconditionError,
  BirdValidationError,
  type NextAction,
} from "../src/errors.js";
import {
  ErrorBodySchema,
  NextActionSchema,
} from "../src/generated/schemas.gen.js";

function headers(init?: Record<string, string>): Headers {
  return new Headers(init);
}

describe("mapResponseToError", () => {
  it("maps a typed body to the right class and carries every field", () => {
    const err = mapResponseToError(401, {
      type: "auth_error",
      code: "E10001",
      name: "InvalidApiKey",
      message: "bad key",
      doc_url: "https://bird.com/docs/api/errors/E10001",
      request_id: "req_1",
    });
    expect(err).toBeInstanceOf(BirdAuthError);
    expect(err).toBeInstanceOf(BirdAPIError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("E10001");
    expect(err.type).toBe("auth_error");
    expect(err.errorName).toBe("InvalidApiKey");
    expect(err.docUrl).toBe("https://bird.com/docs/api/errors/E10001");
    expect(err.requestId).toBe("req_1");
    expect(err.message).toBe("bad key");
  });

  it("attaches retryAfter on rate_limit_error from the Retry-After header", () => {
    const err = mapResponseToError(
      429,
      { type: "rate_limit_error", message: "slow down" },
      headers({ "Retry-After": "60" }),
    );
    expect(err).toBeInstanceOf(BirdRateLimitError);
    expect(err).toBeInstanceOf(BirdAPIError);
    expect(err.statusCode).toBe(429);
    expect((err as BirdRateLimitError).retryAfter).toBe(60);
  });

  it("falls back on status when the body carries no type (non-JSON error)", () => {
    const err = mapResponseToError(502, undefined, headers());
    expect(err).toBeInstanceOf(BirdInternalError); // 5xx → internal_error
    expect(err.statusCode).toBe(502);
  });

  it("infers precondition_error for a bare 412/428 (no body type)", () => {
    expect(mapResponseToError(412, undefined, headers())).toBeInstanceOf(
      BirdPreconditionError,
    );
    expect(mapResponseToError(428, undefined, headers())).toBeInstanceOf(
      BirdPreconditionError,
    );
  });

  it("reads requestId from X-Request-Id when the body omits it", () => {
    const err = mapResponseToError(
      500,
      { type: "internal_error" },
      headers({ "X-Request-Id": "req_hdr" }),
    );
    expect(err.requestId).toBe("req_hdr");
  });

  it("returns the BirdAPIError base for an unknown type", () => {
    const err = mapResponseToError(418, {
      type: "teapot_error",
      message: "no coffee",
    });
    expect(err).toBeInstanceOf(BirdAPIError);
    expect(err.constructor.name).toBe("BirdAPIError");
    expect(err).toBeInstanceOf(BirdError);
    expect(err.statusCode).toBe(418);
  });

  it("surfaces remediation and next from the wire (ADR-0073/0124)", () => {
    const next: NextAction[] = [
      {
        kind: "operation",
        description: "Assign a dedicated IP",
        operation: "assignDedicatedIp",
        params: { pool_id: "pool_123" },
      },
      {
        kind: "external",
        description: "Publish the DKIM record at your DNS provider",
        url: "https://example.test/dns",
      },
      { kind: "wait", description: "Verification is in progress" },
    ];
    const err = mapResponseToError(422, {
      type: "validation_error",
      code: "E11005",
      message: "empty pool",
      remediation: "Assign a dedicated IP to the pool, then retry.",
      next,
      details: [{ param: "to[0].email", message: "invalid address" }],
    }) as BirdValidationError;
    expect(err.remediation).toBe(
      "Assign a dedicated IP to the pool, then retry.",
    );
    expect(err.next).toEqual(next);
    expect(err.details).toEqual([
      { param: "to[0].email", message: "invalid address" },
    ]);
    // A step that is not an operation carries none: the facade must not invent one.
    expect(err.next?.[1].operation).toBeUndefined();
    expect(err.next?.[2].operation).toBeUndefined();
    const aliases: Record<string, string> = {
      name: "errorName",
      doc_url: "docUrl",
      request_id: "requestId",
      vendor_code: "vendorCode",
    };
    for (const key of Object.keys(ErrorBodySchema.properties)) {
      expect(err, `ErrorBody wire field '${key}' is unmapped`).toHaveProperty(
        aliases[key] ?? key,
      );
    }
    for (const key of Object.keys(NextActionSchema.properties)) {
      expect(
        err.next?.some((step) => Object.hasOwn(step, key)),
        `NextAction wire field '${key}' is unmapped`,
      ).toBe(true);
    }
  });
});

describe("parseRetryAfter", () => {
  it("returns undefined for an unparseable value", () => {
    expect(parseRetryAfter(headers({ "Retry-After": "soon" }))).toBeUndefined();
  });

  it("parses an HTTP-date into seconds from now", () => {
    const future = new Date(Date.now() + 120_000).toUTCString();
    const value = parseRetryAfter(headers({ "Retry-After": future }));
    expect(value).toBeGreaterThanOrEqual(118);
    expect(value).toBeLessThanOrEqual(120);
  });

  it("a negative Retry-After leaves retryAfter unset on the rate-limit error", () => {
    const err = mapResponseToError(
      429,
      { type: "rate_limit_error" },
      headers({ "Retry-After": "-5" }),
    );
    expect((err as BirdRateLimitError).retryAfter).toBeUndefined();
  });
});
