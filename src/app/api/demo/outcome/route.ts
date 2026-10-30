import { NextResponse } from "next/server";
import { z } from "zod";
import { missingFor } from "@/server/booking";
import { getSession, updateSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// "Mark visit completed" and "Mark no-show" on the demo panel: records how the
// visit went, so the funnel runs from start to finish. Demo only
const Body = z.object({ outcome: z.enum(["completed", "no_show"]) }).strict();

export async function POST(request: Request) {
  const visitorId = await readVisitorId();
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!visitorId || !parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  try {
    const session = await getSession(visitorId);
    const missing = missingFor(session, "booked");
    if (!session || missing) return NextResponse.json({ error: "not_ready", path: missing }, { status: 409 });

    await updateSession(visitorId, { visit_outcome: parsed.data.outcome });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
}
