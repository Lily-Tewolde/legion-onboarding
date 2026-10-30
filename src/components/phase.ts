import { copy } from "@/copy";
import type { Phase } from "@/lib/progress";

export const PHASE_LABEL: Record<Phase, string> = {
  about_you: copy.progress.aboutYou,
  whats_going_on: copy.progress.whatsGoingOn,
  your_provider: copy.progress.yourProvider,
  book: copy.progress.book,
};

export const PHASE_ORDER: Phase[] = ["about_you", "whats_going_on", "your_provider", "book"];
