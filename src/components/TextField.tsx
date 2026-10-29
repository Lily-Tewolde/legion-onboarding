"use client";

import type { InputHTMLAttributes } from "react";
import { cx } from "./cx";

// A labelled text field with hint and error text under the label, on the same
// tokens as the other controls: 54px tall, 16px text, a 3:1 border
export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
};

export function TextField({ id, label, value, onChange, hint, error, className, ...rest }: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cx("flex flex-col", className)}>
      <label htmlFor={id} className="text-lg font-medium text-ink">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-slate">
          {hint}
        </p>
      )}
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={cx(hintId, errorId) || undefined}
        className={cx(
          "focus-ring mt-3 h-control rounded-lg border bg-white px-4 text-base text-ink",
          error ? "border-error" : "border-line-control",
        )}
        {...rest}
      />
      {error && (
        <p id={errorId} className="mt-2 text-error">
          {error}
        </p>
      )}
    </div>
  );
}
