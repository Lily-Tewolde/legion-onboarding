import type { ReactNode } from "react";
import { cx } from "./cx";

// The spec's chip and option: a 44px pill with a 1.5px border. Selected is
// border, fill and bold, never a check inside. An optional icon sits in a
// 28px circle at the start. A toggle button with aria-pressed
export type ChipProps = {
  label: string;
  selected: boolean;
  onToggle: (next: boolean) => void;
  icon?: ReactNode;
  error?: boolean;
};

export function Chip({ label, selected, onToggle, icon, error }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onToggle(!selected)}
      className={cx(
        "focus-ring inline-flex min-h-control-sm cursor-pointer items-center gap-2 rounded-full text-body whitespace-nowrap",
        icon ? "pr-3 pl-2" : "px-4",
        selected
          ? "border-2 border-action bg-wash font-bold text-ink"
          : cx("border-[1.5px] bg-white font-medium text-navy hover:border-action active:bg-tint", error ? "border-error" : "border-line-control"),
      )}
    >
      {icon && (
        <span className={cx("flex size-7 flex-none items-center justify-center rounded-full text-brand", selected ? "bg-white" : "bg-wash")}>
          {icon}
        </span>
      )}
      {label}
    </button>
  );
}
