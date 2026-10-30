"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { copy } from "@/copy";
import type { DemoPoint } from "@/lib/portal/inbox";

// "Demo: skip to 72 hours", then 24 hours and 1 hour: moves the inbox's clock
// so the invite and the reminders arrive. Demo only
export function DemoSkip({ to }: { to: DemoPoint }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const skip = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch("/api/demo/clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });
      if (!response.ok) throw new Error(`clock failed: ${response.status}`);
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant="text" onClick={skip} disabled={busy}>
        {copy.visit.skipTo[to]}
      </Button>
      {failed && (
        <p role="alert" className="text-error">
          {copy.common.somethingWentWrong}
        </p>
      )}
    </div>
  );
}
