import type { ConcernLabel } from "@/data";

// The starter chips' line icons, from Claude Design's board (04-Concern).
// "Other" isn't on the board; it gets three dots in a circle
const PATHS: Record<ConcernLabel, string> = {
  ADHD: "M4 12a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M8.5 12a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0",
  Anxiety: "M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0",
  Depression: "M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 9.5 4.25 4.25 0 0 0 7 18z",
  Sleep: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z",
  PTSD: "M12 21s7-3.5 7-9.5V6l-7-3-7 3v5.5C5 17.5 12 21 12 21z",
  OCD: "M4 12a8 8 0 0 1 13.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.7 5.6L4 15M4 20v-5h5",
  "Panic disorder": "M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7",
  "Bipolar disorder": "M4 12a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M12 4v16M12 8h4M12 12h6M12 16h4",
  Other: "M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M8 12h.01M12 12h.01M16 12h.01",
  "Not sure": "M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M9.5 9.5a2.5 2.5 0 0 1 4.8 1c0 1.7-2.3 2-2.3 3.5M12 17h.01",
};

export const ConcernIcon = ({ label }: { label: ConcernLabel }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={PATHS[label]} />
  </svg>
);
