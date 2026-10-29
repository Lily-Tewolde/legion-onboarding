import { costUsd } from "@/lib/ai/prices";
import { MODELS } from "@/lib/ai/models";
import type { Understanding, WhatsGoingOnInput, WhatsGoingOnResult } from "@/lib/ai/whats-going-on";
import type { CrisisCheck } from "@/lib/crisis/check";
import { checkWordList, type CrisisKind } from "@/lib/crisis/word-list";

// One submit of "What's going on?", in the order the build brief sets:
// 1. The word list, on the raw text, before any model sees it
// 2. The AI limits. Over a limit, the step opens as the simple form, but the
//    crisis flag still runs on every bit of free text we accept (Lily, PR 5)
// 3. The crisis flag and the AI step, in parallel. A crisis wins
// Dependencies come in as arguments, so the eval harness can force a slow
// call, a bad output or an over-limit visitor through the same code

export type StepInput = WhatsGoingOnInput & {
  // The patient ticked "I'm safe right now" for this exact text. The checks
  // still run; a crisis just doesn't stop them again for the same words
  afterSafe?: boolean;
};

export type FallbackReason =
  | "visitor_limit"
  | "daily_cap"
  | "limits_unavailable"
  | "refusal"
  | "truncated"
  | "invalid_output"
  | "timeout"
  | "api_error";

export type StepResponse =
  | { result: "crisis"; kind: CrisisKind; source: "word_list" | "ai_flag" }
  | { result: "fallback"; reason: FallbackReason }
  | { result: "understood"; understanding: Understanding };

export type StepDeps = {
  checkMessage: (text: string) => Promise<CrisisCheck>;
  understand: (input: WhatsGoingOnInput) => Promise<WhatsGoingOnResult>;
  checkLimits: () => Promise<{ ok: true } | { ok: false; reason: "visitor_limit" | "daily_cap" }>;
  record: (route: "whats_going_on" | "crisis_flag", costUsd: number) => Promise<void>;
};

export async function runWhatsGoingOnStep(input: StepInput, deps: StepDeps): Promise<StepResponse> {
  const texts = freeTexts(input);

  if (!input.afterSafe) {
    for (const text of texts) {
      const hit = checkWordList(text);
      if (hit.hit) return { result: "crisis", kind: hit.kind, source: "word_list" };
    }
  }

  const limits = await deps
    .checkLimits()
    .catch(() => ({ ok: false, reason: "limits_unavailable" }) as const);

  const [checks, ai] = await Promise.all([
    Promise.all(texts.map((text) => deps.checkMessage(text))),
    limits.ok ? deps.understand(input) : Promise.resolve(null),
  ]);

  await logCosts(checks, ai, deps);

  const crisis = checks.find((check) => check.crisis);
  if (crisis?.kind && !input.afterSafe) {
    return { result: "crisis", kind: crisis.kind, source: crisis.wordList.hit ? "word_list" : "ai_flag" };
  }
  if (!limits.ok) return { result: "fallback", reason: limits.reason };
  if (!ai?.ok) return { result: "fallback", reason: ai?.failure ?? "api_error" };
  return { result: "understood", understanding: ai.understanding };
}

export const freeTexts = (input: { text: string; clarification?: { answer: string } }) =>
  [input.text, input.clarification?.answer ?? ""].filter((text) => text.trim().length > 0);

// Costs only, never text. A failed log never fails the patient's step
async function logCosts(checks: CrisisCheck[], ai: WhatsGoingOnResult | null, deps: StepDeps) {
  const entries: Promise<void>[] = checks.map((check) =>
    deps.record("crisis_flag", check.aiFlag.usage ? costUsd(MODELS.crisisFlag, check.aiFlag.usage) : 0),
  );
  if (ai?.usage && (ai.usage.inputTokens || ai.usage.outputTokens)) {
    entries.push(deps.record("whats_going_on", costUsd(MODELS.steps, ai.usage)));
  }
  await Promise.all(entries.map((entry) => entry.catch((error) => console.error(error))));
}

