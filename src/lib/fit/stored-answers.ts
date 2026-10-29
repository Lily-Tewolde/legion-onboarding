import type { FitAnswers } from "./rules";

// Screen 1's answers, kept in this browser tab's session storage (never in
// Supabase), so "Answered by mistake? Go back" and "I'm safe right now" bring
// people back to their answers. Storage can be blocked, so every read and
// write is allowed to fail quietly

const KEY = "lh_fit_answers";

export function loadAnswers(): FitAnswers {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveAnswers(answers: FitAnswers): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(answers));
  } catch {
    // Nothing to do: the form still works, it just won't remember
  }
}
