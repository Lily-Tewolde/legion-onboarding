import "server-only";
import { findProvider } from "@/data";
import { recommend } from "@/lib/provider/recommend";
import type { OnboardingSession } from "./sessions";

// What the provider, checkout and booked screens read from the visitor's
// session. Each step needs the ones before it; a missing one sends the
// visitor back to where it's answered

export type BookingStage = "fit" | "concerns" | "provider" | "details" | "booked";

export function missingFor(session: OnboardingSession | null, needs: BookingStage): string | null {
  if (!session || session.fit_result !== "eligible" || !session.pay_method) return "/join";
  if (needs === "fit") return null;
  if (!session.concern_labels?.length) return "/join/whats-going-on";
  if (needs === "concerns") return null;
  if (!session.provider_id || !session.slot_start) return "/join/provider";
  if (needs === "provider") return null;
  if (!session.person_id || !session.booked_at) return needs === "booked" ? "/join/book" : null;
  return null;
}

export function recommendationFor(session: OnboardingSession, now: Date = new Date()) {
  return recommend(
    (session.concern_labels ?? []) as Parameters<typeof recommend>[0],
    { payMethod: session.pay_method ?? "self_pay", planId: session.plan_id },
    now,
  );
}

// The provider shown as "{full name}, {credential}"
export function providerName(providerId: string): string {
  const provider = findProvider(providerId);
  return provider ? `${provider.fullName}, ${provider.credential}` : "";
}
