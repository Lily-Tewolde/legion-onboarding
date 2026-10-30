"use client";

import { type KeyboardEvent, useId, useRef } from "react";
import { cx } from "./cx";

// Two or more options side by side (Yes then No), on native radio inputs so
// arrow keys and form semantics come for free. Each option is 52px with a
// 12px radius; selected is a 2px blue border, the soft fill and bold. The
// question sits in the legend, with optional hint and error text.
// onChange says whether the choice was explicit: a tap or click, or Space or
// Enter on the option. Arrow keys only move the selection, so a question
// that acts on its answer (a screen-out, the crisis screen) waits for an
// explicit choice or Continue (code review finding 2, WCAG 3.2.2)
export type SegmentedControlProps = {
  legend: string;
  name: string;
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (value: string, how: { explicit: boolean }) => void;
  hint?: string;
  error?: string;
  // The question sits on its own as a card's heading
  legendClassName?: string;
};

export function SegmentedControl({ legend, name, options, value, onChange, hint, error, legendClassName }: SegmentedControlProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  // Set when an arrow key is what's changing the selection
  const arrowed = useRef(false);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>, option: string) => {
    if (event.key.startsWith("Arrow")) {
      arrowed.current = true;
      return;
    }
    // Space on an unselected option selects it natively, and that change is
    // explicit. On the selected one, or with Enter, nothing changes natively,
    // so it's chosen here (Enter would otherwise submit the form)
    if ((event.key === " " && event.currentTarget.checked) || event.key === "Enter") {
      event.preventDefault();
      onChange(option, { explicit: true });
    }
  };

  return (
    <fieldset aria-describedby={cx(hintId, errorId) || undefined} className="flex flex-col gap-3">
      <legend className={cx("mb-3 text-question font-semibold text-ink", legendClassName)}>{legend}</legend>
      {hint && (
        <p id={hintId} className="-mt-2 text-body text-slate">
          {hint}
        </p>
      )}
      <div className={cx("grid grid-cols-2", options.length > 2 ? "gap-2" : "gap-3")} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((option) => (
          <label key={option.value} className="flex">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onKeyDown={(event) => onKeyDown(event, option.value)}
              onChange={() => {
                const explicit = !arrowed.current;
                arrowed.current = false;
                onChange(option.value, { explicit });
              }}
              className="peer sr-only"
            />
            <span
              className={cx(
                "flex min-h-field flex-1 cursor-pointer items-center justify-center rounded-field text-center text-body-lg",
                // Three choices share a phone's width, so less padding and one line each
                options.length > 2 ? "px-2 whitespace-nowrap" : "px-4",
                "border-[1.5px] bg-white font-medium text-navy hover:border-action",
                error ? "border-error" : "border-line-control",
                "peer-checked:border-2 peer-checked:border-action peer-checked:bg-wash peer-checked:font-bold peer-checked:text-ink",
                "peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-action",
              )}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </fieldset>
  );
}

// The spec's error line under a field: an icon and words, never colour alone
export function FieldError({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} className="flex gap-1.5 text-label font-semibold text-error-text">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="mt-px flex-none text-error">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v5M12 16.5v.5" />
      </svg>
      {children}
    </p>
  );
}
