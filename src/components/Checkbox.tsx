"use client";

import { type ReactNode, useId } from "react";
import { cx } from "./cx";
import { FieldError } from "./SegmentedControl";

// For yes-or-no choices inside the flow: "Tell me if an earlier time opens",
// the consent and "I'm safe right now". A native checkbox in the spec's
// colours: a 24px box in a 44px tap row, with optional error text. The label
// can hold a link, like "Read the consent"
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
    <div className="flex flex-col gap-1.5">
      <div className="flex min-h-control-sm items-start gap-3">
        <span className="relative mt-2.5 flex size-6 flex-none">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cx(
              "focus-ring peer size-6 cursor-pointer appearance-none rounded-md border-[1.5px] bg-white",
              "checked:border-action checked:bg-action",
              error ? "border-2 border-error" : "border-line-control hover:border-action",
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
        <label htmlFor={id} className="cursor-pointer py-2.5 text-body-lg text-navy">
          {label}
        </label>
      </div>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
