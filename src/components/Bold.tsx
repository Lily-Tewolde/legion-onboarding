import { Fragment } from "react";

// Sets the numbers people need in bold inside a sentence from the copy, like
// "911" in "If you're in immediate danger, call 911.", the way the boards do.
// Only the first time each appears, so "the 988 Suicide & Crisis Lifeline"
// stays plain. The sentence stays whole in the copy
export function Bold({ text, words }: { text: string; words: readonly string[] }) {
  const seen = new Set<string>();
  const pattern = new RegExp(`(${words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`);
  return (
    <>
      {text.split(pattern).map((part, i) =>
        words.includes(part) && !seen.has(part) && seen.add(part) ? (
          <strong key={i} className="font-bold whitespace-nowrap">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
