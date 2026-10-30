import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { plans } from "@/data";
import { searchPlans } from "./plan-search";

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

  it("finds nothing for a plan that isn't on the list", () => {
    assert.deepEqual(ids("Humana"), []);
  });
});
