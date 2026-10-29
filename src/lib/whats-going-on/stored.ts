import type { ConcernLabel } from "@/data";
import type { Understanding } from "@/lib/ai/whats-going-on";
import { createSessionStore } from "@/lib/session-store";

// Screens 2 and 3, kept in this browser tab only. What the patient typed is
// never stored anywhere else (build brief, section 3)
export type WhatsGoingOnState = {
  text: string;
  chips: ConcernLabel[];
  spoken?: boolean;
  // The one clarifying question, once the AI has asked it
  clarifyingQuestion?: string;
  clarifyingAnswer?: string;
  // "We didn't quite catch that" was already shown once
  retried?: boolean;
  // Said "This is for me" on the someone-else screen
  forThemselves?: boolean;
  // Ticked "I'm safe right now" for this exact text after a crisis screen
  safeText?: string;
  // The simple form, and why it opened
  form?: { reason: "chosen" | "fallback"; conditions: ConcernLabel[]; need?: Understanding["need"] };
  // What screen 3 shows, and the patient's edits to it
  understanding?: Understanding;
  confirmChips?: Understanding["chips"];
  diagnosed?: Understanding["diagnosed"];
};

export const whatsGoingOnStore = createSessionStore<WhatsGoingOnState>("lh_whats_going_on", { text: "", chips: [] });

// Where the crisis screen was reached from, for "I'm safe right now" and the
// free-text line
export type CrisisFrom = { from: "safety_question" | "whats_going_on" };

export const crisisFromStore = createSessionStore<CrisisFrom>("lh_crisis_from", { from: "safety_question" });

// The words the patient said "I'm safe right now" for, so the same words don't
// stop them again. The checks still run, and any new words are checked as usual
export const safeKey = (text: string, answer: string) => `${text}\n${answer}`;
