import { headers } from "next/headers";
import { copy } from "@/copy";
import { googleCalendarUrl } from "@/lib/calendar";
import { CalendarLinks } from "./CalendarLinks";

// "Add to calendar" with Google, Apple and Outlook (decided Oct 29): a link
// for Google, and the calendar file for Apple and Outlook
export async function AddToCalendar({
  slotStart,
  provider,
  id = "add-to-calendar",
  compact = false,
}: {
  slotStart: string;
  provider: string;
  id?: string;
  // In the visit card: the label and the logos on one row
  compact?: boolean;
}) {
  const host = (await headers()).get("host") ?? "";
  const google = googleCalendarUrl({
    title: copy.booked.calendarTitle.replace("{provider}", provider),
    start: slotStart,
    details: copy.shell.banner,
    url: `https://${host}/visit`,
  });

  return (
    <div role="group" aria-labelledby={id} className={compact ? "flex flex-wrap items-center gap-2" : "flex flex-col gap-2"}>
      <p id={id} className={compact ? "text-body font-semibold text-ink" : "text-question font-semibold text-ink"}>
        {copy.booked.addToCalendar}
      </p>
      <CalendarLinks google={google} />
    </div>
  );
}
