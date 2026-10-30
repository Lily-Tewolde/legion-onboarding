import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DEMO_CLOCK_COOKIE } from "@/server/portal";
import { VISITOR_COOKIE } from "@/server/visitor";

// "Start over" in Demo controls: forgets this browser's visitor id and the
// demo clock, so the next page gets a new anonymous visitor and a new
// session. The old session stays in the database, just no longer linked to
// this browser. Demo only
export async function POST() {
  const store = await cookies();
  store.delete(VISITOR_COOKIE);
  store.delete(DEMO_CLOCK_COOKIE);
  return NextResponse.json({ ok: true });
}
