import { NextResponse } from "next/server";
import { z } from "zod";
import { missingFor } from "@/server/booking";
import { findPersonByEmail } from "@/server/people";
import { getSession, updateSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// "Sign in to continue" when the email already has an account. Sign-in is
// simulated (labelled "Demo: sign-in simulated"; the build brief rules out
// real authentication): the existing made-up person is linked to this visit
const Body = z.object({ email: z.string().max(200) }).strict();

export async function POST(request: Request) {
  const visitorId = await readVisitorId();
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!visitorId || !parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  try {
    const session = await getSession(visitorId);
    const missing = missingFor(session, "provider");
    if (!session || missing) return NextResponse.json({ error: "not_ready", path: missing }, { status: 409 });

    const person = await findPersonByEmail(parsed.data.email);
    if (!person) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await updateSession(visitorId, { person_id: person.id });
    return NextResponse.json({ status: "signed_in" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
}
