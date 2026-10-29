// A small external store on this browser tab's session storage, for
// useSyncExternalStore. Next keeps visited pages alive, so screens read their
// state from here rather than from component state, and stay current when
// they're shown again. Nothing here ever reaches Supabase. Storage can be
// blocked, so it falls back to memory and never throws
export type SessionStore<T> = {
  subscribe: (listener: () => void) => () => void;
  get: () => T;
  // On the server there's no session storage: null means "not known yet"
  getServer: () => T | null;
  save: (value: T) => void;
};

export function createSessionStore<T>(key: string, empty: T): SessionStore<T> {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null = null;
  let cached: T = empty;

  const read = (): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return cachedRaw;
    }
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    // The same object until the stored value changes, as useSyncExternalStore needs
    get() {
      const raw = read();
      if (raw !== cachedRaw) {
        cachedRaw = raw;
        try {
          cached = raw ? JSON.parse(raw) : empty;
        } catch {
          cached = empty;
        }
      }
      return cached;
    },
    getServer: () => null,
    save(value) {
      const raw = JSON.stringify(value);
      try {
        sessionStorage.setItem(key, raw);
      } catch {
        // Blocked storage still updates the screen, from memory
      }
      cachedRaw = raw;
      cached = value;
      for (const listener of listeners) listener();
    },
  };
}
