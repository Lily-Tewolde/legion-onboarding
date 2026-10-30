import { NextResponse } from "next/server";
import { z } from "zod";
import { missingFor, recommendationFor } from "@/server/booking";
import { getSession, updateSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// "Book {day} at {time}" on screen 4: holds the chosen provider and time in
// the session. Only a time the screen actually offered can be chosen
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

    await updateSession(visitorId, {
      provider_id: chosen.provider.id,
      slot_start: parsed.data.slotStart,
      current_screen: "book",
    });
    return NextResponse.json({ path: "/join/book" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
}
