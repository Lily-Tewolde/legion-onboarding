import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { inbox, inboxClock, isDemoPoint, nextDemoPoint } from "@/lib/portal/inbox";
import { missingFor } from "./booking";
import { findPersonById } from "./people";
import { getSession, type OnboardingSession } from "./sessions";
import { readVisitorId } from "./visitor";

// What the portal screens read: the booked session, and the inbox on the
// demo clock. The demo clock is a cookie, not a column: it's only the demo's
// "skip to" point, never anything about the patient

export const DEMO_CLOCK_COOKIE = "lh_demo_clock";

export type BookedSession = OnboardingSession & { provider_id: string; slot_start: string; booked_at: string };

// The portal opens only once a visit is booked; anything missing sends the
// visitor back to where it's answered
export async function bookedSessionOrRedirect(): Promise<BookedSession> {
  const visitorId = await readVisitorId();
  const session = visitorId ? await getSession(visitorId).catch(() => null) : null;
  const missing = missingFor(session, "booked");
  if (!session || missing || !session.provider_id || !session.slot_start || !session.booked_at) {
    redirect(missing ?? "/join");
  }
  return session as BookedSession;
}

export async function portalInbox(session: BookedSession, now: Date = new Date()) {
  const stored = (await cookies()).get(DEMO_CLOCK_COOKIE)?.value;
  const clock = inboxClock(session.slot_start, now, isDemoPoint(stored) ? stored : null);
  return {
    messages: inbox(session.slot_start, session.booked_at, clock),
    nextPoint: nextDemoPoint(session.slot_start, clock),
  };
}

// A new or cancelled time starts the demo clock again
export async function resetDemoClock() {
  (await cookies()).delete(DEMO_CLOCK_COOKIE);
}

// What the inbox messages fill in. The first name is the first word of the
// made-up name from the checkout
export async function messageContext(session: BookedSession, provider: string) {
  const person = session.person_id ? await findPersonById(session.person_id).catch(() => null) : null;
  return { slotStart: session.slot_start, provider, firstName: person?.full_name.trim().split(/\s+/)[0] ?? "" };
}
