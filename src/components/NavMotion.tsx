"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

// The spec's screen motion, applied to the content only (globals.css): the
// frame holds still, and the elements in the content area arrive from the
// right moving forward and from the left going back, heading first. Switching
// between the portal's tabs fades the content in quietly instead, since
// nothing is advancing (Lily, Oct 30). Never on first load. Direction comes
// from the order of the flow's screens; anything not in the list counts as
// forward. The class is removed once the animation is done, so the next move
// animates again. Things that appear after a tap only animate once the page is
// live (the "live" class)

const ORDER = [
  "/join",
  "/join/insurance",
  "/join/plan-search",
  "/join/your-plan",
  "/join/safety",
  "/join/whats-going-on",
  "/join/confirm",
  "/join/provider",
  "/join/more-providers",
  "/join/book",
  "/join/book/payment",
  "/join/booked",
  "/visit",
  "/visit/check-in",
];

const rank = (path: string) => ORDER.indexOf(path);

// The portal's tabs: side by side, not a sequence
const TABS = new Set(["/visit", "/visit/inbox", "/visit/profile"]);

function Motion() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const from = previous.current;
    previous.current = pathname;
    if (from === null) {
      // First load: no screen animation, but later reveals may animate
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("live")));
      return () => cancelAnimationFrame(frame);
    }
    const back = rank(pathname) !== -1 && rank(from) !== -1 && rank(pathname) < rank(from);
    const tab = TABS.has(pathname) && TABS.has(from);
    root.classList.remove("nav-fwd", "nav-back", "nav-fade");
    // Restart the animation on the next frame
    void root.offsetWidth;
    root.classList.add(tab ? "nav-fade" : back ? "nav-back" : "nav-fwd");
    const timer = window.setTimeout(() => root.classList.remove("nav-fwd", "nav-back", "nav-fade"), 800);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}

export function NavMotion() {
  return (
    <Suspense fallback={null}>
      <Motion />
    </Suspense>
  );
}
