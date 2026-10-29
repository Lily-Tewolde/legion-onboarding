import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ageOn,
  earlyOutcome,
  evaluateFit,
  type FitAnswers,
  parseDateOfBirth,
  validateFacts,
} from "./rules";

// The edges from the build brief (section 8): 18 today, one day short,
// Texas No, Medicaid, Medicare, hospital Yes, safety Yes. Golden-set case Y-05

const TODAY = "2026-10-29";

const eligible: FitAnswers = {
  dateOfBirth: "05/14/1990",
  inTexas: "yes",
  payMethod: "insurance",
  planId: "aetna",
  safety: "no",
  hospital: "no",
};

describe("the fit check", () => {
  it("lets in someone who is eligible", () => {
    assert.deepEqual(evaluateFit(eligible, TODAY), { result: "eligible" });
  });

  it("lets in someone who turns 18 today", () => {
    const answers = { ...eligible, dateOfBirth: "10/29/2008" };
    assert.deepEqual(evaluateFit(answers, TODAY), { result: "eligible" });
  });

  it("screens out someone one day short of 18", () => {
    const answers = { ...eligible, dateOfBirth: "10/30/2008" };
    assert.deepEqual(evaluateFit(answers, TODAY), { result: "screened_out", reason: "under_18" });
  });

  it("screens out No to Texas", () => {
    const answers: FitAnswers = { ...eligible, inTexas: "no" };
    assert.deepEqual(evaluateFit(answers, TODAY), { result: "screened_out", reason: "not_in_texas" });
  });

  it("screens out Medicaid and Medicare", () => {
    for (const planId of ["medicaid", "medicare"]) {
      assert.deepEqual(evaluateFit({ ...eligible, planId }, TODAY), {
        result: "screened_out",
        reason: "medicaid_medicare",
      });
    }
  });

  it("lets in self-pay without a plan", () => {
    const answers: FitAnswers = { ...eligible, payMethod: "self_pay", planId: undefined };
    assert.deepEqual(evaluateFit(answers, TODAY), { result: "eligible" });
  });

  it("screens out Yes to the hospital question", () => {
    const answers: FitAnswers = { ...eligible, hospital: "yes" };
    assert.deepEqual(evaluateFit(answers, TODAY), { result: "screened_out", reason: "hospital_stay" });
  });

  it("sends Yes to the safety question to the crisis screen, before any other rule", () => {
    const answers: FitAnswers = { ...eligible, safety: "yes", dateOfBirth: "01/01/2015", inTexas: "no" };
    assert.deepEqual(evaluateFit(answers, TODAY), { result: "crisis" });
  });

  it("lets the other rules decide once they've said they're safe right now", () => {
    const answers: FitAnswers = { ...eligible, safety: "yes", safeConfirmed: true };
    assert.deepEqual(evaluateFit(answers, TODAY), { result: "eligible" });
  });
});

describe("answering Yes to the two direct questions", () => {
  it("goes straight to the crisis screen for safety, even with nothing else answered", () => {
    assert.deepEqual(earlyOutcome({ safety: "yes" }), { result: "crisis" });
  });

  it("screens out straight away for a hospital stay", () => {
    assert.deepEqual(earlyOutcome({ hospital: "yes" }), { result: "screened_out", reason: "hospital_stay" });
  });

  it("does nothing early for No answers", () => {
    assert.equal(earlyOutcome({ safety: "no", hospital: "no" }), null);
  });
});

describe("age and dates of birth", () => {
  it("reads MM / DD / YYYY with or without separators", () => {
    for (const text of ["05/14/1990", "5/14/1990", "05 / 14 / 1990", "05-14-1990", "05141990"]) {
      assert.deepEqual(parseDateOfBirth(text), { year: 1990, month: 5, day: 14 }, text);
    }
  });

  it("rejects dates that don't exist", () => {
    for (const text of ["02/30/1990", "13/01/1990", "00/10/1990", "1990-05-14", "", "May 14 1990"]) {
      assert.equal(parseDateOfBirth(text), null, text);
    }
  });

  it("counts a February 29 birthday from March 1 in other years", () => {
    const dob = { year: 2008, month: 2, day: 29 };
    assert.equal(ageOn(dob, "2026-02-28"), 17);
    assert.equal(ageOn(dob, "2026-03-01"), 18);
  });

  it("asks again for a date in the future or more than 120 years ago", () => {
    assert.equal(validateFacts({ ...eligible, dateOfBirth: "10/30/2026" }, TODAY).dateOfBirth, "date_of_birth");
    assert.equal(validateFacts({ ...eligible, dateOfBirth: "01/01/1900" }, TODAY).dateOfBirth, "date_of_birth");
  });
});

describe("required answers", () => {
  it("finds nothing missing on a complete form", () => {
    assert.deepEqual(validateFacts(eligible, TODAY), {});
  });

  it("asks for each missing answer", () => {
    assert.deepEqual(validateFacts({}, TODAY), {
      dateOfBirth: "date_of_birth",
      inTexas: "required",
      payMethod: "pay_method",
      safety: "required",
      hospital: "required",
    });
  });

  it("needs a plan from the list when paying with insurance", () => {
    assert.equal(validateFacts({ ...eligible, planId: undefined }, TODAY).planId, "required");
    assert.equal(validateFacts({ ...eligible, planId: "not_listed" }, TODAY).planId, "required");
  });
});
