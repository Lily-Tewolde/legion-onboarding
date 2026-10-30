import { type ConcernLabel, type Provider, providers, type Slot, slotsFor } from "@/data";

// The recommended provider (build brief, section 4): plain code, never AI.
// The brief says "the first made-up provider who treats a confirmed concern
// and, if insured, takes the plan; ties broken by the earliest slot". Read as:
// take the patient's concerns in the order they gave them; for the first one
// someone can see them for, recommend whoever has the earliest time (ties go
// to the provider list's order). "Not sure" and "Other" on their own: the
// first provider who takes their plan (anyone, if self-pay) at the earliest
// time, so they never land on the no-times screen by accident (Lily, PR 2).
// The reason line is built from this, never written by the AI

export type PaymentContext = { payMethod: "insurance" | "self_pay"; planId: string | null };

export type Candidate = { provider: Provider; slots: Slot[]; concern: ConcernLabel | null };

export type Recommendation =
  | { found: true; recommended: Candidate; others: Candidate[] }
  | { found: false };

const UNSPECIFIC: ConcernLabel[] = ["Not sure", "Other"];

export function recommend(concerns: ConcernLabel[], payment: PaymentContext, now: Date = new Date()): Recommendation {
  const reachable = providers
    .filter((provider) => payment.payMethod === "self_pay" || (payment.planId !== null && provider.plans.includes(payment.planId)))
    .map((provider) => ({ provider, slots: slotsFor(provider.id, now).filter((slot) => new Date(slot.start) > now) }))
    .filter(({ slots }) => slots.length > 0);

  const specific = concerns.filter((concern) => !UNSPECIFIC.includes(concern));

  // Only "Not sure" or "Other": anyone who takes their plan
  if (specific.length === 0) {
    const ranked = byEarliest(reachable.map((r) => ({ ...r, concern: null })));
    return ranked.length ? { found: true, recommended: ranked[0], others: ranked.slice(1) } : { found: false };
  }

  for (const concern of specific) {
    const treating = byEarliest(
      reachable.filter(({ provider }) => provider.concerns.includes(concern)).map((r) => ({ ...r, concern })),
    );
    if (treating.length > 0) {
      // "See more providers": everyone else who treats any of their concerns
      const others = byEarliest(
        reachable
          .filter(({ provider }) => provider.id !== treating[0].provider.id)
          .map((r) => ({ ...r, concern: specific.find((c) => r.provider.concerns.includes(c)) ?? null }))
          .filter((r) => r.concern !== null),
      );
      return { found: true, recommended: treating[0], others };
    }
  }
  return { found: false };
}

// Earliest first slot first; a stable sort keeps the provider list's order for ties
const byEarliest = (candidates: Candidate[]) =>
  [...candidates].sort((a, b) => a.slots[0].start.localeCompare(b.slots[0].start));
