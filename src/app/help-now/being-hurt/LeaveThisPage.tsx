"use client";

import { Exit } from "@/components/icons";
import { copy } from "@/copy";

// The quick exit (board U08): a navy pill at the top right that stays in
// reach as the page scrolls. It opens a neutral page and replaces this one in
// the browser history, so Back doesn't return here
export function LeaveThisPage() {
  return (
    <div className="pointer-events-none sticky top-0 z-30 mx-auto flex w-full max-w-notice justify-end px-4 pt-1 md:max-w-shell md:px-8 md:pt-3">
      <button
        type="button"
        onClick={() => window.location.replace("https://www.google.com")}
        className="focus-ring pointer-events-auto inline-flex min-h-control-sm cursor-pointer items-center gap-2 rounded-full bg-navy pr-4 pl-3 text-body font-semibold whitespace-nowrap text-white hover:bg-ink"
      >
        <Exit size={18} />
        {copy.crisis.beingHurt.leave}
      </button>
    </div>
  );
}
