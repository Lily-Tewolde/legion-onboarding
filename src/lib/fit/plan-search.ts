import { type Plan, plans } from "@/data";

// "I don't see my plan" opens the full plan list with a search (Lily, Oct 29).
// Plain matching, never AI. A plan matches when its name, or a common way of
// writing it, starts with what was typed or appears inside it ("Blue Cross
// Blue Shield of Texas", "Medicare Advantage"). The other ways of writing a
// name only help the search; they're never shown and never add a plan

const OTHER_NAMES: Record<string, string[]> = {
  bcbs: ["BCBS", "Blue Cross", "Blue Shield", "BlueCross"],
  unitedhealthcare: ["United Healthcare", "United Health", "UHC"],
};

const normalise = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const namesOf = (plan: Plan) => [plan.name, ...(OTHER_NAMES[plan.id] ?? [])].map(normalise);

// Every plan for an empty search, in the list's order
export function searchPlans(query: string): Plan[] {
  const typed = normalise(query);
  if (!typed) return plans;
  return plans.filter((plan) => namesOf(plan).some((name) => name.startsWith(typed) || typed.includes(name)));
}
