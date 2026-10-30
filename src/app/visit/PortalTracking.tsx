"use client";

import { type ReactNode, useRef, useState } from "react";
import { ButtonLink } from "@/components/Button";
import { cx } from "@/components/cx";
import { VideoCall } from "@/components/icons";
import { copy } from "@/copy";
import { track, useTrackInView, useTrackOnShow } from "@/lib/analytics/track";

// The portal's events that need the browser: the invite appearing (once per
// visit time, in this tab), a reminder scrolled into view in the inbox, and
// "Join visit"

export function TrackInvite({ slotStart }: { slotStart: string }) {
  useTrackOnShow(() => {
    const key = `lh_invited_${slotStart}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Blocked storage: it may be counted again, which is harmless
    }
    track("portal.intake.invited");
  });
  return null;
}

export function TrackReminderSeen({ hoursBefore }: { hoursBefore: 24 | 1 }) {
  const marker = useRef<HTMLSpanElement>(null);
  useTrackInView(marker, () => track("portal.reminder.viewed", { hours_before: hoursBefore }));
  return <span ref={marker} aria-hidden="true" />;
}

export function JoinVisitLink() {
  return (
    <ButtonLink href="/demo" className="mt-1 w-full" onClick={() => track("portal.visit.joined")}>
      <VideoCall size={20} />
      {copy.inbox.joinVisit}
    </ButtonLink>
  );
}

// A long message shows three lines, then "Show all"
export function ShowAll({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <p className={cx("text-body", !open && "line-clamp-3")}>{children}</p>
      {!open && (
        <button type="button" onClick={() => setOpen(true)} className="focus-ring -ml-1 self-start rounded-lg px-1 text-body font-semibold text-action hover:underline">
          {copy.inbox.showAll}
        </button>
      )}
    </>
  );
}
