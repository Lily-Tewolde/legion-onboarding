"use client";

import { useState } from "react";
import { copy } from "@/copy";
import { forget } from "@/lib/analytics/track";
import { Button } from "./Button";
import { FieldError } from "./SegmentedControl";

// "Start over" at the bottom of Demo controls, so a reviewer can run the flow
// again: a new visitor and session on the server, this tab's answers
// cleared, a new person in PostHog, then a full load of screen 1 so no screen
// Next kept alive still holds the old answers. Demo only
export function StartOver() {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const startOver = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch("/api/demo/start-over", { method: "POST" });
      if (!response.ok) throw new Error(`start over failed: ${response.status}`);
      window.sessionStorage.clear();
      forget();
      // A full load on purpose: router.push would keep the old screens alive
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/join");
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-stretch border-t border-line pt-2">
      <Button variant="text" onClick={startOver} disabled={busy}>
        {copy.demo.startOver}
      </Button>
      {failed && (
        <div role="alert">
          <FieldError>{copy.common.somethingWentWrong}</FieldError>
        </div>
      )}
    </div>
  );
}
