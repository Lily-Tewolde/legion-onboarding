import { findPlan } from "@/data";
import type { ScreenOutReason } from "@/server/sessions";

// The fit check rules (build brief, section 4). Plain code, unit-tested,
// never AI. Shared by screen 1's steps (to show errors and act on answers)
// and the server (which decides). "today" is a YYYY-MM-DD date in Central time

export type YesNo = "yes" | "no";

export type FitAnswers = {
  dateOfBirth?: string;
  inTexas?: YesNo;
  payMethod?: "insurance" | "self_pay";
  planId?: string;
  // "Do you have Medicaid or Medicare?": asked of self-pay on screen 1, and
  // as a double-check on the confirm screen. Legion doesn't see Medicaid or
  // Medicare patients, "including as self-pay"
  medicaidOrMedicare?: YesNo;
  safety?: YesNo;
  hospital?: YesNo;
  // Ticked "I'm safe right now and want to keep going" on the crisis screen
  safeConfirmed?: boolean;
};

export type FitOutcome =
  | { result: "crisis" }
  | { result: "screened_out"; reason: ScreenOutReason }
  | { result: "eligible" };

export type FitField =
  | "dateOfBirth"
  | "inTexas"
  | "payMethod"
  | "planId"
  | "medicaidOrMedicare"
  | "safety"
  | "hospital";

export type FieldErrors = Partial<
  Record<FitField, "date_of_birth" | "pay_method" | "plan_not_listed" | "required">
>;

// The answer behind "I don't see my plan": not a plan, so it can't pass
export const PLAN_NOT_LISTED = "not_listed";

// Every one-tap answer acts the moment it's tapped, and only by its own rule:
// "Yes" to safety opens the crisis screen; "No" to Texas, Medicaid or
// Medicare (as a plan, or "Yes" to the self-pay question) and "Yes" to the
// hospital question open their screen-out. The date of birth is typed, so it
// waits for Continue, and tapping something else never acts on it
export function tapOutcome(field: FitField, answers: FitAnswers): FitOutcome | null {
  switch (field) {
    case "safety":
      return answers.safety === "yes" && !answers.safeConfirmed ? { result: "crisis" } : null;
    case "inTexas":
      return answers.inTexas === "no" ? { result: "screened_out", reason: "not_in_texas" } : null;
    case "planId":
    case "medicaidOrMedicare":
      return hasMedicaidOrMedicare(answers) ? { result: "screened_out", reason: "medicaid_medicare" } : null;
    case "hospital":
      return answers.hospital === "yes" ? { result: "screened_out", reason: "hospital_stay" } : null;
    default:
      return null;
  }
}

// The rules for whatever has been answered so far, in the order the
// questions are asked, with safety first. Used on each step's Continue, where
// the date of birth is checked too. Null means nothing rules them out yet
export function partialOutcome(answers: FitAnswers, today: string): FitOutcome | null {
  if (answers.safety === "yes" && !answers.safeConfirmed) return { result: "crisis" };

  const dob = parseDateOfBirth(answers.dateOfBirth ?? "");
  if (dob && ageOn(dob, today) < 18) return { result: "screened_out", reason: "under_18" };
  if (answers.inTexas === "no") return { result: "screened_out", reason: "not_in_texas" };
  if (hasMedicaidOrMedicare(answers)) return { result: "screened_out", reason: "medicaid_medicare" };
  if (answers.hospital === "yes") return { result: "screened_out", reason: "hospital_stay" };
  return null;
}

// "Yes" to the question counts however they pay. Screen 1 clears the
// self-pay answer when someone switches to insurance
function hasMedicaidOrMedicare(answers: FitAnswers): boolean {
  if (answers.medicaidOrMedicare === "yes") return true;
  return answers.payMethod === "insurance" && Boolean(findPlan(answers.planId ?? "")?.screensOut);
}

// The whole fit check, on the last step's Continue. Assumes validateFacts
// found no errors
export function evaluateFit(answers: FitAnswers, today: string): FitOutcome {
  return partialOutcome(answers, today) ?? { result: "eligible" };
}

export function validateFacts(answers: FitAnswers, today: string): FieldErrors {
  const errors: FieldErrors = {};
  const dob = parseDateOfBirth(answers.dateOfBirth ?? "");
  if (!dob || !isPlausibleBirthDate(dob, today)) errors.dateOfBirth = "date_of_birth";
  if (!answers.inTexas) errors.inTexas = "required";
  if (!answers.payMethod) errors.payMethod = "pay_method";
  if (answers.payMethod === "insurance") {
    if (answers.planId === PLAN_NOT_LISTED) errors.planId = "plan_not_listed";
    else if (!findPlan(answers.planId ?? "")) errors.planId = "required";
  }
  if (answers.payMethod === "self_pay" && !answers.medicaidOrMedicare) {
    errors.medicaidOrMedicare = "required";
  }
  if (!answers.safety) errors.safety = "required";
  if (!answers.hospital) errors.hospital = "required";
  return errors;
}

// The errors for one step's questions only
export function validateFields(
  fields: readonly FitField[],
  answers: FitAnswers,
  today: string,
): FieldErrors {
  const all = validateFacts(answers, today);
  return Object.fromEntries(fields.flatMap((field) => (all[field] ? [[field, all[field]]] : [])));
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
