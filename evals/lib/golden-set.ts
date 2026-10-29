import { readFileSync } from "node:fs";
import { parse } from "yaml";

// Loads evals/golden-set.yaml (Lily's cases; spec in docs/evals.md). The
// harness reads it as it is and never edits it

export type ScriptedInput = {
  answers: string[];
  after_crisis_screen?: string;
  answers_after_continue?: string[];
};

export type GoldenCase = {
  id: string;
  category: string;
  step: string;
  input: string | ScriptedInput;
  expected: Record<string, unknown>;
  scoring: string[];
  runs?: number;
};

export function loadGoldenSet(path = "evals/golden-set.yaml"): GoldenCase[] {
  const file: { cases: GoldenCase[] } = parse(readFileSync(path, "utf8"));
  return file.cases;
}

// Every patient message in a case, in order: one for a single answer, or each
// scripted answer, including the ones given after "I'm safe right now"
export function messagesOf(input: GoldenCase["input"]): string[] {
  if (typeof input === "string") return [input];
  return [...input.answers, ...(input.answers_after_continue ?? [])];
}
