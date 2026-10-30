"use client";

import Image from "next/image";
import { copy } from "@/copy";
import { track } from "@/lib/analytics/track";

// "Add to calendar" with the Google, Apple and Outlook logos in one row: icons
// only on phones, icon and name on desktop (decided Oct 29), so the name still
// reads there if an icon fails. Each brand's own mark, in public/icons
// (credited in public/photos/CREDITS.md): Outlook's from Microsoft's site,
// Google's and Apple's supplied by Lily (Oct 30). 20px, in step with the
// label. Google is a link; Apple and Outlook download the calendar file

const ICONS: Record<"google" | "apple" | "outlook", string> = {
  google: "/icons/google.png",
  apple: "/icons/apple.png",
  outlook: "/icons/outlook.svg",
};
export function CalendarLinks({ google }: { google: string }) {
  const links = [
    { key: "google", name: copy.booked.google, label: copy.booked.addGoogle, href: google, external: true },
    { key: "apple", name: copy.booked.apple, label: copy.booked.addApple, href: "/api/visit/calendar", external: false },
    { key: "outlook", name: copy.booked.outlook, label: copy.booked.addOutlook, href: "/api/visit/calendar", external: false },
  ] as const;

  return (
      <div className="flex gap-2">
        {links.map((link) => {
            return (
          <a
            key={link.key}
            href={link.href}
            aria-label={link.label}
            {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : { download: "legion-visit.ics" })}
            onClick={() => track("portal.calendar.added", { calendar: link.key })}
            className="focus-ring flex min-h-control-sm flex-1 items-center justify-center gap-2 rounded-field border-[1.5px] border-line-control bg-white px-3 text-body font-semibold text-navy hover:border-action md:flex-none md:justify-start"
          >
            <span aria-hidden="true" className="relative size-5 flex-none">
              <Image src={ICONS[link.key]} alt="" fill unoptimized sizes="20px" className="object-contain" />
            </span>
            <span aria-hidden="true" className="hidden md:inline">
              {link.name}
            </span>
          </a>
        );
      })}
    </div>
  );
}
