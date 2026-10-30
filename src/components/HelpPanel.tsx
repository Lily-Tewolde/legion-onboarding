"use client";

import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";
import { copy } from "@/copy";
import { Button } from "./Button";
import { cx } from "./cx";
import { InlineLink } from "./InlineLink";
import { Tag } from "./Tag";

// The "Talk to a person" panel, on every screen. The provider owns the panel;
// the header link and any screen's "Talk to a person" button open it with
// useHelpPanel(). A native <dialog>: it traps focus, closes on Escape and
// returns focus to whatever opened it. Focus starts on the title, so a screen
// reader reads from the top and Enter can't start a call by accident.
// Tapping outside the panel closes it too. Centred on larger screens; on
// phones it slides up from the bottom

const HelpPanelContext = createContext<{ open: () => void } | null>(null);

export function useHelpPanel() {
  const context = useContext(HelpPanelContext);
  if (!context) throw new Error("useHelpPanel must be inside HelpPanelProvider");
  return context;
}

export function HelpPanelProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const value = useMemo(
    () => ({
      open: () => {
        dialogRef.current?.showModal();
        titleRef.current?.focus();
      },
    }),
    [],
  );
  const close = () => dialogRef.current?.close();

  return (
    <HelpPanelContext.Provider value={value}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby="help-panel-title"
        onClick={(event) => event.target === dialogRef.current && close()}
        className={cx(
          "m-auto w-[calc(100%-2rem)] max-w-md rounded-card bg-white p-0 text-ink shadow-float backdrop:bg-navy/40",
          "max-sm:mb-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none",
          "max-sm:translate-y-full max-sm:open:translate-y-0 max-sm:starting:open:translate-y-full",
          "max-sm:transition-[translate,overlay,display] max-sm:transition-discrete max-sm:duration-200 max-sm:ease-out motion-reduce:transition-none",
        )}
      >
        <div className="flex flex-col gap-4 p-6">
          <h2
            id="help-panel-title"
            ref={titleRef}
            tabIndex={-1}
            className="text-2xl outline-none"
          >
            {copy.helpPanel.title}
          </h2>
          <div className="flex flex-col gap-1">
            <p>
              <InlineLink
                text={copy.helpPanel.phone}
                label={copy.helpPanel.phoneNumber}
                href="tel:+15550100123"
              />
            </p>
            <div>
              <Tag>{copy.helpPanel.phoneLabel}</Tag>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p>{copy.helpPanel.hours}</p>
            <div>
              <Tag>{copy.helpPanel.hoursLabel}</Tag>
            </div>
          </div>
          <p className="rounded-lg bg-wash px-4 py-3 font-medium text-navy">
            <InlineLink
              text={copy.helpPanel.crisis}
              label={copy.helpPanel.crisisNumber}
              href="tel:988"
            />
          </p>
          <Button variant="secondary" onClick={close} className="self-start">
            {copy.helpPanel.close}
          </Button>
        </div>
      </dialog>
    </HelpPanelContext.Provider>
  );
}

// The header's help link
export function HelpLink() {
  const { open } = useHelpPanel();
  return (
    <button
      type="button"
      onClick={open}
      className="focus-ring min-h-control-sm cursor-pointer rounded-md px-2 text-base font-medium text-action underline underline-offset-4 hover:text-action-hover"
    >
      {copy.shell.helpLink}
    </button>
  );
}

// A "Talk to a person" button inside a screen: text-style, or the screen's
// primary button when it's the main way forward
export function TalkToPersonButton({ label, variant = "text" }: { label: string; variant?: "primary" | "text" }) {
  const { open } = useHelpPanel();
  return (
    <Button variant={variant} onClick={open}>
      {label}
    </Button>
  );
}
