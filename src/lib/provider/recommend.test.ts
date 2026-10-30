import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { recommend } from "./recommend";

// Wednesday Oct 28, 2026, 9 am Central: the day of Lily's walk
const NOW = new Date("2026-10-28T14:00:00Z");

describe("the recommended provider", () => {
  it("recommends someone who treats the first concern and takes the plan", () => {
    const result = recommend(["ADHD"], { payMethod: "insurance", planId: "aetna" }, NOW);
    assert.ok(result.found);
    assert.equal(result.recommended.provider.id, "alex-rivera");
    assert.equal(result.recommended.concern, "ADHD");
  });

  it("breaks ties by the earliest time", () => {
    // Sleep with BCBS: Priya Shah and Jordan Ellis both treat it; Jordan's first time is earlier
    const result = recommend(["Sleep"], { payMethod: "insurance", planId: "bcbs" }, NOW);
    assert.ok(result.found);
    assert.equal(result.recommended.provider.id, "jordan-ellis");
  });

  it("only offers providers who take the plan", () => {
    const result = recommend(["Bipolar disorder"], { payMethod: "insurance", planId: "oscar" }, NOW);
    assert.ok(result.found);
    assert.ok(result.recommended.provider.plans.includes("oscar"));
  });

  it("lets self-pay patients see anyone", () => {
    const result = recommend(["Sleep"], { payMethod: "self_pay", planId: null }, NOW);
    assert.ok(result.found);
  });

  it("shows the no-times screen for Oscar + Sleep, the one gap on purpose", () => {
    assert.deepEqual(recommend(["Sleep"], { payMethod: "insurance", planId: "oscar" }, NOW), { found: false });
  });

  it("moves to the next concern when nobody treats the first", () => {
    const result = recommend(["Sleep", "Anxiety"], { payMethod: "insurance", planId: "oscar" }, NOW);
    assert.ok(result.found);
    assert.equal(result.recommended.concern, "Anxiety");
  });

  it("matches Not sure or Other to the first provider who takes the plan, at the earliest time", () => {
    for (const concern of ["Not sure", "Other"] as const) {
      const result = recommend([concern], { payMethod: "insurance", planId: "oscar" }, NOW);
      assert.ok(result.found, concern);
      assert.equal(result.recommended.concern, null);
      assert.ok(result.recommended.provider.plans.includes("oscar"));
    }
  });

  it("starts the earliest time 3 business days out, as on Lily's walk", () => {
    const result = recommend(["ADHD"], { payMethod: "self_pay", planId: null }, NOW);
    assert.ok(result.found);
    assert.equal(result.recommended.slots[0].start.slice(0, 10), "2026-11-02");
  });

  it("lists other providers who treat one of their concerns under See more providers", () => {
    const result = recommend(["Anxiety"], { payMethod: "insurance", planId: "unitedhealthcare" }, NOW);
    assert.ok(result.found);
    assert.ok(result.others.length > 0);
    assert.ok(result.others.every((other) => other.provider.concerns.includes("Anxiety")));
    assert.ok(result.others.every((other) => other.provider.id !== result.recommended.provider.id));
  });
});
