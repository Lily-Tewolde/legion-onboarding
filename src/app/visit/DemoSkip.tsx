"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldError } from "@/components/SegmentedControl";
import { cx } from "@/components/cx";
import { copy } from "@/copy";
import type { DemoPoint } from "@/lib/portal/inbox";

// "Demo: skip to 72 hours", then 24 hours and 1 hour: moves the inbox's clock
// so the invite and the reminders arrive. Demo only
export function DemoSkip({ to, className }: { to: DemoPoint; className?: string }) {
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
    <div className={cx("flex flex-col items-end gap-1", className)}>
      <button
        type="button"
        onClick={skip}
        disabled={busy}
        className="focus-ring inline-flex min-h-9 cursor-pointer items-center rounded-full border-[1.5px] border-dashed border-line-control bg-white px-3 text-label font-semibold whitespace-nowrap text-navy hover:border-action disabled:opacity-60"
      >
        {copy.visit.skipTo[to]}
      </button>
      {failed && (
        <div role="alert">
          <FieldError>{copy.common.somethingWentWrong}</FieldError>
        </div>
      )}
    </div>
  );
}
