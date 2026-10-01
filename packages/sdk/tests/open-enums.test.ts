import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("open enum field types", () => {
  // The literals are what an editor completes; `(string & {})` is what keeps the
  // union from collapsing back to plain `string` and erasing them. A naive
  // `| string` type-checks identically to this one, so only the generated text can
  // tell the two apart — hence the source assertion rather than a type assertion.
  it("keeps the literals alongside an open catch-all", () => {
    const types = readFileSync("src/generated/types.gen.ts", "utf8");
    const decl = types.match(/export type EmailEventType =([^;]*);/)?.[1];
    expect(decl, "EmailEventType declaration").toBeDefined();
    expect(decl).toContain('"email.bounced"');
    expect(decl).toContain("(string & {})");
    expect(decl, "a bare `| string` member would erase every literal").not.toMatch(
      /\|\s*string\s*(\||;|$)/,
    );
  });
});
