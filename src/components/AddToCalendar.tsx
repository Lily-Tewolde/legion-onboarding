import { headers } from "next/headers";
import { copy } from "@/copy";
import { googleCalendarUrl } from "@/lib/calendar";
import { buttonClasses } from "./Button";

// "Add to calendar" with Google, Apple and Outlook (decided Oct 29): a link
// for Google, and the calendar file for Apple and Outlook. On the booked
// screen and the visit page
export async function AddToCalendar({ slotStart, provider }: { slotStart: string; provider: string }) {
  const host = (await headers()).get("host") ?? "";
  const google = googleCalendarUrl({
    title: copy.booked.calendarTitle.replace("{provider}", provider),
    start: slotStart,
    details: copy.shell.banner,
    url: `https://${host}/visit`,
  });

  return (
    <div className="flex flex-col items-start gap-1">
      <p className="font-medium">{copy.booked.addToCalendar}</p>
      <a href={google} target="_blank" rel="noopener noreferrer" className={buttonClasses("text")}>
        {copy.booked.google}
      </a>
      <a href="/api/visit/calendar" download="legion-visit.ics" className={buttonClasses("text")}>
        {copy.booked.apple}
      </a>
      <a href="/api/visit/calendar" download="legion-visit.ics" className={buttonClasses("text")}>
        {copy.booked.outlook}
      </a>
    </div>
  );
}
