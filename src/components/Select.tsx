"use client";

import { cx } from "./cx";

// A labelled native select, so phones show their own picker. The placeholder
// is a first option that can't be chosen again
export type SelectProps = {
  id: string;
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
};

export function Select({ id, label, placeholder, options, value, onChange, error }: SelectProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-lg font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cx(
          "focus-ring mt-3 h-control rounded-lg border bg-white px-4 text-base text-ink",
          error ? "border-error" : "border-line-control",
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="mt-2 text-error">
          {error}
        </p>
      )}
    </div>
  );
}
