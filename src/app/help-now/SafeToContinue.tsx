"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { copy } from "@/copy";
import { loadAnswers, saveAnswers } from "@/lib/fit/stored-answers";

// "I'm safe right now and want to keep going", on its own at the bottom of the
// crisis screen. Continuing goes back to screen 1 with the answers kept, and
// the other fit rules decide. Answering "Yes" to the safety question again
// shows this screen again. To confirm with Legion's clinical team
export function SafeToContinue() {
  const router = useRouter();
  const [safe, setSafe] = useState(false);
  const [error, setError] = useState(false);

  const onContinue = () => {
    if (!safe) {
      setError(true);
      return;
    }
    saveAnswers({ ...loadAnswers(), safeConfirmed: true });
    router.push("/join");
  };

  return (
    <div className="mt-8 flex flex-col items-start gap-3 border-t border-line pt-8">
      <Checkbox
        label={copy.crisis.safeNow}
        checked={safe}
        onChange={(next) => {
          setSafe(next);
          setError(false);
        }}
        error={error ? copy.crisis.safeNowError : undefined}
      />
      <Button variant="secondary" onClick={onContinue}>
        {copy.common.continue}
      </Button>
    </div>
  );
}
