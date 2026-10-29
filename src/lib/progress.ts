import { copy } from "@/copy";

// The four named phases the progress shows on the booking screens, ending at
// "You're booked" (Lily, PR #10). Each screen says which phase it's in
export const PHASES = [
  { id: "about_you", label: copy.progress.aboutYou },
  { id: "whats_going_on", label: copy.progress.whatsGoingOn },
  { id: "your_provider", label: copy.progress.yourProvider },
  { id: "book", label: copy.progress.book },
] as const;

export type Phase = (typeof PHASES)[number]["id"];
