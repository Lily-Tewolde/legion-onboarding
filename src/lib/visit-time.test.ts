import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { visitDate, visitDay, visitTime } from "./visit-time";

describe("visit times in Central time", () => {
  it("reads a morning slot after the clocks change", () => {
    const iso = "2026-11-02T16:00:00.000Z"; // 10 am CST
    assert.equal(visitDay(iso), "Monday");
    assert.equal(visitDate(iso), "November 2");
    assert.equal(visitTime(iso), "10 am");
  });

  it("keeps minutes and pm", () => {
    assert.equal(visitTime("2026-10-30T19:30:00.000Z"), "2:30 pm"); // CDT
  });
});
