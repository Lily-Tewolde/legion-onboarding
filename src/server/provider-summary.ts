import "server-only";
import { copy } from "@/copy";
import { findPlan } from "@/data";
import type { Recommendation } from "@/lib/provider/recommend";
import { concernName } from "@/lib/provider/present";
import type { OnboardingSession } from "./sessions";

// The summary under "Recommended for you": "{plan} providers in Texas for
// {concern}" (decided Oct 29), with the concern in lower case where it's a
// word ("anxiety"), as the diagnosis question names it
export function providerSummary(session: OnboardingSession, result: Recommendation): string {
  const plan = session.pay_method === "insurance" && session.plan_id ? findPlan(session.plan_id)?.name : undefined;
  const concern = result.found && result.recommended.concern ? concernName(result.recommended.concern) : undefined;
  if (plan && concern) return copy.provider.summary.replace("{plan}", plan).replace("{concern}", concern);
  if (plan) return copy.provider.summaryNoConcern.replace("{plan}", plan);
  if (concern) return copy.provider.summarySelfPay.replace("{concern}", concern);
  return copy.provider.summaryAny;
}
