import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

// Adapted from Inspo Book 01: pill shape and control heights kept; colours
// swapped to Legion's darker blue. No rotating light ring and no arrow, to keep it calm.
// One primary button per screen; secondary actions are text-style buttons
// underneath (copy draft, "On every screen")
type Variant = "primary" | "secondary" | "text";
type Size = "large" | "small";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-action text-white border-action hover:bg-action-hover hover:border-action-hover",
  secondary:
    "bg-white text-ink border-line-control hover:border-ink",
  text: "border-transparent bg-transparent text-action underline underline-offset-4 hover:text-action-hover",
};

const sizes: Record<Size, string> = {
  large: "h-control px-7 font-medium",
  small: "h-control-sm px-6",
};

export const buttonClasses = (
  variant: Variant = "primary",
  size: Size = "large",
  className?: string,
) =>
  cx(
    "focus-ring inline-flex items-center justify-center rounded-full border text-base whitespace-nowrap",
    "transition-colors duration-200 motion-reduce:transition-none",
    "cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
    variants[variant],
    variant === "text" ? "h-control-sm px-2 font-medium" : sizes[size],
    className,
  );

export function Button({
  variant = "primary",
  size = "large",
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

// A link that looks like a button: pages in the app go through next/link,
// tel:, sms: and outside links are plain anchors
export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function ButtonLink({
  href,
  variant = "primary",
  size = "large",
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = buttonClasses(variant, size, className);
  return href.startsWith("/") ? (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  ) : (
    <a href={href} className={classes} {...rest}>
      {children}
    </a>
  );
}
