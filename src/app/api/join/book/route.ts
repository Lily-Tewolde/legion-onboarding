import { NextResponse } from "next/server";
import { z } from "zod";
import { missingFor } from "@/server/booking";
import { resetDemoClock } from "@/server/portal";
import { getSession, updateSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// "Book my visit". Payment is simulated: the card never leaves the browser,
// and the server only learns that the card step was done
const Body = z.object({ cardSimulated: z.literal(true) }).strict();

export async function POST(request: Request) {
  const visitorId = await readVisitorId();
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!visitorId || !parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  try {
    const session = await getSession(visitorId);
    const missing = missingFor(session, "provider") ?? (session?.person_id ? null : "/join/book");
    if (!session || missing) return NextResponse.json({ error: "not_ready", path: missing }, { status: 409 });

    await updateSession(visitorId, { booked_at: new Date().toISOString(), current_screen: "booked" });
    await resetDemoClock();
    return NextResponse.json({ path: "/join/booked" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
}
