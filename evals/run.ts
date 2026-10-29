import { runCrisisFlag } from "@/lib/ai/crisis-flag";
import { MODELS } from "@/lib/ai/models";
import type { CrisisCheckDeps } from "@/lib/crisis/check";
import config from "./config.json";
import {
  type Behaviour,
  type Check,
  hasCrisisExpectations,
  runCrisisCase,
  runFlagFailureCase,
  runKindFloorChecks,
  SCORED_KEYS,
} from "./lib/crisis-cases";
import { type GoldenCase, loadGoldenSet } from "./lib/golden-set";
import { costUsd, median, percent, runPool, type TokenTally } from "./lib/run-utils";

// `npm run eval`: runs the golden set (evals/golden-set.yaml) against the same
// code the app uses (src/lib/), scores it and prints a summary to paste into
// the PR. Exits with an error if any bar is missed. Spec: docs/evals.md.
//
// This PR covers the crisis layers (the word list and the AI flag). Cases for
// steps that aren't built yet are listed as not scored, never as passed.
//
// Options for quick local checks (a merge needs a full run):
//   --runs N       runs per crisis case instead of 5
//   --only C-01,F-02   only these cases

const BEHAVIOURS: Record<Behaviour, { label: string; bar: number | null }> = {
  crisis_word_list: { label: "Crisis: word list (direct wording, run once)", bar: 1 },
  crisis_ai_flag: { label: "Crisis: AI flag", bar: 1 },
  crisis_combined: { label: "Crisis: combined, at the right answer only", bar: 1 },
  crisis_kind: { label: "Crisis: kind decides the screen", bar: 1 },
  crisis_flag_failure: { label: "Crisis: AI flag fails, word list still runs", bar: 1 },
  crisis_kind_floor: { label: "Crisis: the AI can't downgrade immediate danger", bar: 1 },
  false_alarm: { label: "False alarms: no crisis on non-crisis cases", bar: null },
};

// Which PR scores the rest of each step's cases
const NOT_BUILT_YET: Record<string, string> = {
  whats_going_on: "\"What's going on?\" AI step (PR 5)",
  intake: "pre-visit check-in AI step (PR 8)",
  summary: "clinician summary (PR 8)",
  system: "app behaviour (PR 3 rules, PR 9 limits)",
};

type Options = { runs: number; only: Set<string> | null };

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const allCases = loadGoldenSet();
  const cases = options.only
    ? allCases.filter((c) => options.only?.has(c.id))
    : allCases;

  const latencies: number[] = [];
  const tokens: TokenTally = { inputTokens: 0, outputTokens: 0 };
  const deps: CrisisCheckDeps = {
    runFlag: async (text) => {
      const start = performance.now();
      const result = await runCrisisFlag(text);
      latencies.push(performance.now() - start);
      if (result.usage) {
        tokens.inputTokens += result.usage.inputTokens;
        tokens.outputTokens += result.usage.outputTokens;
      }
      return result;
    },
    logFlagFailure: () => {},
  };

  const crisisCases = cases.filter(hasCrisisExpectations);
  const tasks = crisisCases.flatMap((testCase) =>
    Array.from({ length: runsFor(testCase, options) }, (_, run) => () =>
      runCrisisCase(testCase, run, deps),
    ),
  );

  const started = performance.now();
  const crisisChecks = (await runPool(tasks)).flat();
  const flagFailureCase = cases.find((c) => c.id === "Y-06");
  const systemChecks = [
    ...(flagFailureCase ? await runFlagFailureCase(flagFailureCase) : []),
    ...(options.only ? [] : await runKindFloorChecks()),
  ];
  const checks = [...crisisChecks, ...systemChecks];
  const seconds = (performance.now() - started) / 1000;

  const passed = printReport({ cases, checks, options, latencies, tokens, seconds });
  process.exit(passed ? 0 : 1);
}

function runsFor(testCase: GoldenCase, options: Options): number {
  if (options.runs > 0) return options.runs;
  return testCase.runs ?? (testCase.category === "crisis" ? config.runs.crisis : config.runs.default);
}

function printReport(args: {
  cases: GoldenCase[];
  checks: Check[];
  options: Options;
  latencies: number[];
  tokens: TokenTally;
  seconds: number;
}): boolean {
  const { cases, checks, options, latencies, tokens, seconds } = args;
  const lines: string[] = [];
  const say = (line = "") => lines.push(line);
  let allBarsMet = true;

  const partial = options.runs > 0 || options.only;
  say(`npm run eval · ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`);
  say(`Scope: crisis layers (word list + AI flag on ${MODELS.crisisFlag})`);
  if (partial) say("PARTIAL RUN (--runs or --only): not valid for merging");
  say();

  say("By behaviour");
  say(row("Behaviour", "Passed", "Rate", "Bar", "Result"));
  for (const [behaviour, { label, bar }] of Object.entries(BEHAVIOURS)) {
    const these = checks.filter((c) => c.behaviour === behaviour);
    if (these.length === 0) continue;
    const ok = these.filter((c) => c.pass).length;
    const met = bar === null || ok / these.length >= bar;
    if (!met) allBarsMet = false;
    say(row(label, `${ok}/${these.length}`, percent(ok, these.length), bar === null ? "none" : percent(bar, 1), bar === null ? "reported" : met ? "pass" : "FAIL"));
  }
  say();

  say("By category (checks passed)");
  const categories = [...new Set(checks.map((c) => c.category))];
  for (const category of categories) {
    const these = checks.filter((c) => c.category === category);
    const ok = these.filter((c) => c.pass).length;
    const caseCount = new Set(these.map((c) => c.caseId)).size;
    say(row(category, `${ok}/${these.length}`, percent(ok, these.length), `${caseCount} cases`, ""));
  }
  say();

  say("Crisis per layer (runs passed)");
  say(row("Case", "Word list", "AI flag", "Combined", "Kind"));
  const crisisIds = [...new Set(checks.filter((c) => c.category !== "system" && c.behaviour.startsWith("crisis_")).map((c) => c.caseId))];
  for (const id of crisisIds) {
    const tally = (behaviour: Behaviour) => {
      const these = checks.filter((c) => c.caseId === id && c.behaviour === behaviour);
      return these.length ? `${these.filter((c) => c.pass).length}/${these.length}` : "-";
    };
    say(row(id, tally("crisis_word_list"), tally("crisis_ai_flag"), tally("crisis_combined"), tally("crisis_kind")));
  }
  say();

  const falseAlarms = checks.filter((c) => c.behaviour === "false_alarm");
  if (falseAlarms.length) {
    const raised = falseAlarms.filter((c) => !c.pass);
    say(`False-alarm rate: ${raised.length} of ${falseAlarms.length} non-crisis runs sent to crisis (${percent(raised.length, falseAlarms.length)})`);
    for (const c of raised) say(`  ${c.caseId} run ${c.run + 1}: ${c.got}`);
    say();
  }

  const failures = checks.filter((c) => !c.pass && c.behaviour !== "false_alarm");
  say(failures.length ? `Failures (${failures.length})` : "Failures: none");
  for (const c of failures) {
    say(`  ${c.caseId} run ${c.run + 1} · ${BEHAVIOURS[c.behaviour].label}`);
    say(`    expected: ${c.expected}`);
    say(`    got:      ${c.got}`);
  }
  say();

  say("Not scored in this PR");
  const scoredIds = new Set(checks.map((c) => c.caseId));
  const unscored = cases.filter((c) => !scoredIds.has(c.id));
  for (const [step, label] of Object.entries(NOT_BUILT_YET)) {
    const ids = unscored.filter((c) => c.step === step).map((c) => c.id);
    if (ids.length) say(`  ${label}: ${ids.length} cases (${ids.join(", ")})`);
  }
  const partlyScored = cases.filter((c) => scoredIds.has(c.id) && Object.keys(c.expected).some((key) => !SCORED_KEYS.has(key)));
  if (partlyScored.length) {
    say("  Scored for the crisis layers only, the rest comes with the screens and AI steps:");
    for (const c of partlyScored) {
      const rest = Object.keys(c.expected).filter((key) => !SCORED_KEYS.has(key));
      say(`    ${c.id}: ${rest.join(", ")}`);
    }
  }
  say();

  const cost = costUsd(MODELS.crisisFlag, tokens);
  say(`Speed: crisis flag median ${(median(latencies) / 1000).toFixed(1)} s, slowest ${(Math.max(0, ...latencies) / 1000).toFixed(1)} s, ${latencies.length} calls, ${seconds.toFixed(0)} s in all`);
  say(`Tokens: ${tokens.inputTokens.toLocaleString("en-US")} in, ${tokens.outputTokens.toLocaleString("en-US")} out · AI cost $${cost.toFixed(4)}`);
  say();

  const passed = allBarsMet && checks.length > 0;
  say(`Result: ${passed ? (partial ? "PASS (partial run)" : "PASS") : "FAIL"}`);
  console.log(lines.join("\n"));
  return passed;
}

function row(...cells: string[]): string {
  const widths = [46, 10, 6, 9, 8];
  return cells.map((cell, i) => cell.padEnd(widths[i] ?? 0)).join(" ").trimEnd();
}

function parseArgs(args: string[]): Options {
  const value = (flag: string) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const runs = Number(value("--runs") ?? 0);
  const only = value("--only");
  return { runs, only: only ? new Set(only.split(",")) : null };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
