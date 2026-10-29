import { cookies } from "next/headers";

// The anonymous visitor id: a random id in a first-party cookie, set by
// src/proxy.ts on the first request. It's the onboarding session's anon_id,
// so progress survives on the same device. It holds nothing else

export const VISITOR_COOKIE = "lh_visitor";

// 60 days: the one metric's 30-day window from start to a completed first
// visit, with room for a visit booked weeks out
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 60;

export async function readVisitorId(): Promise<string | null> {
  const store = await cookies();
  return store.get(VISITOR_COOKIE)?.value ?? null;
}
