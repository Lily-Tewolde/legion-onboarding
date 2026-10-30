import type { ConcernLabel } from "@/data";
import type { FitOutcome } from "@/lib/fit/rules";

// Every event from the build brief (section 5), with its properties typed so
// only fixed values, numbers and booleans can be sent: never anything the
// patient typed or said. Legion's names are kept where the same thing happens.
// portal.visit.rated is Lily's addition (PR 16): the score only.
// portal.fit.submitted fires on every fit outcome, with the reason for a
// screen-out, so screen-outs can come out of the one metric's denominator.
// portal.onboarding.signedIn is the details step for someone who signs in
// instead of saving new details (both Oct 30)

export type LegionPath =
  | "/portal/join"
  | "/portal/join/fit"
  | "/portal/join/conditions"
  | "/portal/join/needs"
  | "/portal/join/match"
  | "/portal/join/patient"
  | "/portal/join/payment";

export type CrisisSource = "safety_question" | "word_list" | "ai_flag";
export type CrisisStep = "fit" | "whats_going_on" | "check_in";
export type AiStep = "whats_going_on" | "check_in" | "check_in_summary";

export type EventProperties = {
  "portal.coverage.shown": { pay_method: "insurance" | "self_pay" };
  "portal.fit.submitted": FitOutcome;
  "portal.fit.screened_out": { reason: Extract<FitOutcome, { result: "screened_out" }>["reason"] };
  "portal.crisis.shown": { source: CrisisSource; kind: string | null; step: CrisisStep };
  "portal.concern.retry_shown": Record<string, never>;
  "portal.someone_else.flagged": Record<string, never>;
  "portal.concern.submitted": { mode: "typed" | "spoken" | "chips" | "mixed" | "form" };
  "portal.concern.confirmed": { corrected: boolean; labels: ConcernLabel[] };
  "portal.provider_selected": { recommended: boolean };
  "portal.provider.reservation.created": Record<string, never>;
  "portal.earlier_time.requested": Record<string, never>;
  "portal.onboarding.userCreated": Record<string, never>;
  "portal.onboarding.signedIn": Record<string, never>;
  "portal.payment.method_added": { simulated: true };
  "portal.appointment.confirmed": { days_to_visit: number };
  "portal.calendar.added": { calendar: "google" | "apple" | "outlook" };
  "portal.visit_page.viewed": Record<string, never>;
  "portal.intake.invited": Record<string, never>;
  "portal.intake.started": Record<string, never>;
  "portal.intake.completed": { questions_answered: number };
  "portal.intake.skipped": Record<string, never>;
  "portal.intake.medications_confirmed": { changed: boolean };
  "portal.intake.stopped": { reason: "under_18" | "crisis" };
  "portal.intake.summary_viewed": { sample: boolean };
  "portal.ai.fallback_used": { step: AiStep; reason: string };
  "portal.reminder.viewed": { hours_before: 24 | 1 };
  "portal.visit.joined": Record<string, never>;
  "portal.visit.completed": { intake_done: boolean };
  "portal.visit.no_show": Record<string, never>;
  "portal.visit.rated": { score: number };
  "portal.help.clicked": { screen: string };
};

export type EventName = keyof EventProperties;

// Fallback reasons are fixed codes from the AI steps, never text
const FALLBACK_REASONS = new Set([
  "visitor_limit",
  "daily_cap",
  "limits_unavailable",
  "refusal",
  "truncated",
  "invalid_output",
  "timeout",
  "api_error",
  "not_understood",
  "slow",
  "network",
]);
export const fallbackReason = (reason: string) => (FALLBACK_REASONS.has(reason) ? reason : "other");

// The help link's screen: the app path with ids and anything after it removed
export const screenOf = (pathname: string) => pathname.replace(/[?#].*$/, "").slice(0, 60);

// Whole days from today to the visit, in Central time
export function daysToVisit(slotStart: string, now: Date = new Date()): number {
  const day = (date: Date) =>
    Date.parse(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(date));
  return Math.round((day(new Date(slotStart)) - day(now)) / 86_400_000);
}
