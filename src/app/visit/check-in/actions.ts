import type { CheckInTurn } from "@/lib/ai/check-in";
import { afterAnswer, type FlowEffect } from "@/lib/check-in/flow";
import type { CheckInResponse, SummaryResponse } from "@/lib/check-in/step";
import { type CheckInState, checkInStore } from "@/lib/check-in/stored";
import { crisisFromStore } from "@/lib/whats-going-on/stored";

// The check-in's calls to the server, shared by the check-in screen and the
// crisis screen's "I'm safe right now". They only write to the check-in's
// store; the screens read it from there

const post = async <T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) throw new Error(`${path} failed: ${response.status}`);
  return response.json();
};

const save = (patch: Partial<CheckInState>) => checkInStore.save({ ...checkInStore.get(), ...patch });

// Sends the answers so far (with the new one last, or the simple form's all
// at once) and applies the response
export async function sendTurns(
  turns: CheckInTurn[],
  options: { afterSafe?: boolean; form?: boolean; signal?: AbortSignal } = {},
): Promise<FlowEffect> {
  // Answers already checked earlier in the check-in aren't checked again
  const checkFrom = options.form ? checkInStore.get().turns.length : undefined;
  const response = await post<CheckInResponse>(
    "/api/ai/check-in/next",
    { turns, afterSafe: options.afterSafe ?? false, form: options.form ?? false, checkFrom },
    options.signal,
  );
  const { state, effect } = afterAnswer(checkInStore.get(), turns, response);
  checkInStore.save(state);
  if (effect.to === "crisis") crisisFromStore.save({ from: "check_in" });
  if (effect.to === "summary") await summarizeAndCheck(turns);
  return effect;
}

// "I'm safe right now": the answers waiting behind the crisis screen go again.
// The crisis check still runs on everything new after this
export async function resumeAfterSafe(): Promise<void> {
  const state = checkInStore.get();
  if (!state.pending?.length) return;
  await sendTurns([...state.turns, ...state.pending], { afterSafe: true, form: state.form });
}

// Writes the summary, then the medication check. Without a summary there's
// nothing to check, so the check-in finishes with the answers only
async function summarizeAndCheck(turns: CheckInTurn[]) {
  const response = await post<SummaryResponse>("/api/ai/check-in/summary", { turns }).catch(() => null);
  if (response?.result === "summary") {
    save({ summary: response.summary, stage: "medications" });
    return;
  }
  await finishCheckIn({ summary: null });
}

// Finished: only "done" is saved on the server
export async function finishCheckIn(patch: Partial<CheckInState>) {
  save({ ...patch, stage: "done", note: null });
  await post("/api/visit/check-in-done", {}).catch((error) => console.error(error));
}
