import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

// From Claude Design's component spec: one primary button per screen (54px
// pill, 18px semibold, pinned to the bottom on phones), with the secondary
// action as a text-style button under it (17px semibold, 44px tap height,
// underlined on hover). The outline variant is for in-card choices like
// "Continue as self-pay". Pressed shrinks a touch (globals.css)
type Variant = "primary" | "secondary" | "text";
type Size = "large" | "small";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

const variants: Record<Variant, string> = {
  primary:
    "h-control rounded-full bg-action px-6 text-question font-semibold text-white hover:bg-action-hover active:bg-action-hover disabled:bg-line disabled:text-slate",
  secondary:
    "min-h-field rounded-full border-[1.5px] border-line-control bg-white px-5 text-body-lg font-semibold text-navy hover:border-action disabled:border-dashed disabled:border-muted-line disabled:bg-muted disabled:text-line-control",
  text: "min-h-control-sm px-2 text-body-lg font-semibold text-action hover:text-action-hover hover:underline hover:underline-offset-4 disabled:text-line-control",
};

// Small is for compact choices, like the visit rating's numbers: 44px tall
const small: Record<Variant, string> = {
  primary: "h-control-sm! px-5 text-body!",
  secondary: "min-h-control-sm! px-4 text-body!",
  text: "",
};

export const buttonClasses = (variant: Variant = "primary", size: Size = "large", className?: string) =>
  cx(
    "focus-ring inline-flex cursor-pointer items-center justify-center gap-2 text-center whitespace-nowrap",
    "disabled:cursor-not-allowed",
    variant === "text" && "rounded-lg",
    variants[variant],
    size === "small" && small[variant],
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
