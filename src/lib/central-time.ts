// Dates in Central time, where Legion's Texas patients are. Dates are
// "YYYY-MM-DD" strings so they never pick up the server's own time zone

const ZONE = "America/Chicago";

export function todayInCentral(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// Counts forward from the given date, skipping Saturdays and Sundays
export function addBusinessDays(date: string, days: number): string {
  const day = new Date(`${date}T00:00:00Z`);
  let added = 0;
  while (added < days) {
    day.setUTCDate(day.getUTCDate() + 1);
    const weekday = day.getUTCDay();
    if (weekday !== 0 && weekday !== 6) added += 1;
  }
  return day.toISOString().slice(0, 10);
}

// A wall-clock time in Central on a date, as a UTC instant. Reads the
// Central offset (CST or CDT) for that day, so it's right across daylight
// saving. Times are daytime visit slots, never the 2 am changeover hour
export function centralToUtc(date: string, time: string): Date {
  const asIfUtc = new Date(`${date}T${time}:00Z`);
  return new Date(asIfUtc.getTime() - centralOffsetMinutes(asIfUtc) * 60_000);
}

function centralOffsetMinutes(instant: Date): number {
  const zoneName = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    timeZoneName: "longOffset",
  })
    .formatToParts(instant)
    .find((part) => part.type === "timeZoneName")?.value;

  // "GMT-05:00" or "GMT-06:00"
  const match = zoneName?.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) throw new Error(`Unexpected time zone name: ${zoneName}`);
  const [, sign, hours, minutes] = match;
  return (sign === "-" ? -1 : 1) * (Number(hours) * 60 + Number(minutes));
}
