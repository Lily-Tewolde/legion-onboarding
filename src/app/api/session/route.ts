import { NextResponse } from "next/server";
import { getOrCreateSession, getSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// The visitor's own onboarding session, found by the anonymous visitor cookie.
// GET reads it (null if they haven't started); POST starts it, or returns the
// one they already have. The session holds no free text

export async function GET() {
  return withVisitor(async (visitorId) => ({
    session: await getSession(visitorId),
  }));
}

export async function POST() {
  return withVisitor(async (visitorId) => ({
    session: await getOrCreateSession(visitorId),
  }));
}

async function withVisitor(handle: (visitorId: string) => Promise<object>) {
  const visitorId = await readVisitorId();
  if (!visitorId) {
    return NextResponse.json({ error: "no_visitor" }, { status: 400 });
  }

  try {
    return NextResponse.json(await handle(visitorId), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "session_unavailable" }, { status: 500 });
  }
}
