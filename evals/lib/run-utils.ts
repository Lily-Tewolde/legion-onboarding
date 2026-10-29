import config from "../config.json";

// Small helpers shared by `npm run eval` and `npm run eval:grader-check`

type Model = keyof typeof config.prices.usd_per_million_tokens;

export type TokenTally = { inputTokens: number; outputTokens: number };

// Cost from the token counts the API returns and the price table in
// evals/config.json
export function costUsd(model: Model, tokens: TokenTally): number {
  const price = config.prices.usd_per_million_tokens[model];
  return (
    (tokens.inputTokens * price.input + tokens.outputTokens * price.output) /
    1_000_000
  );
}

// Runs tasks with at most `limit` in flight, keeping results in order
export async function runPool<T>(
  tasks: (() => Promise<T>)[],
  limit = config.concurrency,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const index = next++;
      results[index] = await tasks[index]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

export const percent = (passed: number, total: number) =>
  total === 0 ? "-" : `${Math.round((passed / total) * 100)}%`;
