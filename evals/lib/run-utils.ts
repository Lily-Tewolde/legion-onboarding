import config from "../config.json";

// Small helpers shared by `npm run eval` and `npm run eval:grader-check`.
// Costs use the app's own price table (src/lib/ai/prices.ts)

export { costUsd } from "@/lib/ai/prices";

export type TokenTally = { inputTokens: number; outputTokens: number };

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
