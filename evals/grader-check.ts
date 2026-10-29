import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { MODELS } from "@/lib/ai/models";
import config from "./config.json";
import { grade, type Grade, type RubricType } from "./lib/grader";
import { costUsd, percent, runPool } from "./lib/run-utils";

// `npm run eval:grader-check`: runs the grader on the 10 cases in
// evals/grader-check.yaml and compares its verdicts with Lily's blind scores.
// Fails on fewer than 9 of 10 agreeing, or any disagreement on a safety item
// (advice, diagnosis, crisis). Spec: docs/evals.md, section 4.

type GraderCase = {
  id: string;
  type: RubricType;
  transcript: { id: string; text: string }[];
  output: unknown;
  lily_score: "pass" | "fail";
};

async function main() {
  const { cases }: { cases: GraderCase[] } = parse(
    readFileSync("evals/grader-check.yaml", "utf8"),
  );
  const unscored = cases.filter((c) => c.lily_score !== "pass" && c.lily_score !== "fail");
  if (unscored.length) {
    console.error(`Lily hasn't scored: ${unscored.map((c) => c.id).join(", ")}`);
    process.exit(1);
  }

  const grades: Grade[] = await runPool(
    cases.map((c) => () => grade({ rubric: c.type, transcript: c.transcript, output: c.output })),
  );

  const safetyItems = new Set(config.grader_check.safety_items);
  const rows = cases.map((c, i) => ({
    id: c.id,
    type: c.type,
    lily: c.lily_score,
    grader: grades[i].verdict,
    agree: c.lily_score === grades[i].verdict,
    safety: safetyItems.has(c.id),
    reason: grades[i].reason,
  }));

  const agreed = rows.filter((r) => r.agree).length;
  const safetyMisses = rows.filter((r) => r.safety && !r.agree);
  const tokens = grades.reduce(
    (sum, g) => ({
      inputTokens: sum.inputTokens + g.tokens.inputTokens,
      outputTokens: sum.outputTokens + g.tokens.outputTokens,
    }),
    { inputTokens: 0, outputTokens: 0 },
  );

  const lines = [
    `npm run eval:grader-check · ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`,
    `Grader: ${MODELS.grader}`,
    "",
    ["Case", "Type", "Lily", "Grader", "Agree", "Safety"].map((h, i) => h.padEnd([6, 10, 6, 7, 6, 6][i])).join(" "),
    ...rows.map((r) =>
      [r.id, r.type, r.lily, r.grader, r.agree ? "yes" : "NO", r.safety ? "yes" : ""]
        .map((cell, i) => cell.padEnd([6, 10, 6, 7, 6, 6][i]))
        .join(" ")
        .trimEnd(),
    ),
    "",
    "Grader's reasons",
    ...rows.map((r) => `  ${r.id}: ${r.reason}`),
    "",
    `Agreement: ${agreed}/${rows.length} (${percent(agreed, rows.length)}), bar ${config.grader_check.min_agreement}/10`,
    `Safety items (${config.grader_check.safety_items.join(", ")}): ${safetyMisses.length ? `DISAGREES on ${safetyMisses.map((r) => r.id).join(", ")}` : "all agree"}`,
    `Tokens: ${tokens.inputTokens.toLocaleString("en-US")} in, ${tokens.outputTokens.toLocaleString("en-US")} out · AI cost $${costUsd(MODELS.grader, tokens).toFixed(4)}`,
  ];
  const passed = agreed >= config.grader_check.min_agreement && safetyMisses.length === 0;
  lines.push("", `Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(lines.join("\n"));
  process.exit(passed ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
