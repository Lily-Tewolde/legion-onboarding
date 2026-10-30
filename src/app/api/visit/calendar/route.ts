import { copy } from "@/copy";
import { icsFile } from "@/lib/calendar";
import { missingFor, providerName } from "@/server/booking";
import { getSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// GET /api/visit/calendar: the booked visit as a calendar file, for "Add to
// calendar" with Apple or Outlook
export async function GET(request: Request) {
  const visitorId = await readVisitorId();
  const session = visitorId ? await getSession(visitorId).catch(() => null) : null;
  if (!session || missingFor(session, "booked") || !session.provider_id || !session.slot_start) {
    return new Response("Not found", { status: 404 });
  }

  const ics = icsFile({
    uid: `${session.id}@legion-prototype`,
    title: copy.booked.calendarTitle.replace("{provider}", providerName(session.provider_id)),
    start: session.slot_start,
    details: copy.shell.banner,
    url: new URL("/visit", request.url).toString(),
  });
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="legion-visit.ics"',
      "Cache-Control": "no-store",
    },
  });
}
