"use client";

import { useRef } from "react";
import { ButtonLink } from "@/components/Button";
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
    <ButtonLink href="/demo" variant="secondary" className="self-start" onClick={() => track("portal.visit.joined")}>
      {copy.inbox.joinVisit}
    </ButtonLink>
  );
}
