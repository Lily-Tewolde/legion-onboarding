import type { Usage } from "./crisis-flag";
import { MODELS } from "./models";

// Standard prices per million tokens, from
// https://platform.claude.com/docs/en/about-claude/pricing (checked Oct 29).
// Used for the demo's daily spending cap and the eval reports, from the token
// counts each call returns. Haiku's price is for prompts up to 100,000 tokens;
// ours are about 1,000
const USD_PER_MILLION = {
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-opus-5-5": { input: 4, output: 20 },
} as const satisfies Record<(typeof MODELS)[keyof typeof MODELS], { input: number; output: number }>;

export type PricedModel = keyof typeof USD_PER_MILLION;

export function costUsd(model: PricedModel, usage: Usage): number {
  const price = USD_PER_MILLION[model];
  return (usage.inputTokens * price.input + usage.outputTokens * price.output) / 1_000_000;
}
