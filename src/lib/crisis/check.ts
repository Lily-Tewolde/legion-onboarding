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

  const flagged = aiFlag.ok && aiFlag.crisis;
  return {
    crisis: wordList.hit || flagged,
    // The AI's kind is more specific (it can tell "happening now" from a
    // past attempt), so it wins when it fires
    kind: flagged ? aiFlag.kind : wordList.hit ? wordList.kind : null,
    wordList,
    aiFlag,
  };
}
