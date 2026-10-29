import type { ReactNode } from "react";

// Adapted from Inspo Book 01's tag: sentence case instead of all caps, and
// 14px instead of 9px, for the on-screen labels like "Demo: payment simulated"
export const Tag = ({ children }: { children: ReactNode }) => (
  <span className="inline-block rounded-full bg-wash px-2.5 py-0.5 text-sm font-medium text-action">
    {children}
  </span>
);
