import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkMedicationName } from "./medications";

describe("the medication name check", () => {
  it("keeps a known name, generic or brand, in any case", () => {
    assert.deepEqual(checkMedicationName("sertraline"), { kind: "known", name: "Sertraline", mentalHealth: true });
    assert.deepEqual(checkMedicationName("ZOLOFT"), { kind: "known", name: "Zoloft", mentalHealth: true });
  });

  it("fixes only a one-letter typo that matches one drug: Adderal is Adderall (I-14)", () => {
    assert.deepEqual(checkMedicationName("Adderal"), { kind: "known", name: "Adderall", mentalHealth: true });
  });

  it("asks rather than fixes when it's more than one letter off: Seroqil (I-14)", () => {
    assert.deepEqual(checkMedicationName("Seroqil"), { kind: "did_you_mean", suggestion: "Seroquel" });
  });

  it("asks about a name heard by speech-to-text: sir tra lean (I-07)", () => {
    assert.deepEqual(checkMedicationName("sir tra lean"), { kind: "did_you_mean", suggestion: "Sertraline" });
  });

  it("knows Celebrex is a real drug, so it's never swapped for another (I-08)", () => {
    assert.deepEqual(checkMedicationName("Celebrex"), { kind: "known", name: "Celebrex", mentalHealth: false });
  });

  it("suggests nothing for a word that isn't near any drug", () => {
    assert.deepEqual(checkMedicationName("the blue one"), { kind: "unknown" });
    assert.deepEqual(checkMedicationName(""), { kind: "unknown" });
  });
});
