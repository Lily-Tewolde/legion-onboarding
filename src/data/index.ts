import {
  addBusinessDays,
  centralToUtc,
  todayInCentral,
} from "@/lib/central-time";
import plansJson from "./plans.json";
import providersJson from "./providers.json";
import slotsJson from "./slots.json";

// Made-up providers, slots and insurance plans. Not in Supabase. Shown on
// screen as "Demo: made-up provider" and "Demo: coverage check simulated".
// Checked when the module loads, so a typo in the JSON fails loudly

// Standard English labels: the starter chips plus one from the golden set.
// Legion's full conditions list is still to confirm with Legion.
// "Not sure" isn't something a provider treats: someone who only picks it is
// matched to the first provider who takes their plan (anyone, if self-pay),
// at the earliest time, so they never land on the no-times screen by accident
export const CONCERN_LABELS = [
  "ADHD",
  "Anxiety",
  "Depression",
  "Sleep",
  "Bipolar disorder",
  "Not sure",
] as const;
export type ConcernLabel = (typeof CONCERN_LABELS)[number];

// Real insurer names from Legion's current flow, as text only. Medicaid and
// Medicare screen out. "I don't see my plan" is an option on screen 1, not a plan
export type Plan = { id: string; name: string; screensOut: boolean };

export type Provider = {
  id: string;
  fullName: string;
  credential: string;
  concerns: ConcernLabel[];
  plans: string[];
};

export type Slot = { providerId: string; start: string };

export const plans: Plan[] = plansJson;

const planIds = new Set(plans.map((plan) => plan.id));

export const providers: Provider[] = providersJson.map((provider) => ({
  ...provider,
  concerns: provider.concerns.map(toConcernLabel),
  plans: provider.plans.map((planId) => {
    if (!planIds.has(planId)) throw new Error(`Unknown plan: ${planId}`);
    return planId;
  }),
}));

const providerIds = new Set(providers.map((provider) => provider.id));

for (const slot of slotsJson) {
  if (!providerIds.has(slot.providerId)) {
    throw new Error(`Slot for an unknown provider: ${slot.providerId}`);
  }
}

export const findPlan = (id: string) => plans.find((plan) => plan.id === id);

export const findProvider = (id: string) =>
  providers.find((provider) => provider.id === id);

// Slots are stored as "this many business days from today, at this Central
// time", so the demo always shows times in the near future. The earliest is
// 3 business days out, as on Lily's walk of Legion's flow (Wednesday Oct 28,
// earliest Monday Nov 2), so the demo doesn't look faster than Legion is.
// Oscar + Sleep has no provider on purpose, to show the no-times screen
export function slotsFor(providerId: string, now: Date = new Date()): Slot[] {
  const today = todayInCentral(now);
  return slotsJson
    .filter((slot) => slot.providerId === providerId)
    .map((slot) => ({
      providerId,
      start: centralToUtc(
        addBusinessDays(today, slot.businessDaysOut),
        slot.time,
      ).toISOString(),
    }))
    .sort((a, b) => a.start.localeCompare(b.start));
}

function toConcernLabel(label: string): ConcernLabel {
  const match = CONCERN_LABELS.find((known) => known === label);
  if (!match) throw new Error(`Unknown concern label: ${label}`);
  return match;
}
