"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { Tag } from "@/components/Tag";
import { copy } from "@/copy";

// "Reschedule" and "Cancel visit" as text-style buttons (decided Oct 29).
// Reschedule opens the provider screen; a new time is booked straight away.
// Cancel asks first and shows Legion's policy, since a late cancel has a fee
export function VisitActions() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // Next keeps this page alive; start closed when it's shown again
  useLayoutEffect(
    () => () => {
      setChecking(false);
      setBusy(false);
      setFailed(false);
    },
    [],
  );

  const cancel = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch("/api/visit/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) throw new Error(`cancel failed: ${response.status}`);
      const { path } = await response.json();
      router.push(path);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <ButtonLink href="/join/provider" variant="text">
        {copy.visit.reschedule}
      </ButtonLink>
      <Button variant="text" aria-expanded={checking} aria-controls="cancel-check" onClick={() => setChecking(!checking)}>
        {copy.visit.cancel}
      </Button>
      {checking && (
        <div id="cancel-check" className="flex flex-col items-start gap-3 rounded-lg border border-line p-4">
          <p className="font-medium">{copy.visit.cancelCheck}</p>
          <p>{copy.checkout.cancelPolicy}</p>
          <Tag>{copy.common.fromLegion}</Tag>
          <Button variant="secondary" onClick={cancel} disabled={busy}>
            {copy.visit.cancelYes}
          </Button>
          <Button variant="text" onClick={() => setChecking(false)}>
            {copy.visit.keep}
          </Button>
          {failed && (
            <p role="alert" className="text-error">
              {copy.common.somethingWentWrong}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
