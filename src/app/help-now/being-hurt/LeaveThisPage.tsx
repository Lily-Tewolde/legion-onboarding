"use client";

import { Button } from "@/components/Button";
import { copy } from "@/copy";

// The quick exit: opens a neutral page and replaces this one in the browser
// history, so Back doesn't return here
export function LeaveThisPage() {
  return (
    <div className="sticky top-0 z-10 -mx-4 flex justify-end bg-white px-4 py-2">
      <Button variant="secondary" size="small" onClick={() => window.location.replace("https://www.google.com")}>
        {copy.crisis.beingHurt.leave}
      </Button>
    </div>
  );
}
