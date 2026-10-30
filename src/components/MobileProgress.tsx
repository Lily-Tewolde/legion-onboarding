"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { copy } from "@/copy";
import type { Phase } from "@/lib/progress";
import { cx } from "./cx";
import { ArrowLeft } from "./icons";
import { PHASE_LABEL, PHASE_ORDER } from "./phase";

// Phones: the back arrow and one bar in four segments, one per phase. The
// current segment fills through its steps, growing from where the last screen
// left it. Screen readers hear "About you, part 2 of 3"

let lastFills: number[] | null = null;

export function fillsFor(phase: Phase, part: number, parts: number): number[] {
  const current = PHASE_ORDER.indexOf(phase);
  return PHASE_ORDER.map((_, i) => (i < current ? 100 : i === current ? Math.round((part / parts) * 100) : 0));
}

export function MobileProgress({ phase, part, parts, back }: { phase: Phase; part: number; parts: number; back?: string }) {
  const fills = fillsFor(phase, part, parts);
  const [shown, setShown] = useState(() => lastFills ?? fills);
  const target = fills.join(",");

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(target.split(",").map(Number)));
    lastFills = target.split(",").map(Number);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  const reader = copy.progress.reader
    .replace("{phase}", PHASE_LABEL[phase])
    .replace("{part}", String(part))
    .replace("{parts}", String(parts));
  const total = Math.round(fills.reduce((a, b) => a + b, 0) / fills.length);

  return (
    <div className="relative z-[1] mx-auto flex h-9 w-full max-w-form items-center gap-2 px-4 md:hidden">
      {back && (
        <Link
          href={back}
          aria-label={copy.common.back}
          className="focus-ring -my-1 -mr-1 -ml-3 flex size-11 flex-none items-center justify-center rounded-full text-action"
        >
          <ArrowLeft size={22} />
        </Link>
      )}
      <div
        role="progressbar"
        aria-label={reader}
        aria-valuetext={reader}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={total}
        className="flex flex-1 gap-1"
      >
        {shown.map((fill, i) => (
          <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            <span className={cx("seg-fill block h-full rounded-full bg-action")} style={{ width: `${fill}%` }} />
          </span>
        ))}
      </div>
    </div>
  );
}

// Desktop: "Back" above the phase label
export function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="focus-ring -ml-2 inline-flex min-h-control-sm items-center gap-1.5 rounded-full px-2 text-body-lg font-semibold text-action hover:text-action-hover"
    >
      <ArrowLeft size={20} />
      {copy.common.back}
    </Link>
  );
}
