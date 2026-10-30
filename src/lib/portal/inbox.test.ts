import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inbox, inboxClock, nextDemoPoint } from "./inbox";

// Lily's walk: booked Wednesday Oct 28 at 9 am Central for Monday Nov 2 at 10 am
const BOOKED = "2026-10-28T14:00:00.000Z";
const VISIT = "2026-11-02T16:00:00.000Z";
const NOW = new Date(BOOKED);

const kinds = (clock: Date) => inbox(VISIT, BOOKED, clock).map((m) => m.kind);

describe("the inbox", () => {
  it("is empty right after booking a visit more than 72 hours out", () => {
    assert.deepEqual(kinds(inboxClock(VISIT, NOW, null)), []);
    assert.equal(nextDemoPoint(VISIT, NOW), "72h");
  });

  it("gets the check-in invite at 72 hours before", () => {
    const clock = inboxClock(VISIT, NOW, "72h");
    assert.deepEqual(kinds(clock), ["invite"]);
    assert.equal(inbox(VISIT, BOOKED, clock)[0].sentAt, "2026-10-30T16:00:00.000Z");
    assert.equal(nextDemoPoint(VISIT, clock), "24h");
  });

  it("adds the reminders newest first, and has no next point after 1 hour", () => {
    const clock = inboxClock(VISIT, NOW, "1h");
    assert.deepEqual(kinds(clock), ["reminder_1h", "reminder_24h", "invite"]);
    assert.equal(nextDemoPoint(VISIT, clock), null);
  });

  it("never moves the clock back: real time past a demo point wins", () => {
    const realNow = new Date("2026-11-02T15:30:00.000Z");
    assert.equal(inboxClock(VISIT, realNow, "72h").toISOString(), realNow.toISOString());
  });

  it("sends a message that was due before booking at the booking time", () => {
    const bookedLate = "2026-11-01T16:00:00.000Z"; // 24 hours before the visit
    const messages = inbox(VISIT, bookedLate, new Date(bookedLate));
    assert.deepEqual(messages.map((m) => m.kind).sort(), ["invite", "reminder_24h"]);
    assert.ok(messages.every((m) => m.sentAt === bookedLate));
  });
});
