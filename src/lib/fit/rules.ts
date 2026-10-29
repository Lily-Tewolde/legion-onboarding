import { findPlan } from "@/data";
import type { ScreenOutReason } from "@/server/sessions";

// The fit check rules (build brief, section 4). Plain code, unit-tested,
// never AI. Shared by screen 1 (to show errors as people answer) and the
// server (which decides). "today" is a YYYY-MM-DD date in Central time

export type YesNo = "yes" | "no";

export type FitAnswers = {
  dateOfBirth?: string;
  inTexas?: YesNo;
  payMethod?: "insurance" | "self_pay";
  planId?: string;
  safety?: YesNo;
  hospital?: YesNo;
  // Ticked "I'm safe right now and want to keep going" on the crisis screen
  safeConfirmed?: boolean;
};

export type FitOutcome =
  | { result: "crisis" }
  | { result: "screened_out"; reason: ScreenOutReason }
  | { result: "eligible" };

export type FieldErrors = Partial<
  Record<"dateOfBirth" | "inTexas" | "payMethod" | "planId" | "safety" | "hospital", "date_of_birth" | "pay_method" | "required">
>;

// The two direct questions act as soon as they're answered "Yes": the
// safety question goes to the crisis screen, the hospital question screens out
export function earlyOutcome(answers: FitAnswers): FitOutcome | null {
  if (answers.safety === "yes" && !answers.safeConfirmed) return { result: "crisis" };
  if (answers.hospital === "yes") return { result: "screened_out", reason: "hospital_stay" };
  return null;
}

export function validateFacts(answers: FitAnswers, today: string): FieldErrors {
  const errors: FieldErrors = {};
  const dob = parseDateOfBirth(answers.dateOfBirth ?? "");
  if (!dob || !isPlausibleBirthDate(dob, today)) errors.dateOfBirth = "date_of_birth";
  if (!answers.inTexas) errors.inTexas = "required";
  if (!answers.payMethod) errors.payMethod = "pay_method";
  if (answers.payMethod === "insurance" && !findPlan(answers.planId ?? "")) {
    errors.planId = "required";
  }
  if (!answers.safety) errors.safety = "required";
  if (!answers.hospital) errors.hospital = "required";
  return errors;
}

// The whole fit check, on Continue. Assumes validateFacts found no errors.
// Order: safety first, then the questions in the order they're asked
export function evaluateFit(answers: FitAnswers, today: string): FitOutcome {
  const early = earlyOutcome(answers);
  if (early?.result === "crisis") return early;

  const dob = parseDateOfBirth(answers.dateOfBirth ?? "");
  if (dob && ageOn(dob, today) < 18) return { result: "screened_out", reason: "under_18" };
  if (answers.inTexas === "no") return { result: "screened_out", reason: "not_in_texas" };
  if (answers.payMethod === "insurance" && findPlan(answers.planId ?? "")?.screensOut) {
    return { result: "screened_out", reason: "medicaid_medicare" };
  }
  if (early) return early;
  return { result: "eligible" };
}

export type DateParts = { year: number; month: number; day: number };

// "MM / DD / YYYY", with or without spaces, slashes or dashes. Null unless
// it's a real calendar date
export function parseDateOfBirth(text: string): DateParts | null {
  const match = text.trim().match(/^(\d{1,2})\s*[/.-]?\s*(\d{1,2})\s*[/.-]?\s*(\d{4})$/);
  if (!match) return null;
  const [month, day, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  const real =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  return real ? { year, month, day } : null;
}

// Whole years old on "today". Someone born on February 29 turns a year
// older on March 1 in years without one
export function ageOn(dob: DateParts, today: string): number {
  const [year, month, day] = today.split("-").map(Number);
  const hadBirthday = month > dob.month || (month === dob.month && day >= dob.day);
  return year - dob.year - (hadBirthday ? 0 : 1);
}

// Not in the future, and not more than 120 years ago
function isPlausibleBirthDate(dob: DateParts, today: string): boolean {
  const age = ageOn(dob, today);
  const born = `${dob.year}-${String(dob.month).padStart(2, "0")}-${String(dob.day).padStart(2, "0")}`;
  return born <= today && age <= 120;
}
