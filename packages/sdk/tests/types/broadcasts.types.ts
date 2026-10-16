import type { BirdClient, EmailBroadcastTestResult } from "../../src/index.js";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;
export type BroadcastTestPublicResult = Assert<
  Equal<
    Awaited<ReturnType<BirdClient["broadcasts"]["test"]>>,
    EmailBroadcastTestResult
  >
>;
