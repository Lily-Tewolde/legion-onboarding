import { type CheckInTurn, MAX_QUESTIONS, type NextQuestion, type NextQuestionResult } from "@/lib/ai/check-in";
import type { ClinicianSummary, SummaryResult } from "@/lib/ai/check-in-summary";
import { MODELS } from "@/lib/ai/models";
import { costUsd } from "@/lib/ai/prices";
import type { CrisisCheck } from "@/lib/crisis/check";
import { checkWordList, type CrisisKind } from "@/lib/crisis/word-list";
import type { FallbackReason } from "@/lib/whats-going-on/step";

// One answer in the pre-visit check-in, in the same order as "What's going
// on?": the word list on the raw answer before any model sees it, then the AI
// limits, then the crisis flag and the next question in parallel. A crisis
// wins. The crisis check stays on after "I'm safe right now": every new answer
// is checked, and only the answer they said it for doesn't stop them again
// (golden-set C-14). Dependencies come in as arguments, so the eval harness
// runs the same code

export type CheckInRoute = "check_in" | "check_in_summary" | "crisis_flag";

export type CheckInDeps = {
  checkMessage: (text: string) => Promise<CrisisCheck>;
  nextQuestion: (turns: CheckInTurn[]) => Promise<NextQuestionResult>;
  checkLimits: () => Promise<{ ok: true } | { ok: false; reason: "visitor_limit" | "daily_cap" }>;
  record: (route: CheckInRoute, costUsd: number) => Promise<void>;
};

// A crisis kind for the clinician, with the answer it came from
export type SafetyFlag = { kind: CrisisKind; messageId: string };

export type CheckInResponse =
  | { result: "crisis"; kind: CrisisKind; source: "word_list" | "ai_flag"; messageId: string }
  | { result: "fallback"; reason: FallbackReason; safetyFlags: SafetyFlag[] }
  | ({ result: "next"; safetyFlags: SafetyFlag[] } & NextQuestion);

const DONE: NextQuestion = { status: "done", question: null, inlineNote: null, eligibilityFlags: [] };

// In the AI check-in, only the latest answer is new. The simple form sends
// all its answers at once (form: true), after any the AI check-in already
// checked (from checkFrom on): each new one is checked, and nothing goes to
// the AI step
export async function runCheckInTurn(
  input: { turns: CheckInTurn[]; afterSafe?: boolean; form?: boolean; checkFrom?: number },
  deps: CheckInDeps,
): Promise<CheckInResponse> {
  const newTurns = input.form ? input.turns.slice(input.checkFrom ?? 0) : input.turns.slice(-1);
  const fresh = newTurns.filter((turn) => !turn.skipped && turn.answer.trim());

  if (!input.afterSafe) {
    for (const turn of fresh) {
      const hit = checkWordList(turn.answer);
      if (hit.hit) return { result: "crisis", kind: hit.kind, source: "word_list", messageId: turn.id };
    }
  }

  const needsAi = !input.form && input.turns.length < MAX_QUESTIONS;
  const limits = needsAi
    ? await deps.checkLimits().catch(() => ({ ok: false, reason: "limits_unavailable" }) as const)
    : ({ ok: true } as const);

  const [checks, ai] = await Promise.all([
    Promise.all(fresh.map(async (turn) => ({ turn, check: await deps.checkMessage(turn.answer) }))),
    limits.ok && needsAi ? deps.nextQuestion(input.turns) : Promise.resolve(null),
  ]);

  await logCosts(
    checks.map(({ check }) => check),
    ai,
    deps,
  );

  // Kept for the clinician even after "I'm safe right now"
  const safetyFlags = checks.flatMap(({ turn, check }) =>
    check.crisis && check.kind ? [{ kind: check.kind, messageId: turn.id }] : [],
  );
  const crisis = checks.find(({ check }) => check.crisis && check.kind);
  if (crisis?.check.kind && !input.afterSafe) {
    return {
      result: "crisis",
      kind: crisis.check.kind,
      source: crisis.check.wordList.hit ? "word_list" : "ai_flag",
      messageId: crisis.turn.id,
    };
  }
  if (!needsAi) return { result: "next", safetyFlags, ...DONE };
  if (!limits.ok) return { result: "fallback", reason: limits.reason, safetyFlags };
  if (!ai?.ok) return { result: "fallback", reason: ai?.failure ?? "api_error", safetyFlags };
  return { result: "next", safetyFlags, ...ai.next };
}

// Costs only, never text. A failed log never fails the patient's step
async function logCosts(checks: CrisisCheck[], ai: NextQuestionResult | null, deps: CheckInDeps) {
  const entries: Promise<void>[] = checks.map((check) =>
    deps.record("crisis_flag", check.aiFlag.usage ? costUsd(MODELS.crisisFlag, check.aiFlag.usage) : 0),
  );
  if (ai?.usage) entries.push(deps.record("check_in", costUsd(MODELS.steps, ai.usage)));
  await Promise.all(entries.map((entry) => entry.catch((error) => console.error(error))));
}

// The summary at the end. Over a limit, or if the AI fails, the clinician
// view shows the answers without a summary
export type SummaryDeps = {
  summarize: (turns: CheckInTurn[]) => Promise<SummaryResult>;
  checkLimits: CheckInDeps["checkLimits"];
  record: CheckInDeps["record"];
};

export type SummaryResponse =
  | { result: "summary"; summary: ClinicianSummary }
  | { result: "fallback"; reason: FallbackReason };

export async function runSummary(turns: CheckInTurn[], deps: SummaryDeps): Promise<SummaryResponse> {
  const limits = await deps.checkLimits().catch(() => ({ ok: false, reason: "limits_unavailable" }) as const);
  if (!limits.ok) return { result: "fallback", reason: limits.reason };
  const ai = await deps.summarize(turns);
  if (ai.usage && (ai.usage.inputTokens || ai.usage.outputTokens)) {
    await deps.record("check_in_summary", costUsd(MODELS.steps, ai.usage)).catch((error) => console.error(error));
  }
  return ai.ok ? { result: "summary", summary: ai.summary } : { result: "fallback", reason: ai.failure };
}

// "That's okay…" after two skips in a row, shown once (golden-set I-03)
export const showSkipNote = (turns: { skipped: boolean }[], alreadyShown: boolean) =>
  !alreadyShown && turns.length >= 2 && turns.slice(-2).every((turn) => turn.skipped);
