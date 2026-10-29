"use client";

import { useId } from "react";
import { cx } from "./cx";

// Adapted from Inspo Book 01's segmented control, rebuilt on native radio
// inputs so arrow keys and form semantics come for free. Segments are 54px
// tall. The question sits in the legend, with optional hint and error text
export type SegmentedControlProps = {
  legend: string;
  name: string;
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
};

export function SegmentedControl({
  legend,
  name,
  options,
  value,
  onChange,
  hint,
  error,
}: SegmentedControlProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <fieldset aria-describedby={cx(hintId, errorId) || undefined}>
      <legend className="text-lg font-medium text-ink">{legend}</legend>
      {hint && (
        <p id={hintId} className="mt-1 text-slate">
          {hint}
        </p>
      )}
      <div
        className={cx(
          "mt-3 flex gap-0.5 rounded-lg border bg-white p-0.5",
          error ? "border-error" : "border-line-control",
        )}
      >
        {options.map((option) => (
          <label key={option.value} className="flex-1">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span
              className={cx(
                "flex h-control cursor-pointer items-center justify-center rounded-md px-4 text-center text-base text-ink",
                "transition-colors duration-150 motion-reduce:transition-none hover:bg-wash",
                "peer-checked:bg-wash peer-checked:font-medium peer-checked:text-navy peer-checked:shadow-[inset_0_0_0_1px_var(--color-action)]",
                "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-action",
              )}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
