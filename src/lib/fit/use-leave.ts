"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
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
