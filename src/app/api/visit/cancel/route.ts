import { NextResponse } from "next/server";
import { z } from "zod";
import { missingFor } from "@/server/booking";
import { resetDemoClock } from "@/server/portal";
import { getSession, updateSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// "Cancel visit" on the visit page, after "Cancel this visit?". Frees the
// time; the details and the check-in stay, so booking again is one step
const Body = z.object({}).strict();

export async function POST(request: Request) {
  const visitorId = await readVisitorId();
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!visitorId || !parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  try {
    const session = await getSession(visitorId);
    const missing = missingFor(session, "booked");
    if (!session || missing) return NextResponse.json({ error: "not_ready", path: missing }, { status: 409 });

    await updateSession(visitorId, {
      provider_id: null,
      slot_start: null,
      booked_at: null,
      visit_outcome: null,
      current_screen: "your_provider",
    });
    await resetDemoClock();
    return NextResponse.json({ path: "/join/provider" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
}
