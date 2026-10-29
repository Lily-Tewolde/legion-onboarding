import { runCrisisFlag, type CrisisFlagResult } from "@/lib/ai/crisis-flag";
import { checkWordList, type CrisisKind, type WordListResult } from "./word-list";

// Both crisis layers on one patient message, in parallel. Either layer can
// escalate; neither can clear the other. If the AI flag fails, the word list
// result stands and the failure is logged without the patient's text, so the
// crisis screen isn't shown to everyone whenever the AI is down.
// The kind decides which crisis screen shows (docs/evals.md, section 1).

export type CrisisCheck = {
  crisis: boolean;
  kind: CrisisKind | null;
  wordList: WordListResult;
  aiFlag: CrisisFlagResult;
};

export type CrisisCheckDeps = {
  runFlag: (text: string) => Promise<CrisisFlagResult>;
  logFlagFailure: (failure: string) => void;
};

const defaultDeps: CrisisCheckDeps = {
  runFlag: runCrisisFlag,
  logFlagFailure: (failure) =>
    console.error(`crisis flag failed: ${failure}`),
};

export async function checkMessage(
  text: string,
  deps: CrisisCheckDeps = defaultDeps,
): Promise<CrisisCheck> {
  const wordList = checkWordList(text);
  const aiFlag = await deps.runFlag(text).catch(
    (): CrisisFlagResult => ({ ok: false, failure: "api_error", usage: null }),
  );
  if (!aiFlag.ok) deps.logFlagFailure(aiFlag.failure);

  return {
    crisis: wordList.hit || (aiFlag.ok && aiFlag.crisis),
    kind: combinedKind(wordList, aiFlag),
    wordList,
    aiFlag,
  };
}

// Immediate danger from the word list always stands, so 911 comes first and
// the AI's label can never downgrade it. Otherwise the AI's kind wins when it
// fires, because it's more specific: "I tried to kill myself five years ago"
// hits the word list as self-harm, but the AI can tell it's past risk
function combinedKind(
  wordList: WordListResult,
  aiFlag: CrisisFlagResult,
): CrisisKind | null {
  if (wordList.hit && wordList.kind === "immediate_danger") {
    return "immediate_danger";
  }
  if (aiFlag.ok && aiFlag.crisis) return aiFlag.kind;
  return wordList.hit ? wordList.kind : null;
}
