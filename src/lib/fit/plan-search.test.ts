import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { plans } from "@/data";
import { searchPlanList, searchPlans } from "./plan-search";

const ids = (query: string) => searchPlans(query).map((plan) => plan.id);

describe("the plan search", () => {
  it("shows the full list before anything is typed", () => {
    assert.equal(searchPlans("  ").length, plans.length);
  });

  it("finds a plan from the start of its name, in any case", () => {
    assert.deepEqual(ids("aet"), ["aetna"]);
    assert.deepEqual(ids("CIGNA"), ["cigna"]);
  });

  it("finds a plan written the long way or the short way", () => {
    assert.deepEqual(ids("Blue Cross Blue Shield of Texas"), ["bcbs"]);
    assert.deepEqual(ids("bcbs tx"), ["bcbs"]);
    assert.deepEqual(ids("UHC"), ["unitedhealthcare"]);
    assert.deepEqual(ids("united"), ["unitedhealthcare"]);
  });

  it("finds Medicaid and Medicare inside a longer name, so they still screen out", () => {
    assert.deepEqual(ids("Medicare Advantage"), ["medicare"]);
    assert.deepEqual(ids("texas medicaid"), ["medicaid"]);
    assert.deepEqual(ids("medi"), ["medicaid", "medicare"]);
  });

  it("finds nothing for a plan that isn't on Legion's list", () => {
    assert.deepEqual(ids("Humana"), []);
  });
});

describe("the full plan list", () => {
  it("adds the insurers Legion doesn't take, with no plan behind them", () => {
    const all = searchPlanList("");
    assert.equal(all.length, plans.length + 4);
    assert.deepEqual(searchPlanList("huma"), [{ name: "Humana", planId: null }]);
  });

  it("keeps Legion's own plans findable the same way", () => {
    assert.deepEqual(searchPlanList("bcbs tx"), [{ name: "Blue Cross Blue Shield", planId: "bcbs" }]);
  });
});
