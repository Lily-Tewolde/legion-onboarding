import type { ReactNode } from "react";

// The spec's tag: a pill on the tag blue, 14px semibold, for things like the
// "Completed" milestone and "Recommended"
export const Tag = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-tag px-2.5 py-0.5 text-label font-semibold whitespace-nowrap text-navy">
    {children}
  </span>
);
