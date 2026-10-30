"use client";

import { copy } from "@/copy";
import { track } from "@/lib/analytics/track";
import { ImageIcon } from "./icons";

// "Add to calendar" with the Google, Apple and Outlook logos in one row: icons
// only on phones, icon and name on desktop (decided Oct 29). Logo placeholders
// until Lily adds the logos. Google is a link; Apple and Outlook download the
// calendar file
export function CalendarLinks({ google }: { google: string }) {
  const links = [
    { key: "google", name: copy.booked.google, label: copy.booked.addGoogle, href: google, external: true },
    { key: "apple", name: copy.booked.apple, label: copy.booked.addApple, href: "/api/visit/calendar", external: false },
    { key: "outlook", name: copy.booked.outlook, label: copy.booked.addOutlook, href: "/api/visit/calendar", external: false },
  ] as const;

  return (
    <div className="flex gap-2">
      {links.map((link) => (
        <a
          key={link.key}
          href={link.href}
          aria-label={link.label}
          {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : { download: "legion-visit.ics" })}
          onClick={() => track("portal.calendar.added", { calendar: link.key })}
          className="focus-ring flex min-h-control-sm flex-1 items-center justify-center gap-2 rounded-field border-[1.5px] border-line-control bg-white px-3 text-body font-semibold text-navy hover:border-action md:flex-none md:justify-start"
        >
          <span aria-hidden="true" className="flex size-7 flex-none items-center justify-center rounded-md border border-dashed border-muted-line bg-muted text-line-control">
            <ImageIcon size={14} />
          </span>
          <span aria-hidden="true" className="hidden md:inline">
            {link.name}
          </span>
        </a>
      ))}
    </div>
  );
}
