"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { copy } from "@/copy";
import { resumeAfterSafe } from "@/app/visit/check-in/actions";
import { FIT_STEPS } from "@/lib/fit/flow";
import { getAnswers, saveAnswers } from "@/lib/fit/stored-answers";
import { crisisFromStore, safeKey, whatsGoingOnStore } from "@/lib/whats-going-on/stored";

// "I'm safe right now and want to keep going", with Continue under it (board
// U06), pinned to the bottom of the crisis screen on phones. Continue stays
// off until the box is ticked: the screen is there to slow someone down.
// From the safety question, continuing goes back to that step with the
// answers kept, and the other fit rules decide. From "What's going on?", it goes back with the words
// kept; Continue there carries on, and the crisis check still runs on anything
// new. From the check-in, it goes back and the waiting answer is sent again;
// the clinician still sees the flag. A new crisis shows this screen again. To
// confirm with Legion's clinical team
export function SafeToContinue() {
  const router = useRouter();
  const [safe, setSafe] = useState(false);
  const [busy, setBusy] = useState(false);

  // Next keeps this page alive in the background. Untick the box as it's
  // hidden, so coming back to the crisis screen never finds it already ticked
  useLayoutEffect(
    () => () => {
      setSafe(false);
      setBusy(false);
    },
    [],
  );

  const onContinue = () => {
    if (!safe) return;
    if (crisisFromStore.get().from === "check_in") {
      setBusy(true);
      void resumeAfterSafe()
        .catch((error) => console.error(error))
        .finally(() => router.push("/visit/check-in"));
      return;
    }
    if (crisisFromStore.get().from === "whats_going_on") {
      const words = whatsGoingOnStore.get();
      whatsGoingOnStore.save({ ...words, safeText: safeKey(words.text, words.clarifyingAnswer ?? "") });
      router.push("/join/whats-going-on");
      return;
    }
    saveAnswers({ ...getAnswers(), safeConfirmed: true });
    router.push(FIT_STEPS.health.path);
  };

  return (
    <>
      <Checkbox
        label={<span className="font-semibold text-ink">{copy.crisis.safeNow}</span>}
        checked={safe}
        onChange={setSafe}
      />
      <Button variant="text" onClick={onContinue} disabled={!safe || busy} className="w-full">
        {copy.common.continue}
      </Button>
    </>
  );
}
