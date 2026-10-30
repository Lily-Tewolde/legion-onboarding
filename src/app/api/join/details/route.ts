import { NextResponse } from "next/server";
import { z } from "zod";
import { usPhoneDigits, validateDetails } from "@/lib/checkout/validate";
import { missingFor } from "@/server/booking";
import { createPerson, updatePerson } from "@/server/people";
import { getSession, updateSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// The checkout's "Your details", saved once the section is complete (flow
// map, screen 5), so progress is kept even if the card step is left. An email
// that's already used comes back as "email_taken" for the simulated sign-in
const Body = z
  .object({ name: z.string().max(120), email: z.string().max(200), phone: z.string().max(30), consent: z.literal(true) })
  .strict();

export async function POST(request: Request) {
  const visitorId = await readVisitorId();
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!visitorId || !parsed.success || Object.keys(validateDetails(parsed.data)).length > 0) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const session = await getSession(visitorId);
    const missing = missingFor(session, "provider");
    if (!session || missing) return NextResponse.json({ error: "not_ready", path: missing }, { status: 409 });

    const details = {
      full_name: parsed.data.name.trim(),
      email: parsed.data.email,
      phone: usPhoneDigits(parsed.data.phone) ?? "",
      consented_at: new Date().toISOString(),
    };
    const result = session.person_id ? await updatePerson(session.person_id, details) : await createPerson(details);
    if (result.status === "email_taken") return NextResponse.json({ status: "email_taken" });

    await updateSession(visitorId, { person_id: result.person.id });
    return NextResponse.json({ status: "saved" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
}
