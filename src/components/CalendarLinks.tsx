"use client";

import { copy } from "@/copy";
import { track } from "@/lib/analytics/track";
import { buttonClasses } from "./Button";

// The three "Add to calendar" links, each tracked with which calendar
export function CalendarLinks({ google }: { google: string }) {
  return (
    <>
      <a
        href={google}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses("text")}
        onClick={() => track("portal.calendar.added", { calendar: "google" })}
      >
        {copy.booked.google}
      </a>
      <a
        href="/api/visit/calendar"
        download="legion-visit.ics"
        className={buttonClasses("text")}
        onClick={() => track("portal.calendar.added", { calendar: "apple" })}
      >
        {copy.booked.apple}
      </a>
      <a
        href="/api/visit/calendar"
        download="legion-visit.ics"
        className={buttonClasses("text")}
        onClick={() => track("portal.calendar.added", { calendar: "outlook" })}
      >
        {copy.booked.outlook}
      </a>
    </>
  );
}
