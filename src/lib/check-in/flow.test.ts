import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { afterAnswer } from "./flow";
import { emptyCheckIn } from "./stored";

const turn = (id: string, answer: string, skipped = false) => ({ id, question: "Q", answer, skipped });
const ask = (question: string, extra = {}) => ({
  result: "next" as const,
  safetyFlags: [],
  status: "ask" as const,
  question,
  inlineNote: null,
  eligibilityFlags: [],
  ...extra,
});

describe("the check-in flow", () => {
  it("shows the gentle note once, after two skips in a row (I-03)", () => {
    let state = emptyCheckIn("Alex Rivera, PMHNP");
    const skips = [turn("m1", "", true), turn("m2", "", true), turn("m3", "", true), turn("m4", "", true)];
    const notes = skips.map((_, i) => {
      ({ state } = afterAnswer(state, skips.slice(0, i + 1), ask(`Q${i + 2}`)));
      return state.note;
    });
    assert.deepEqual(notes, [null, "two_skips", null, null]);
  });

  it("keeps a crisis answer waiting and sends the patient to the right screen", () => {
    const { state, effect } = afterAnswer(emptyCheckIn(), [turn("m1", "x"), turn("m2", "My partner hurts me")], {
      result: "crisis",
      kind: "being_harmed",
      source: "ai_flag",
      messageId: "m2",
    });
    assert.deepEqual(effect, { to: "crisis", path: "/help-now/being-hurt" });
    assert.deepEqual(state.pending?.map((t) => t.id), ["m1", "m2"]);
    assert.equal(state.turns.length, 0);
    assert.deepEqual(state.flags, [{ kind: "being_harmed", messageId: "m2" }]);
  });

  it("stops for under 18 and keeps the flag for the clinician (I-06)", () => {
    const { state } = afterAnswer(emptyCheckIn(), [turn("m1", "I'm 17")], {
      ...ask("", { status: "stop", question: null, eligibilityFlags: [{ type: "age", message_id: "m1" }] }),
    });
    assert.equal(state.stage, "stopped");
    assert.deepEqual(state.flags, [{ kind: "age", messageId: "m1" }]);
  });

  it("shows the calm note and carries on after another eligibility surprise (I-05)", () => {
    const { state } = afterAnswer(emptyCheckIn(), [turn("m1", "I'm on Medicaid now")], {
      ...ask("How have you been feeling?", { eligibilityFlags: [{ type: "insurance", message_id: "m1" }] }),
    });
    assert.equal(state.stage, "questions");
    assert.equal(state.note, "eligibility");
    assert.equal(state.question, "How have you been feeling?");
  });

  it("switches to the simple form on a fallback, keeping the answers so far", () => {
    const { state } = afterAnswer(emptyCheckIn(), [turn("m1", "ADHD")], {
      result: "fallback",
      reason: "timeout",
      safetyFlags: [],
    });
    assert.equal(state.form, true);
    assert.equal(state.turns.length, 1);
  });
});
