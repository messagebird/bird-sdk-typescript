import {
  callerRules,
  callerBooleanishSkip,
  callerDefault,
  callerFalseLike,
  callerPublicModels,
  callerModelEnv,
} from "./caller-rules.gen.js";

// Browser runtimes and process polyfills have no local harness environment.
// Identity and execution evidence are telemetry hints, never authorization.
export function detectCallerInfo(env?: Record<string, string | undefined>): {
  model: string;
  modelSource: string;
  name: string;
  source: string;
  execution: string;
} {
  let source = env;
  if (source === undefined) {
    const proc = (
      globalThis as {
        process?: {
          env?: Record<string, string | undefined>;
          versions?: { node?: string };
        };
      }
    ).process;
    if (proc?.versions?.node === undefined)
      return {
        name: "",
        source: "",
        execution: "unknown",
        model: "",
        modelSource: "",
      };
    source = proc.env ?? {};
  }
  for (const rule of callerRules) {
    const value = source[rule.env];
    if (
      value === undefined ||
      value.trim() === "" ||
      callerFalseLike.has(value.trim().toLowerCase()) ||
      (rule.equals !== undefined && value !== rule.equals)
    ) {
      continue;
    }
    const name = rule.passthrough
      ? sanitizeCaller(value)
      : (rule.name as string);
    if (name) {
      const modelEnv = callerModelEnv[name];
      const model = modelEnv ? normalizeModel(source[modelEnv] ?? "") : "";
      return {
        model,
        modelSource: model ? `env:${modelEnv}` : "",
        name,
        source: `env:${rule.env}`,
        execution:
          rule.verification === "verified" ? rule.execution : "unknown",
      };
    }
  }
  return {
    name: callerDefault,
    source: "fallback",
    execution: "unknown",
    model: "",
    modelSource: "",
  };
}

// Lowercases and bounds a passthrough (AGENT=<name>) value the same charset+length
// way as the other Bird-* labels, dropping boolean-ish values that carry no
// harness identity (e.g. OpenCode sets AGENT=1).
function sanitizeCaller(value: string): string {
  const s = value.trim().toLowerCase();
  if (s === "" || s.length > 32 || callerBooleanishSkip.has(s)) return "";
  return /^[a-z0-9._-]+$/.test(s) ? s : "";
}

export function normalizeModel(raw: string): string {
  const model = raw.trim().toLowerCase();
  if (!model) return "";
  return callerPublicModels.has(model) ? model : "other";
}

export function clientEnrichmentDisabled(): boolean {
  const proc = (
    globalThis as {
      process?: {
        env?: Record<string, string | undefined>;
        versions?: { node?: string };
      };
    }
  ).process;
  if (proc?.versions?.node === undefined) return false;
  const env = proc.env ?? {};
  return (
    !!env.DO_NOT_TRACK ||
    env.BIRD_TELEMETRY === "0" ||
    env.BIRD_CLIENT_ENRICHMENT === "0"
  );
}
