import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ageOn,
  evaluateFit,
  type FitAnswers,
  parseDateOfBirth,
  partialOutcome,
  tapOutcome,
  validateFacts,
  validateFields,
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

  it("lets in self-pay without Medicaid or Medicare", () => {
    const answers: FitAnswers = { ...eligible, payMethod: "self_pay", planId: undefined, medicaidOrMedicare: "no" };
    assert.deepEqual(evaluateFit(answers, TODAY), { result: "eligible" });
  });

  it("screens out self-pay with Medicaid or Medicare, as Legion's rule includes self-pay", () => {
    const answers: FitAnswers = { ...eligible, payMethod: "self_pay", planId: undefined, medicaidOrMedicare: "yes" };
    assert.deepEqual(evaluateFit(answers, TODAY), { result: "screened_out", reason: "medicaid_medicare" });
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

describe("one-tap answers acting the moment they're tapped", () => {
  it("opens the crisis screen for Yes to safety", () => {
    assert.deepEqual(tapOutcome("safety", { safety: "yes" }), { result: "crisis" });
  });

  it("screens out No to Texas", () => {
    assert.deepEqual(tapOutcome("inTexas", { inTexas: "no" }), { result: "screened_out", reason: "not_in_texas" });
  });

  it("screens out Medicaid or Medicare as a plan", () => {
    assert.deepEqual(tapOutcome("planId", { payMethod: "insurance", planId: "medicare" }), {
      result: "screened_out",
      reason: "medicaid_medicare",
    });
  });

  it("screens out Yes to Medicaid or Medicare for self-pay, with the same screen-out", () => {
    assert.deepEqual(tapOutcome("medicaidOrMedicare", { payMethod: "self_pay", medicaidOrMedicare: "yes" }), {
      result: "screened_out",
      reason: "medicaid_medicare",
    });
    assert.equal(tapOutcome("medicaidOrMedicare", { payMethod: "self_pay", medicaidOrMedicare: "no" }), null);
  });

  it("ignores the self-pay answer once someone switches to insurance", () => {
    const answers: FitAnswers = { payMethod: "insurance", planId: "cigna", medicaidOrMedicare: "yes" };
    assert.equal(tapOutcome("planId", answers), null);
    assert.equal(partialOutcome(answers, TODAY), null);
  });

  it("screens out Yes to the hospital question", () => {
    assert.deepEqual(tapOutcome("hospital", { hospital: "yes" }), { result: "screened_out", reason: "hospital_stay" });
  });

  it("leaves the date of birth for Continue, even when another answer is tapped", () => {
    assert.equal(tapOutcome("inTexas", { dateOfBirth: "10/30/2008", inTexas: "yes" }), null);
  });
});

describe("each rule acting as soon as its answer is in", () => {
  it("goes straight to the crisis screen for safety, even with nothing else answered", () => {
    assert.deepEqual(partialOutcome({ safety: "yes" }, TODAY), { result: "crisis" });
  });

  it("screens out straight away for a hospital stay", () => {
    assert.deepEqual(partialOutcome({ hospital: "yes" }, TODAY), { result: "screened_out", reason: "hospital_stay" });
  });

  it("screens out straight away for Medicaid or Medicare on the insurance step", () => {
    for (const planId of ["medicaid", "medicare"]) {
      assert.deepEqual(partialOutcome({ payMethod: "insurance", planId }, TODAY), {
        result: "screened_out",
        reason: "medicaid_medicare",
      });
    }
  });

  it("screens out under 18 and No to Texas after the first step", () => {
    assert.deepEqual(partialOutcome({ dateOfBirth: "10/30/2008", inTexas: "yes" }, TODAY), {
      result: "screened_out",
      reason: "under_18",
    });
    assert.deepEqual(partialOutcome({ dateOfBirth: "05/14/1990", inTexas: "no" }, TODAY), {
      result: "screened_out",
      reason: "not_in_texas",
    });
  });

  it("lets someone carry on while nothing rules them out", () => {
    assert.equal(partialOutcome({ dateOfBirth: "05/14/1990", inTexas: "yes" }, TODAY), null);
    assert.equal(partialOutcome({ payMethod: "insurance", planId: "cigna" }, TODAY), null);
    assert.equal(partialOutcome({ safety: "no", hospital: "no" }, TODAY), null);
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
  });

  it("needs the Medicaid or Medicare answer when paying for themselves", () => {
    const answers: FitAnswers = { ...eligible, payMethod: "self_pay", planId: undefined };
    assert.equal(validateFacts(answers, TODAY).medicaidOrMedicare, "required");
  });

  it("asks people who don't see their plan to choose self-pay or talk to a person", () => {
    assert.equal(validateFacts({ ...eligible, planId: "not_listed" }, TODAY).planId, "plan_not_listed");
  });

  it("checks one step's questions at a time", () => {
    assert.deepEqual(validateFields(["dateOfBirth", "inTexas"], {}, TODAY), {
      dateOfBirth: "date_of_birth",
      inTexas: "required",
    });
    assert.deepEqual(validateFields(["safety", "hospital"], eligible, TODAY), {});
  });
});
