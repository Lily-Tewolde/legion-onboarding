import type { ConcernLabel } from "@/data";
import type { EligibilityFlagType, Understanding } from "@/lib/ai/whats-going-on";
import type { CrisisKind } from "@/lib/crisis/word-list";
import type { FallbackReason, StepResponse } from "./step";

// What screen 2 does with each response, as plain functions the screen and
// the eval harness share

export type NextAction =
  | { to: "crisis"; path: string }
  | { to: "form"; reason: FallbackReason | "not_understood" }
  | { to: "retry" }
  | { to: "clarify"; question: string }
  | { to: "someone_else" }
  | { to: "confirm"; understanding: Understanding };

export type FlowState = {
  // "We didn't quite catch that" was already shown once
  retried: boolean;
  // The patient said "This is for me" on the someone-else screen
  forThemselves: boolean;
};

export function nextAction(response: StepResponse, state: FlowState): NextAction {
  if (response.result === "crisis") return { to: "crisis", path: crisisPath(response.kind) };
  if (response.result === "fallback") return { to: "form", reason: response.reason };

  const { understanding } = response;
  switch (understanding.status) {
    case "not_understood":
      return state.retried ? { to: "form", reason: "not_understood" } : { to: "retry" };
    case "clarify":
      return { to: "clarify", question: understanding.clarifying_question ?? "" };
    case "eligibility_check":
    case "ok": {
      const someoneElse = understanding.eligibility_flags.some((flag) => flag.type === "someone_else");
      return someoneElse && !state.forThemselves ? { to: "someone_else" } : { to: "confirm", understanding };
    }
  }
}

// The crisis screen's version for each kind: immediate danger shows 911
// first, being hurt by someone else shows safety resources, and every other
// kind (including past risk) shows the main crisis screen
export type CrisisScreen = "immediate_danger" | "being_harmed" | "default";

export function crisisScreenFor(kind: CrisisKind): CrisisScreen {
  if (kind === "immediate_danger") return "immediate_danger";
  if (kind === "being_harmed") return "being_harmed";
  return "default";
}

export const crisisPath = (kind: CrisisKind) =>
  `/help-now?screen=${crisisScreenFor(kind)}&from=whats-going-on`;

// The confirm screen asks "Have you been diagnosed with this?" when we don't
// know, for example when only a chip was tapped. Not for "Not sure" or "Other"
export const needsDiagnosisRow = (understanding: Understanding) =>
  understanding.diagnosed === "not_sure" &&
  understanding.concerns.some((concern) => concern.label !== "Not sure" && concern.label !== "Other");

// One small double-check row on the confirm screen for each eligibility
// surprise. Someone else has its own screen instead
export type RecheckType = Exclude<EligibilityFlagType, "someone_else">;

export const recheckRows = (understanding: Understanding): RecheckType[] => [
  ...new Set(
    understanding.eligibility_flags
      .map((flag) => flag.type)
      .filter((type): type is RecheckType => type !== "someone_else"),
  ),
];

// Starter chips: "Not sure" is never alongside a specific chip. Tapping it
// clears the others, and tapping a specific one clears it (golden-set Y-07)
export function toggleChip(selected: ConcernLabel[], label: ConcernLabel): ConcernLabel[] {
  if (selected.includes(label)) return selected.filter((chip) => chip !== label);
  if (label === "Not sure") return ["Not sure"];
  return [...selected.filter((chip) => chip !== "Not sure"), label];
}

// A slow answer: "Still working on it…" at 5 seconds, the simple form offered
// at 10. Never switched to the form automatically while it's still coming
export type SlowStage = "waiting" | "still_working" | "offer_form";

export const slowStage = (elapsedMs: number): SlowStage =>
  elapsedMs >= 10_000 ? "offer_form" : elapsedMs >= 5_000 ? "still_working" : "waiting";
