// Visit times in Central time, where Legion's Texas patients are, in the
// copy's style: "Monday", "November 2", "10 am" or "2:30 pm"

const ZONE = "America/Chicago";

// About 60 minutes, from Legion's current flow
export const VISIT_MINUTES = 60;

const part = (iso: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: ZONE, ...options }).format(new Date(iso));

export const visitDay = (iso: string) => part(iso, { weekday: "long" });

export const visitDate = (iso: string) => part(iso, { month: "long", day: "numeric" });

export function visitTime(iso: string): string {
  const [hourText, minute] = part(iso, { hour: "numeric", minute: "2-digit", hour12: true }).split(/[: ]/);
  const period = part(iso, { hour: "numeric", hour12: true }).endsWith("AM") ? "am" : "pm";
  return minute === "00" ? `${hourText} ${period}` : `${hourText}:${minute} ${period}`;
}

// The short date, "Mon, Nov 2", wherever the long one would wrap
export const visitShortDate = (iso: string) =>
  `${part(iso, { weekday: "short" })}, ${part(iso, { month: "short", day: "numeric" })}`;
