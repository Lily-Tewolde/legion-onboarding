import { copy } from "@/copy";
import { type CheckInFlagType, type CheckInTurn, MAX_QUESTIONS } from "@/lib/ai/check-in";
import type { ClinicianSummary } from "@/lib/ai/check-in-summary";
import type { CrisisKind } from "@/lib/crisis/word-list";
import { createSessionStore } from "@/lib/session-store";

// The pre-visit check-in, kept in this browser tab only, so the clinician view
// works on the same device (flow map, screen 10). The answers and the summary
// never reach Supabase; only "check-in done" does

// The AI check-in's questions, plus the simple form's six if it switched part way
export const MAX_TURNS = MAX_QUESTIONS + copy.checkIn.questions.length;

// A flag for the clinician, never shown to the patient: a crisis kind from the
// crisis layers, or an eligibility surprise from the AI, with the answer it
// came from
export type CheckInFlag = { kind: CrisisKind | CheckInFlagType; messageId: string };

export type InlineNote = "cannot_answer" | "medication_question" | "eligibility" | "two_skips";

export type CheckInState = {
  stage: "questions" | "medications" | "done" | "stopped";
  // The simple form, after the AI failed or a limit was reached
  form: boolean;
  turns: CheckInTurn[];
  question: string;
  note: InlineNote | null;
  skipNoteShown: boolean;
  // Answers waiting behind a crisis screen (one, or the simple form's), sent
  // again after "I'm safe right now"
  pending?: CheckInTurn[];
  flags: CheckInFlag[];
  // Null when the summary couldn't be written: the clinician sees the answers
  summary?: ClinicianSummary | null;
  medicationsChanged?: boolean;
  provider: string;
};

export const emptyCheckIn = (provider = ""): CheckInState => ({
  stage: "questions",
  form: false,
  turns: [],
  question: copy.checkIn.questions[0],
  note: null,
  skipNoteShown: false,
  flags: [],
  provider,
});

export const checkInStore = createSessionStore<CheckInState>("lh_check_in", emptyCheckIn());

// Adds flags, once per kind and answer
export const withFlags = (flags: CheckInFlag[], added: CheckInFlag[]): CheckInFlag[] => [
  ...flags,
  ...added.filter((flag) => !flags.some((f) => f.kind === flag.kind && f.messageId === flag.messageId)),
];

export const nextMessageId = (turns: CheckInTurn[]) => `m${turns.length + 1}`;
