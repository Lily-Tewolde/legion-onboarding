"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/cx";
import { copy } from "@/copy";

// The portal's tabs: Visit, Inbox and Profile (decided Oct 29). Plain links
// for now; the design pass makes them a bottom tab bar on phones and a
// sidebar on desktop
const TABS = [
  { href: "/visit", label: copy.portal.visit },
  { href: "/visit/inbox", label: copy.portal.inbox },
  { href: "/visit/profile", label: copy.portal.profile },
];

export function PortalTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label={copy.portal.nav} className="pt-4">
      <ul className="flex gap-2 border-b border-line">
        {TABS.map((tab) => {
          const current = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={current ? "page" : undefined}
                className={cx(
                  "focus-ring inline-flex min-h-control-sm items-center rounded-t-md px-3 font-medium",
                  current ? "border-b-2 border-action text-action" : "text-slate hover:text-ink",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
