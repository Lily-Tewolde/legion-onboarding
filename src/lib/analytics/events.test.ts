import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { daysToVisit, fallbackReason, screenOf } from "./events";

describe("event properties", () => {
  it("counts whole days to the visit in Central time", () => {
    // Booked Wednesday Oct 28 at 9 am Central, for Monday Nov 2 at 10 am
    assert.equal(daysToVisit("2026-11-02T16:00:00.000Z", new Date("2026-10-28T14:00:00.000Z")), 5);
    // 11 pm Central on the 28th is already the 29th in UTC, but still the 28th in Texas
    assert.equal(daysToVisit("2026-11-02T16:00:00.000Z", new Date("2026-10-29T04:00:00.000Z")), 5);
  });

  it("only ever sends a fixed fallback reason, never text", () => {
    assert.equal(fallbackReason("timeout"), "timeout");
    assert.equal(fallbackReason("I want to hurt myself"), "other");
  });

  it("sends the help link's screen as a path without a query", () => {
    assert.equal(screenOf("/join/insurance?x=1#top"), "/join/insurance");
  });
});
