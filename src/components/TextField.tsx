"use client";

import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { cx } from "./cx";
import { CheckCircleFilled } from "./icons";
import { FieldError } from "./SegmentedControl";

// The spec's input: 52px, 12px radius, a 1.5px border, and the label inside
// at the top (14px semibold). A valid typed answer gets the check at the
// right; an error gets a 2px red border and a message with an icon under it.
// With labelOutside, the label is a card's question above the field instead.
// With an icon, the label and the text both start after it
export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  id: string;
  ref?: Ref<HTMLInputElement>;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  valid?: boolean;
  icon?: ReactNode;
  labelOutside?: boolean;
  inputClassName?: string;
};

export function TextField({
  id,
  ref,
  label,
  value,
  onChange,
  hint,
  error,
  valid,
  icon,
  labelOutside = false,
  className,
  inputClassName,
  ...rest
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      {labelOutside && (
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={id} className="text-question font-semibold text-ink">
            {label}
          </label>
          {hint && (
            <span id={hintId} className="text-body text-slate">
              {hint}
            </span>
          )}
        </div>
      )}
      <div className={cx("relative", labelOutside && "mt-1")}>
        {!labelOutside && (
          <label
            htmlFor={id}
            className={cx("pointer-events-none absolute top-1.5 text-label leading-4 font-semibold text-slate", icon ? "left-11" : "left-4")}
          >
            {label}
          </label>
        )}
        {icon && <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate">{icon}</span>}
        <input
          ref={ref}
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(hintId, errorId) || undefined}
          className={cx(
            "focus-ring h-field w-full rounded-field bg-white pr-11 text-body-lg text-navy",
            labelOutside ? "px-4" : "pt-[22px] pb-1 pl-4",
            Boolean(icon) && "pl-11",
            "placeholder:text-slate disabled:border-dashed disabled:border-muted-line disabled:bg-muted",
            error ? "border-2 border-error" : "border-[1.5px] border-line-control hover:border-slate",
            inputClassName,
          )}
          {...rest}
        />
        {valid && !error && (
          <CheckCircleFilled size={22} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-action" />
        )}
      </div>
      {!labelOutside && hint && (
        <p id={hintId} className="text-body text-slate">
          {hint}
        </p>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
