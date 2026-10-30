import { copy } from "@/copy";
import type { ConcernLabel } from "@/data";
import { visitDate, visitDay, visitTime } from "@/lib/visit-time";
import type { Candidate } from "./recommend";

// The words screen 4 and the checkout show for a provider and a time, built
// from the made-up data, never written by the AI

export type SlotOption = { start: string; label: string; day: string; time: string };

export type ProviderOption = {
  id: string;
  name: string;
  // "treats anxiety", or empty for "Not sure" and "Other"
  treats: string;
  reason: string;
  slots: SlotOption[];
};

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);

export const concernName = (label: ConcernLabel) =>
  (copy.confirm.diagnosisNames as Partial<Record<ConcernLabel, string>>)[label] ?? copy.conditions[label];

export const slotOption = (start: string): SlotOption => {
  const values = { day: visitDay(start), date: visitDate(start), time: visitTime(start) };
  return { start, label: fill(copy.provider.slot, values), day: values.day, time: values.time };
};

export function providerOption(candidate: Candidate, payMethod: "insurance" | "self_pay"): ProviderOption {
  const { provider, slots, concern } = candidate;
  const name = `${provider.fullName}, ${provider.credential}`;
  const treats = concern ? fill(copy.provider.treats, { concern: concernName(concern) }) : "";
  const facts = [
    treats,
    payMethod === "insurance" ? copy.provider.takesPlan : "",
    fill(copy.provider.available, { day: visitDay(slots[0].start) }),
  ].filter(Boolean);
  return {
    id: provider.id,
    name,
    treats,
    reason: fill(copy.provider.reason, { name: provider.fullName, credential: provider.credential, facts: facts.join(" · ") }),
    slots: slots.map((slot) => slotOption(slot.start)),
  };
}

export const visitLine = (start: string, provider: string) =>
  fill(copy.checkout.visitLine, { day: visitDay(start), date: visitDate(start), time: visitTime(start), provider });

export const bookLabel = (slot: SlotOption) => fill(copy.provider.book, { day: slot.day, time: slot.time });
