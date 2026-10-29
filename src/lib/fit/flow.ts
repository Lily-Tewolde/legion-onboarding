import type { ScreenOutReason } from "@/server/sessions";
import type { FitOutcome } from "./rules";

// Where each fit check outcome leads, and the session's current_screen for it

export const SCREEN_OUT_REASONS = [
  "under_18",
  "not_in_texas",
  "medicaid_medicare",
  "hospital_stay",
] as const satisfies readonly ScreenOutReason[];

export const isScreenOutReason = (value: string): value is ScreenOutReason =>
  SCREEN_OUT_REASONS.some((reason) => reason === value);

export function outcomePath(outcome: FitOutcome): string {
  switch (outcome.result) {
    case "crisis":
      return "/help-now";
    case "screened_out":
      return `/join/not-a-fit/${outcome.reason}`;
    case "eligible":
      return "/join/whats-going-on";
  }
}

export function currentScreenFor(outcome: FitOutcome): string {
  switch (outcome.result) {
    case "crisis":
      return "help_now";
    case "screened_out":
      return "not_a_fit";
    case "eligible":
      return "whats_going_on";
  }
}

// "Welcome back" only sends people forward in the flow, never back to a
// screen-out or the crisis screen. Later PRs add their screens here
export const RESUME_PATHS: Record<string, string> = {
  whats_going_on: "/join/whats-going-on",
};

// The booking screens that show progress: "Let's get you care" to "Book your
// visit". "You're booked" is where it ends. To confirm with Lily (PR 3)
export const BOOKING_STEPS = 5;
