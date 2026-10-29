import { createSessionStore } from "@/lib/session-store";
import type { FitAnswers } from "./rules";

// Screen 1's answers, kept in this browser tab only (never in Supabase), so
// "Answered by mistake? Go back", "I'm safe right now" and the confirm
// screen's double-checks come back to them
const store = createSessionStore<FitAnswers>("lh_fit_answers", {});

export const subscribeAnswers = store.subscribe;
export const getAnswers = store.get;
export const getServerAnswers = store.getServer;
export const saveAnswers = store.save;
