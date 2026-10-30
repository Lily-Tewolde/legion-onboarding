import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyMedicationAnswer, parseSummary, removeIdNumbers } from "./check-in-summary";

const turns = [
  { id: "m1", question: "Q1", answer: "Anxiety mostly.", skipped: false },
  { id: "m2", question: "Q2", answer: "", skipped: true },
  { id: "m3", question: "Q3", answer: "I take sir tra lean, 50 milligrams.", skipped: false },
];
const empty = { flags: [], main_concern: [], whats_been_happening: [], past_care: [], medications: [], sleep: [], other_health: [], goals: [], unclear: [] };
const medication = { name: null, name_as_said: "sir tra lean", dose: "50 mg", details: null, status: "taking", cites: ["m3"] };

describe("the clinician summary", () => {
  it("rejects a line that cites a skipped or missing answer", () => {
    assert.equal(parseSummary({ ...empty, sleep: [{ text: "Sleeps badly", cites: ["m2"] }] }, turns), null);
    assert.equal(parseSummary({ ...empty, sleep: [{ text: "Sleeps badly", cites: ["m7"] }] }, turns), null);
  });

  it("points a quote at the answer it came from, and drops one the patient never said", () => {
    const summary = parseSummary(
      { ...empty, main_concern: [{ quote: "Anxiety mostly.", cites: ["m3"] }], unclear: [{ quote: "no allergies", cites: ["m1"] }] },
      turns,
    );
    assert.deepEqual(summary?.main_concern, [{ quote: "Anxiety mostly.", cites: ["m1"] }]);
    assert.deepEqual(summary?.unclear, []);
  });

  it("keeps a misheard name as heard, unclear, and asks the patient (I-07)", () => {
    const [med] = parseSummary({ ...empty, medications: [medication] }, turns)?.medications ?? [];
    assert.deepEqual([med.name, med.status, med.question], [null, "unclear", { kind: "did_you_mean", suggestion: "Sertraline" }]);
  });

  it("takes the name only when the patient says yes, and notes they confirmed it (I-13)", () => {
    const [med] = parseSummary({ ...empty, medications: [medication] }, turns)?.medications ?? [];
    const confirmed = applyMedicationAnswer(med, { kind: "accept_suggestion" });
    assert.deepEqual([confirmed.name, confirmed.status, confirmed.confirmed_by_patient], ["Sertraline", "taking", true]);
    assert.equal(applyMedicationAnswer(med, { kind: "keep" }).name, null);
  });

  it("asks to check a real drug that doesn't fit, and suggests nothing (I-08)", () => {
    const celebrex = { ...medication, name_as_said: "Celebrex", dose: null, status: "unclear" };
    const [med] = parseSummary({ ...empty, medications: [celebrex] }, turns)?.medications ?? [];
    assert.deepEqual([med.name, med.status, med.question], ["Celebrex", "unclear", { kind: "check_name" }]);
  });

  it("removes ID and card numbers before the AI sees them (P-01)", () => {
    assert.equal(
      removeIdNumbers("My SSN is 000-12-3456 and my card is 4000 0000 0000 0002."),
      "My SSN is [number removed] and my card is [number removed].",
    );
  });
});
