import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { googleCalendarUrl, icsFile } from "./calendar";

const event = {
  title: "Alex Rivera, PMHNP · Video visit",
  start: "2026-11-02T16:00:00.000Z",
  details: "Demo prototype",
  url: "https://example.test/visit",
};

describe("add to calendar", () => {
  it("builds a Google link for the hour-long visit", () => {
    const url = new URL(googleCalendarUrl(event));
    assert.equal(url.hostname, "calendar.google.com");
    assert.equal(url.searchParams.get("dates"), "20261102T160000Z/20261102T170000Z");
    assert.equal(url.searchParams.get("text"), event.title);
  });

  it("builds a calendar file Apple and Outlook can open", () => {
    const ics = icsFile({ ...event, uid: "visit-1@legion-prototype" }, new Date("2026-10-28T14:00:00Z"));
    assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
    assert.ok(ics.includes("DTSTART:20261102T160000Z\r\n"));
    assert.ok(ics.includes("DTEND:20261102T170000Z\r\n"));
    assert.ok(ics.includes("SUMMARY:Alex Rivera\\, PMHNP · Video visit\r\n"));
  });
});
