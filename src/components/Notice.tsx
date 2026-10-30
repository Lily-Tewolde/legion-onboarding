import type { ReactNode } from "react";
import { copy } from "@/copy";
import { cx } from "./cx";
import { Glow } from "./Screen";

// The screen-outs and the crisis screens (boards U01 to U08): no progress and
// no path panel, an icon in a circle above the heading, and the words people
// need. On phones the actions are pinned to the bottom; from 768px up the
// whole notice sits in one card, 632px wide, with the actions inside it.
// "Keep going" (the crisis screens' "I'm safe right now") is pinned on phones
// under a line, and its own card on desktop. Spacing tightens on short
// phones, like <Screen>
export function Notice({
  icon,
  urgent = false,
  title,
  children,
  actions,
  keepGoing,
  demo,
  top,
}: {
  icon: ReactNode;
  // Red for the crisis screens, blue for the calm screen-outs
  urgent?: boolean;
  title: string;
  children: ReactNode;
  // Inside the card on desktop; pinned on phones unless there's keepGoing
  actions: ReactNode;
  keepGoing?: ReactNode;
  demo?: string;
  // Above everything, like "Leave this page"
  top?: ReactNode;
}) {
  const demoLine = demo && <p className="mt-1 text-center text-label text-slate">{demo}</p>;
  return (
    <div className="screen relative flex flex-1 flex-col overflow-x-clip">
      <Glow />
      {top}
      <div className="relative z-[1] mx-auto flex w-full max-w-notice flex-1 flex-col md:flex-none md:gap-4 md:px-6 md:pt-10 md:pb-8">
        <main className="screen-body flex flex-1 flex-col gap-3 px-4 pt-2 pb-2 short:gap-2 short:pt-1 md:flex-none md:rounded-card md:border md:border-card-line md:bg-white md:p-6 md:shadow-notice">
          <span
            aria-hidden="true"
            className={cx(
              "flex size-12 flex-none items-center justify-center rounded-full md:size-14",
              urgent ? "bg-error-tint text-error" : "bg-wash text-action",
            )}
          >
            {icon}
          </span>
          <h1 className="display text-page-title text-ink md:text-notice-title">{title}</h1>
          {children}
          <div className={cx("flex flex-col gap-1 md:mt-2", !keepGoing && "max-md:hidden")}>{actions}</div>
        </main>
        <div
          className={cx(
            "sticky bottom-0 z-10 flex flex-col gap-1 bg-white px-4 pt-2 pb-[calc(12px+env(safe-area-inset-bottom))]",
            "short:pt-1.5 short:pb-[calc(8px+env(safe-area-inset-bottom))]",
            "md:static md:bg-transparent md:p-0",
            !keepGoing && "md:hidden",
          )}
        >
          {keepGoing ? (
            <section
              aria-label={copy.crisis.keepGoing}
              className="flex flex-col border-t border-line pt-2 md:rounded-card md:border md:border-card-line md:bg-white md:px-6 md:py-4 md:shadow-card"
            >
              {keepGoing}
            </section>
          ) : (
            actions
          )}
          {demoLine}
        </div>
        {!keepGoing && demo && <div className="max-md:hidden">{demoLine}</div>}
      </div>
    </div>
  );
}

// One fact on its own tile, like "If you need to talk to someone now, call or
// text 988 any time.", with a small icon
export const ResourceTile = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <div className="flex items-start gap-3 rounded-tile border border-card-line bg-white px-4 py-3">
    <span aria-hidden="true" className="flex size-8 flex-none items-center justify-center rounded-full bg-wash text-action">
      {icon}
    </span>
    <p className="text-body text-navy md:text-body-lg">{children}</p>
  </div>
);

// Body text on a notice: 16/24 on phones, 17/26 on desktop
export const NoticeText = ({ children }: { children: ReactNode }) => <p className="text-body text-navy md:text-body-lg">{children}</p>;
