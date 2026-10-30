"use client";

import Link from "next/link";
import { ArrowLeft } from "@/components/icons";
import { copy } from "@/copy";

// The check-in's one stepper: one segment per starting question, filled as
// they're answered, with the back arrow to the visit page
export function CheckInStepper({ answered }: { answered: number }) {
  const total = copy.checkIn.questions.length;
  const done = Math.min(answered, total);
  const reader = copy.checkIn.progressReader.replace("{part}", String(Math.min(done + 1, total))).replace("{parts}", String(total));
  return (
    <div className="flex h-9 items-center gap-2">
      <Link
        href="/visit"
        aria-label={copy.common.back}
        className="focus-ring -my-1 -mr-1 -ml-3 flex size-11 flex-none items-center justify-center rounded-full text-action"
      >
        <ArrowLeft size={22} />
      </Link>
      <div
        role="progressbar"
        aria-label={reader}
        aria-valuetext={reader}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className="flex flex-1 gap-1"
      >
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            <span className="seg-fill block h-full rounded-full bg-action" style={{ width: i < done ? "100%" : "0%" }} />
          </span>
        ))}
      </div>
    </div>
  );
}
