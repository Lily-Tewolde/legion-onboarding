"use client";

import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";
import { copy } from "@/copy";
import { screenOf } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { Button } from "./Button";
import { Chat } from "./icons";
import { InlineLink } from "./InlineLink";
import { Sheet, type SheetHandle } from "./Sheet";

// The "Talk to a person" panel, on every screen: a sheet on phones and a
// dialog on wider screens. The provider owns the panel; the header link and
// any screen's "Talk to a person" button open it with useHelpPanel()

const HelpPanelContext = createContext<{ open: () => void } | null>(null);

export function useHelpPanel() {
  const context = useContext(HelpPanelContext);
  if (!context) throw new Error("useHelpPanel must be inside HelpPanelProvider");
  return context;
}

export function HelpPanelProvider({ children }: { children: ReactNode }) {
  const sheet = useRef<SheetHandle>(null);

  const value = useMemo(
    () => ({
      open: () => {
        track("portal.help.clicked", { screen: screenOf(window.location.pathname) });
        sheet.current?.open();
      },
    }),
    [],
  );

  return (
    <HelpPanelContext.Provider value={value}>
      {children}
      <Sheet ref={sheet} title={copy.helpPanel.title} titleId="help-panel-title">
        <p className="text-body-lg">
          <InlineLink text={copy.helpPanel.phone} label={copy.helpPanel.phoneNumber} href="tel:+15550100123" />
        </p>
        <p className="text-body-lg">{copy.helpPanel.hours}</p>
        <p className="rounded-tile bg-tint px-4 py-3 text-body-lg">
          <InlineLink text={copy.helpPanel.crisis} label={copy.helpPanel.crisisNumber} href="tel:988" />
        </p>
        <Button className="w-full" onClick={() => sheet.current?.close()}>
          {copy.helpPanel.close}
        </Button>
        <p className="text-center text-label text-slate">{copy.helpPanel.demo}</p>
      </Sheet>
    </HelpPanelContext.Provider>
  );
}

// The top bar's help link, with its speech-bubble icon
export function HelpLink() {
  const { open } = useHelpPanel();
  return (
    <button
      type="button"
      onClick={open}
      className="focus-ring inline-flex min-h-control-sm cursor-pointer items-center gap-1.5 rounded-full px-3 text-body font-semibold text-action hover:text-action-hover md:gap-2 md:px-2"
    >
      <Chat size={20} />
      {copy.shell.helpLink}
    </button>
  );
}

// A "Talk to a person" button inside a screen: text-style, or the screen's
// primary button when it's the main way forward
export function TalkToPersonButton({
  label,
  variant = "text",
  className,
}: {
  label: string;
  variant?: "primary" | "text";
  className?: string;
}) {
  const { open } = useHelpPanel();
  return (
    <Button variant={variant} onClick={open} className={className}>
      {label}
    </Button>
  );
}
