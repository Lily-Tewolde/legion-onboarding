"use client";

import { cx } from "./cx";

// Adapted from Inspo Book 01's switch: same track-and-thumb build, sized up
// from 18 x 10px to 44 x 26px, with the whole row as a 44px tap target
export type SwitchProps = {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
};

export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="focus-ring inline-flex min-h-control-sm cursor-pointer items-center gap-3 rounded-md text-left text-base text-ink"
    >
      <span
        aria-hidden="true"
        className={cx(
          "relative h-6.5 w-11 flex-none rounded-full transition-colors duration-150 motion-reduce:transition-none",
          checked ? "bg-action" : "bg-line-control",
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 left-0.5 size-5.5 rounded-full bg-white shadow-sm transition-transform duration-150 motion-reduce:transition-none",
            checked && "translate-x-4.5",
          )}
        />
      </span>
      {label}
    </button>
  );
}
