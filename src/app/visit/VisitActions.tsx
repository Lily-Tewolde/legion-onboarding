"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { cx } from "@/components/cx";
import { ChevronDown } from "@/components/icons";
import { FieldError } from "@/components/SegmentedControl";
import { Sheet, type SheetHandle } from "@/components/Sheet";
import { copy } from "@/copy";

// "Reschedule" and "Cancel visit" as text-style buttons (decided Oct 29).
// Reschedule opens the provider screen, which shows Legion's 48-hour policy
// before the new time books. Cancel asks first, with the same policy, in a
// sheet on phones and a dialog on desktop
export function VisitActions() {
  const router = useRouter();
  const sheet = useRef<SheetHandle>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const cancel = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch("/api/visit/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) throw new Error(`cancel failed: ${response.status}`);
      const { path } = await response.json();
      sheet.current?.close();
      router.push(path);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  return (
    <div className="-ml-2 flex flex-wrap gap-x-2">
      <ButtonLink href="/join/provider" variant="text">
        {copy.visit.reschedule}
      </ButtonLink>
      <Button variant="text" onClick={() => sheet.current?.open()}>
        {copy.visit.cancel}
      </Button>
      <Sheet ref={sheet} title={copy.visit.cancelCheck} titleId="cancel-check-title" onClose={() => setBusy(false)}>
        <p className="text-body-lg">{copy.checkout.cancelPolicy}</p>
        {failed && (
          <div role="alert">
            <FieldError>{copy.common.somethingWentWrong}</FieldError>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <Button onClick={cancel} disabled={busy} className="w-full">
            {copy.visit.cancelYes}
          </Button>
          <Button variant="text" onClick={() => sheet.current?.close()}>
            {copy.visit.keep}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

// "What to expect", opening in place with the spec's height animation
export function WhatToExpect({ aside }: { aside?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:border-t md:border-line md:pt-2">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="what-to-expect"
          onClick={() => setOpen(!open)}
          className="focus-ring flex min-h-control-sm cursor-pointer items-center gap-1 rounded-lg text-left text-body font-semibold text-action md:w-full md:justify-between md:text-ink"
        >
          {copy.visit.expectTitle}
          <ChevronDown size={20} className={cx("text-action transition-transform duration-300", open && "rotate-180")} />
        </button>
        {aside}
      </div>
      {open && (
        <div id="what-to-expect" className="expand">
          <p className="text-body text-navy">{copy.visit.expect}</p>
        </div>
      )}
    </div>
  );
}
