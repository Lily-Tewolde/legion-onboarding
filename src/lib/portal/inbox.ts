// The portal's in-app inbox (screens 8 and 11): the check-in invite 72 hours
// before the visit, then reminders 24 hours and 1 hour before. Nothing real is
// sent. A message due before the visit was booked arrives at booking. The
// demo control ("Demo: skip to 72 hours before", then 24 and 1) moves the
// inbox's clock forward to one of those points; it never moves it back

export const DEMO_POINTS = ["72h", "24h", "1h"] as const;
export type DemoPoint = (typeof DEMO_POINTS)[number];

export type InboxKind = "invite" | "reminder_24h" | "reminder_1h";
export type InboxMessage = { kind: InboxKind; sentAt: string };

const HOUR = 60 * 60 * 1000;

const HOURS_BEFORE: Record<DemoPoint, number> = { "72h": 72, "24h": 24, "1h": 1 };

const MESSAGES: { kind: InboxKind; point: DemoPoint }[] = [
  { kind: "invite", point: "72h" },
  { kind: "reminder_24h", point: "24h" },
  { kind: "reminder_1h", point: "1h" },
];

const pointTime = (slotStart: string, point: DemoPoint) => new Date(slotStart).getTime() - HOURS_BEFORE[point] * HOUR;

export const isDemoPoint = (value: unknown): value is DemoPoint => DEMO_POINTS.includes(value as DemoPoint);

// The inbox's "now": the real time, or the demo point if that's later
export function inboxClock(slotStart: string, now: Date, point: DemoPoint | null): Date {
  return new Date(Math.max(now.getTime(), point ? pointTime(slotStart, point) : 0));
}

// Newest first
export function inbox(slotStart: string, bookedAt: string, clock: Date): InboxMessage[] {
  const booked = new Date(bookedAt).getTime();
  return MESSAGES.map(({ kind, point }) => ({ kind, sent: Math.max(pointTime(slotStart, point), booked) }))
    .filter(({ sent }) => sent <= clock.getTime())
    .sort((a, b) => b.sent - a.sent)
    .map(({ kind, sent }) => ({ kind, sentAt: new Date(sent).toISOString() }));
}

// The next point the demo control can skip to, or null once the last has passed
export function nextDemoPoint(slotStart: string, clock: Date): DemoPoint | null {
  return DEMO_POINTS.find((point) => pointTime(slotStart, point) > clock.getTime()) ?? null;
}
