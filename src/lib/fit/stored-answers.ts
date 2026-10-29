import type { FitAnswers } from "./rules";

// Screen 1's answers, kept in this browser tab's session storage (never in
// Supabase), so "Answered by mistake? Go back" and "I'm safe right now" bring
// people back to their answers. It's an external store for
// useSyncExternalStore: Next keeps visited pages alive in the background, so
// screen 1 has to read the latest answers from here when it's shown again,
// not from its own old state. Storage can be blocked, so reads and writes are
// allowed to fail quietly

const KEY = "lh_fit_answers";
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cached: FitAnswers = {};

export function subscribeAnswers(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// The same object until the stored answers change, as useSyncExternalStore needs
export function getAnswers(): FitAnswers {
  const raw = read();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parse(raw);
  }
  return cached;
}

// On the server there's no session storage: null means "not known yet"
export const getServerAnswers = (): FitAnswers | null => null;

export function saveAnswers(answers: FitAnswers): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(answers));
  } catch {
    // Nothing to do: the form still works, it just won't remember
  }
  // Blocked storage still updates the form, from memory
  cachedRaw = JSON.stringify(answers);
  cached = answers;
  for (const listener of listeners) listener();
}

function read(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return cachedRaw;
  }
}

function parse(raw: string | null): FitAnswers {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
