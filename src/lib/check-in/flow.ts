import type { CheckInTurn } from "@/lib/ai/check-in";
import { crisisPath } from "@/lib/whats-going-on/flow";
import { type CheckInResponse, showSkipNote } from "./step";
import { type CheckInFlag, type CheckInState, withFlags } from "./stored";

// What the check-in does with each response, as plain functions the screen
// and the eval harness share
export type FlowEffect =
  // A crisis screen. The answer waits there; the crisis screen's "I'm safe
  // right now" brings the patient back to send it again
  | { to: "crisis"; path: string }
  // Every question asked: write the summary, then the medication check
  | { to: "summary" }
  | { to: "stay" };

export function afterAnswer(
  state: CheckInState,
  turns: CheckInTurn[],
  response: CheckInResponse,
): { state: CheckInState; effect: FlowEffect } {
  if (response.result === "crisis") {
    const pending = turns.slice(state.turns.length);
    return {
      state: {
        ...state,
        pending,
        flags: withFlags(state.flags, [{ kind: response.kind, messageId: response.messageId }]),
      },
      effect: { to: "crisis", path: crisisPath(response.kind) },
    };
  }

  const flags = withFlags(
    state.flags,
    response.safetyFlags.map((flag): CheckInFlag => ({ kind: flag.kind, messageId: flag.messageId })),
  );
  const answered = { ...state, turns, flags, pending: undefined };

  if (response.result === "fallback") {
    return { state: { ...answered, form: true, note: null }, effect: { to: "stay" } };
  }

  const withEligibility = withFlags(
    flags,
    response.eligibilityFlags.map((flag) => ({ kind: flag.type, messageId: flag.message_id })),
  );
  const next = { ...answered, flags: withEligibility };
  if (response.status === "stop") return { state: { ...next, stage: "stopped", note: null }, effect: { to: "stay" } };
  if (response.status === "done") return { state: { ...next, note: null }, effect: { to: "summary" } };

  const skipNote = showSkipNote(turns, state.skipNoteShown);
  // The eligibility note already says someone will reach out, so it covers
  // a question we can't answer here too
  const note =
    (response.eligibilityFlags.length > 0 ? "eligibility" : null) ??
    response.inlineNote ??
    (skipNote ? "two_skips" : null);
  return {
    state: { ...next, question: response.question ?? "", note, skipNoteShown: state.skipNoteShown || skipNote },
    effect: { to: "stay" },
  };
}
