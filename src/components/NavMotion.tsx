"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

// The spec's screen motion: moving forward slides the new screen in from the
// right, going back brings it in from the left, heading first, then the cards.
// Never on first load. Direction comes from the order of the flow's screens;
// anything not in the list counts as forward. The class is removed once the
// animation is done, so the next move animates again. Things that appear after
// a tap only animate once the page is live (the "live" class)

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
    root.classList.remove("nav-fwd", "nav-back");
    // Restart the animation on the next frame
    void root.offsetWidth;
    root.classList.add(back ? "nav-back" : "nav-fwd");
    const timer = window.setTimeout(() => root.classList.remove("nav-fwd", "nav-back"), 800);
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
