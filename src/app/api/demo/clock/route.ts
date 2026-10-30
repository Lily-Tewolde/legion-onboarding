import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { DEMO_POINTS } from "@/lib/portal/inbox";
import { DEMO_CLOCK_COOKIE } from "@/server/portal";
import { VISITOR_COOKIE_MAX_AGE } from "@/server/visitor";

// "Demo: skip to 72 hours" (then 24 and 1): moves the inbox's clock. Demo only
const Body = z.object({ to: z.enum(DEMO_POINTS) }).strict();

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  (await cookies()).set(DEMO_CLOCK_COOKIE, parsed.data.to, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VISITOR_COOKIE_MAX_AGE,
  });
  return NextResponse.json({ ok: true });
}
