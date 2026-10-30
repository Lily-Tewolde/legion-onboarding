import { NextResponse } from "next/server";
import { z } from "zod";
import { missingFor } from "@/server/booking";
import { getSession, updateSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// The check-in is finished. Only that it's done is stored (intake_done), for
// the visit page and the one metric's "with or without the check-in"; the
// answers stay in the patient's browser
const Body = z.object({}).strict();

export async function POST(request: Request) {
  const visitorId = await readVisitorId();
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!visitorId || !parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  try {
    const session = await getSession(visitorId);
    if (!session || missingFor(session, "booked")) return NextResponse.json({ error: "not_ready" }, { status: 409 });
    await updateSession(visitorId, { intake_done: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
}
