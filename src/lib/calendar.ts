import { VISIT_MINUTES } from "./visit-time";

// "Add to calendar" (decided Oct 29): a link for Google, and a calendar file
// for Apple and Outlook. Built from the visit only; nothing is sent anywhere

export type CalendarEvent = { title: string; start: string; details: string; url: string };

const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const endOf = (start: string) => new Date(new Date(start).getTime() + VISIT_MINUTES * 60_000);

export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${stamp(new Date(event.start))}/${stamp(endOf(event.start))}`,
    details: `${event.details}\n${event.url}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

// iCalendar text (RFC 5545): CRLF line endings, escaped text
export function icsFile(event: CalendarEvent & { uid: string }, now: Date = new Date()): string {
  const escape = (text: string) => text.replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Legion Health prototype//EN",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(new Date(event.start))}`,
    `DTEND:${stamp(endOf(event.start))}`,
    `SUMMARY:${escape(event.title)}`,
    `DESCRIPTION:${escape(event.details)}`,
    `URL:${event.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
