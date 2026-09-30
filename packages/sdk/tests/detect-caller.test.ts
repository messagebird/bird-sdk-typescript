import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { detectCallerInfo } from "../src/detect-caller.js";

// Shared cross-language fixtures (clients/caller-detection-cases.json), so this
// SDK's detector stays in lockstep with the CLI and the other SDKs.
const doc = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./caller-detection-cases.json", import.meta.url)),
    "utf8",
  ),
) as {
  cases: {
    name: string;
    env: Record<string, string>;
    want: string;
    source?: string;
    execution?: string;
    model?: string;
    model_source?: string;
  }[];
};

describe("detectCaller golden vectors", () => {
  for (const c of doc.cases) {
    it(c.name, () => {
      expect(detectCallerInfo(c.env).name).toBe(c.want);
      if (c.source)
        expect(detectCallerInfo(c.env)).toEqual({
          model: c.model ?? "",
          modelSource: c.model_source ?? "",
          name: c.want,
          source: c.source,
          execution: c.execution,
        });
    });
  }

  it("returns empty when there is no process.env (browser)", () => {
    const g = globalThis as { process?: unknown };
    const saved = g.process;
    g.process = undefined;
    try {
      expect(detectCallerInfo()).toEqual({
        name: "",
        source: "",
        execution: "unknown",
        model: "",
        modelSource: "",
      });
    } finally {
      g.process = saved;
    }
  });

  it("omits identity and model from browser-polyfilled environment", () => {
    const g = globalThis as { process?: unknown };
    const saved = g.process;
    g.process = { env: { CLAUDECODE: "1", ANTHROPIC_MODEL: "sonnet" } };
    try {
      expect(detectCallerInfo()).toEqual({
        name: "",
        source: "",
        execution: "unknown",
        model: "",
        modelSource: "",
      });
    } finally {
      g.process = saved;
    }
  });
});
