import { NextResponse } from "next/server";
import { z } from "zod";
import { CONCERN_LABELS } from "@/data";
import { getOrCreateSession, updateSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// "Looks right" on screen 3: saves the confirmed concerns to the visitor's
// session as standard English labels only. Never the patient's words
const Body = z.object({ labels: z.array(z.enum(CONCERN_LABELS)).min(1).max(10) }).strict();

export async function POST(request: Request) {
  const visitorId = await readVisitorId();
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!visitorId || !parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    await getOrCreateSession(visitorId);
    await updateSession(visitorId, {
      concern_labels: [...new Set(parsed.data.labels)],
      current_screen: "your_provider",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
  return NextResponse.json({ path: "/join/provider" });
}
