import type { ReactNode } from "react";
import { cx } from "@/components/cx";
import { PageTitle } from "@/components/Screen";
import { PortalNav } from "./PortalNav";

// The portal's layout (Claude Design's PortalNav): Visit, Inbox and Profile as
// a bottom tab bar on phones and a left sidebar on desktop (decided Oct 29).
// The title row holds the demo controls button on phones
export function PortalScreen({
  active,
  title,
  demo,
  inboxCount,
  children,
  wide = false,
}: {
  active: "visit" | "inbox" | "profile";
  title: string;
  demo?: ReactNode;
  inboxCount: number;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="screen relative flex flex-1 flex-col overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-14 -right-[230px] z-0 size-[360px] rounded-full bg-[radial-gradient(closest-side,#e9effc,rgba(233,239,252,0))] md:-right-[220px] md:size-[720px]"
      />
      <div className="relative z-[1] mx-auto flex w-full max-w-shell flex-1 gap-8 md:px-8 md:py-6">
        <div className="hidden w-52 flex-none lg:block">
          <PortalNav active={active} inboxCount={inboxCount} />
        </div>
        <main className={cx("screen-body flex w-full flex-1 flex-col gap-3 px-4 pt-3 pb-4 md:mx-auto md:gap-4 md:px-0 lg:mx-0", wide ? "max-w-wide" : "max-w-form")}>
          <div className="flex items-center justify-between gap-3">
            <PageTitle>{title}</PageTitle>
            {demo}
          </div>
          {children}
        </main>
      </div>
      <div className="sticky bottom-0 z-20 lg:hidden">
        <PortalNav active={active} inboxCount={inboxCount} />
      </div>
    </div>
  );
}
