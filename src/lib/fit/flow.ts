import type { ScreenOutReason } from "@/server/sessions";
import type { FitField, FitOutcome } from "./rules";

// Screen 1 is three steps, so nothing scrolls on a phone: about you, then
// insurance on its own, then the safety and hospital questions. This file
// says where each step and each outcome leads

export const FIT_STEPS = {
  about: { path: "/join", fields: ["dateOfBirth", "inTexas"] },
  insurance: { path: "/join/insurance", fields: ["payMethod", "planId", "medicaidOrMedicare"] },
  health: { path: "/join/safety", fields: ["safety", "hospital"] },
} as const satisfies Record<string, { path: string; fields: readonly FitField[] }>;

export type FitStep = keyof typeof FIT_STEPS;

export const nextStep: Record<FitStep, FitStep | null> = {
  about: "insurance",
  insurance: "health",
  health: null,
};

export const previousStep: Record<FitStep, FitStep | null> = {
  about: null,
  insurance: "about",
  health: "insurance",
};

export const stepOf = (field: FitField): FitStep =>
  (Object.keys(FIT_STEPS) as FitStep[]).find((step) =>
    (FIT_STEPS[step].fields as readonly FitField[]).includes(field),
  ) ?? "about";

export const SCREEN_OUT_REASONS = [
  "under_18",
  "not_in_texas",
  "medicaid_medicare",
  "hospital_stay",
] as const satisfies readonly ScreenOutReason[];

export const isScreenOutReason = (value: string): value is ScreenOutReason =>
  SCREEN_OUT_REASONS.some((reason) => reason === value);

// "Answered by mistake? Go back" returns to the step with that answer
export const goBackPath: Record<ScreenOutReason, string> = {
  under_18: FIT_STEPS.about.path,
  not_in_texas: FIT_STEPS.about.path,
  medicaid_medicare: FIT_STEPS.insurance.path,
  hospital_stay: FIT_STEPS.health.path,
};

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
  your_provider: "/join/provider",
  book: "/join/book",
  booked: "/join/booked",
};
