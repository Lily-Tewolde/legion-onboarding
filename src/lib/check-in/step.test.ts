import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CrisisCheck } from "@/lib/crisis/check";
import { runCheckInTurn } from "./step";

const turn = (id: string, answer: string) => ({ id, question: "Q", answer, skipped: false });

// A crisis layer that fires on one phrase, and records what it was asked about
function deps(checked: string[]) {
  return {
    checkMessage: async (text: string): Promise<CrisisCheck> => {
      checked.push(text);
      const crisis = text.includes("hurts me");
      const kind = crisis ? ("being_harmed" as const) : null;
      return {
        crisis,
        kind,
        wordList: { hit: false },
        aiFlag: { ok: true, crisis, kind, reason: "test", usage: { inputTokens: 0, outputTokens: 0 } },
      };
    },
    nextQuestion: async () => ({ ok: false as const, failure: "api_error" as const, usage: null }),
    checkLimits: async () => ({ ok: true as const }),
    record: async () => {},
  };
}

describe("one check-in answer", () => {
  it("checks only the simple form's new answers, not ones checked earlier", async () => {
    const checked: string[] = [];
    const turns = [turn("m1", "My partner hurts me."), turn("m2", "Anxiety."), turn("m3", "Okay.")];
    const response = await runCheckInTurn({ turns, form: true, checkFrom: 1 }, deps(checked));
    assert.deepEqual(checked, ["Anxiety.", "Okay."]);
    assert.equal(response.result, "next");
  });

  it("stops for a crisis in a new answer, and only keeps going after I'm safe", async () => {
    const turns = [turn("m1", "Anxiety."), turn("m2", "My partner hurts me.")];
    const first = await runCheckInTurn({ turns }, deps([]));
    assert.deepEqual(first, { result: "crisis", kind: "being_harmed", source: "ai_flag", messageId: "m2" });
    const again = await runCheckInTurn({ turns, afterSafe: true }, deps([]));
    assert.equal(again.result, "fallback");
    assert.deepEqual(again.result === "fallback" && again.safetyFlags, [{ kind: "being_harmed", messageId: "m2" }]);
  });
});
