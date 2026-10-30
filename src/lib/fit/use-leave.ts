"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { track } from "@/lib/analytics/track";
import { crisisFromStore } from "@/lib/whats-going-on/stored";
import { outcomePath } from "./flow";
import type { FitAnswers, FitOutcome, TapField } from "./rules";

// A fit rule ruled someone out: go straight to the screen-out or the crisis
// screen, and save it in the background so the screen never waits. A tap
// sends which question it was, so the server records the same outcome.
// Used by screen 1 and the confirm screen's double-checks
export function useLeave() {
  const router = useRouter();
  return useCallback(
    (outcome: FitOutcome, answers: FitAnswers, field?: TapField) => {
      if (outcome.result === "crisis") crisisFromStore.save({ from: "safety_question" });
      trackFitOutcome(outcome);
      fetch("/api/join/fit", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(field ? { mode: "tap", field, answers } : { mode: "outcome", answers }),
      }).catch(() => {});
      router.push(outcomePath(outcome));
    },
    [router],
  );
}

// Every fit outcome, wherever it's reached: a one-tap answer, a step's
// Continue, the last step, or a double-check on confirm. portal.fit.submitted
// carries the result, with the reason for a screen-out, so screen-outs can
// come out of the one metric's denominator. A double-check on confirm can
// send a second one; the last one is the person's outcome
export function trackFitOutcome(outcome: FitOutcome) {
  track("portal.fit.submitted", outcome);
  if (outcome.result === "screened_out") track("portal.fit.screened_out", { reason: outcome.reason });
  if (outcome.result === "crisis") track("portal.crisis.shown", { source: "safety_question", kind: null, step: "fit" });
}
