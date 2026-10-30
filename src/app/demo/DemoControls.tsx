"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { copy } from "@/copy";
import { track } from "@/lib/analytics/track";

// "Mark visit completed" and "Mark no-show". Either can be changed afterwards,
// since it's a demo
type Outcome = "completed" | "no_show";

export function DemoControls({ intakeDone }: { intakeDone: boolean }) {
  const router = useRouter();
  const [marked, setMarked] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // Next keeps this page alive; clear the last confirmation when it's hidden
  useLayoutEffect(
    () => () => {
      setMarked(null);
      setBusy(false);
      setFailed(false);
    },
    [],
  );

  const mark = async (outcome: Outcome) => {
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch("/api/demo/outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      });
      if (!response.ok) throw new Error(`outcome failed: ${response.status}`);
      // The north-star event, with whether the check-in was done
      if (outcome === "completed") track("portal.visit.completed", { intake_done: intakeDone });
      else track("portal.visit.no_show");
      setMarked(outcome);
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <Button onClick={() => mark("completed")} disabled={busy}>
        {copy.demo.markCompleted}
      </Button>
      <Button variant="text" onClick={() => mark("no_show")} disabled={busy}>
        {copy.demo.markNoShow}
      </Button>
      <p role="status" className="font-medium">
        {marked === "completed" && copy.demo.markedCompleted}
        {marked === "no_show" && copy.demo.markedNoShow}
      </p>
      {failed && (
        <p role="alert" className="text-error">
          {copy.common.somethingWentWrong}
        </p>
      )}
      {marked && (
        <ButtonLink href="/visit" variant="secondary">
          {copy.booked.goToVisit}
        </ButtonLink>
      )}
      <ButtonLink href="/clinician" variant="text">
        {copy.clinician.openClinician}
      </ButtonLink>
    </div>
  );
}
