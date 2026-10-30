import { NextResponse } from "next/server";
import { z } from "zod";
import { missingFor, recommendationFor } from "@/server/booking";
import { resetDemoClock } from "@/server/portal";
import { getSession, updateSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// "Book {day} at {time}" on screen 4: holds the chosen provider and time in
// the session. Only a time the screen actually offered can be chosen. From
// "Reschedule" (the visit is already booked, the details and card done), the
// new time is booked straight away and any no-show is cleared
const Body = z.object({ providerId: z.string().max(60), slotStart: z.string().max(40) }).strict();

export async function POST(request: Request) {
  const visitorId = await readVisitorId();
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!visitorId || !parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  try {
    const session = await getSession(visitorId);
    const missing = missingFor(session, "concerns");
    if (!session || missing) return NextResponse.json({ error: "not_ready", path: missing }, { status: 409 });

    const result = recommendationFor(session);
    const offered = result.found ? [result.recommended, ...result.others] : [];
    const chosen = offered.find((c) => c.provider.id === parsed.data.providerId);
    if (!chosen?.slots.some((slot) => slot.start === parsed.data.slotStart)) {
      return NextResponse.json({ error: "slot_unavailable" }, { status: 409 });
    }

    const rescheduling = Boolean(session.booked_at);
    await updateSession(visitorId, {
      provider_id: chosen.provider.id,
      slot_start: parsed.data.slotStart,
      ...(rescheduling
        ? { booked_at: new Date().toISOString(), visit_outcome: null, current_screen: "booked" }
        : { current_screen: "book" }),
    });
    if (!rescheduling) return NextResponse.json({ path: "/join/book" });
    await resetDemoClock();
    // Back to the visit page, which says "Your visit is now {day} at {time}."
    return NextResponse.json({ path: "/visit?rescheduled=1" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
}
