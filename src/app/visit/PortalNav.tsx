import Link from "next/link";
import { cx } from "@/components/cx";
import { CalendarNav, Inbox, User } from "@/components/icons";
import { copy } from "@/copy";

// The portal's tabs: a bottom tab bar on phones (icon over label, a bar on top
// of the current tab) and a sidebar list on desktop
const TABS = [
  { id: "visit", href: "/visit", label: copy.portal.visit, Icon: CalendarNav },
  { id: "inbox", href: "/visit/inbox", label: copy.portal.inbox, Icon: Inbox },
  { id: "profile", href: "/visit/profile", label: copy.portal.profile, Icon: User },
] as const;

export function PortalNav({ active, inboxCount }: { active: string; inboxCount: number }) {
  return (
    <nav aria-label={copy.portal.nav} className="border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:border-0 lg:bg-transparent lg:pb-0">
      <ul className="flex lg:flex-col lg:gap-1">
        {TABS.map(({ id, href, label, Icon }) => {
          const on = id === active;
          const count = id === "inbox" ? inboxCount : 0;
          return (
            <li key={id} className="flex-1">
              <Link
                href={href}
                aria-current={on ? "page" : undefined}
                aria-label={count ? copy.portal.inboxCount.replace("{count}", String(count)) : undefined}
                className={cx(
                  "focus-ring relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-label",
                  "lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-field lg:px-4 lg:text-body",
                  on ? "font-bold text-action lg:bg-wash lg:text-ink" : "font-medium text-slate hover:text-navy lg:text-navy",
                )}
              >
                {on && <span aria-hidden="true" className="absolute inset-x-6 top-0 h-[3px] rounded-b-full bg-action lg:hidden" />}
                <span className="relative">
                  <Icon size={24} />
                  {count > 0 && (
                    <span aria-hidden="true" className="absolute -top-1.5 -right-2 flex size-[18px] items-center justify-center rounded-full bg-action text-[11px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </span>
                <span aria-hidden={count ? true : undefined}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
