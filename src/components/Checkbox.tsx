"use client";

import { useId, type ReactNode } from "react";
import { cx } from "./cx";

// For yes-or-no choices inside the flow: "Tell me if an earlier time opens",
// the consent and "I'm safe right now". A native checkbox drawn in Legion's
// colours: a 24px box in a 44px tap row, with optional error text.
// The label can hold a link, like "Read the consent"
export type CheckboxProps = {
  label: ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
  error?: string;
};

export function Checkbox({ label, checked, onChange, error }: CheckboxProps) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <div className="flex min-h-control-sm items-center gap-3">
        <span className="relative flex size-6 flex-none">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cx(
              "focus-ring peer size-6 cursor-pointer appearance-none rounded-sm border-2 bg-white",
              "transition-colors duration-150 motion-reduce:transition-none",
              "checked:border-action checked:bg-action",
              error ? "border-error" : "border-line-control hover:border-ink",
            )}
          />
          <svg
            className="pointer-events-none absolute inset-0 m-auto hidden size-4 text-white peer-checked:block"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        </span>
        <label htmlFor={id} className="cursor-pointer py-2.5 text-base text-ink">
          {label}
        </label>
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-error">
          {error}
        </p>
      )}
    </div>
  );
}
