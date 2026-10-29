import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

// Adapted from Inspo Book 01: pill shape and control heights kept; colours
// swapped to Legion's darker blue; the rotating light ring left out to keep it calm
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  size?: "large" | "small";
  showIcon?: boolean;
  children: ReactNode;
};

const variants = {
  primary:
    "bg-action text-white border-action enabled:hover:bg-action-hover enabled:hover:border-action-hover",
  secondary:
    "bg-white text-ink border-line-control enabled:hover:border-ink",
};

const sizes = {
  large: "h-control px-7 font-medium",
  small: "h-control-sm px-6",
};

export function Button({
  variant = "primary",
  size = "large",
  showIcon = false,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "focus-ring inline-flex items-center justify-center gap-2.5 rounded-full border text-base whitespace-nowrap",
        "transition-colors duration-200 motion-reduce:transition-none",
        "cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
      {showIcon && <Arrow />}
    </button>
  );
}

const Arrow = () => (
  <svg
    className="size-4 flex-none"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);
