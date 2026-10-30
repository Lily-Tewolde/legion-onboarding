"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { copy } from "@/copy";
import { track } from "@/lib/analytics/track";
import { Button } from "./Button";
import { cx } from "./cx";
import { FieldError } from "./SegmentedControl";
import { Sliders } from "./icons";
import { Sheet, type SheetHandle } from "./Sheet";

// Claude Design's DemoControls: a small "Demo controls" button on every
// portal and clinician screen (in the title row on phones, pinned bottom left
// on desktop), opening a sheet on phones and a dialog on desktop with "Mark
// visit completed", "Mark no-show" and a switch between the patient portal
// and the clinician view. Demo only

type Outcome = "completed" | "no_show";

export function DemoControls({ intakeDone, view = "patient" }: { intakeDone: boolean; view?: "patient" | "clinician" }) {
  const router = useRouter();
  const pathname = usePathname();
  const sheet = useRef<SheetHandle>(null);
  const [marked, setMarked] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const mark = async (outcome: Outcome) => {
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch("/api/demo/outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      });
      if (!response.ok) throw new Error(`outcome failed: ${response.status}`);
      // The north-star event, with whether the check-in was done
      if (outcome === "completed") track("portal.visit.completed", { intake_done: intakeDone });
      else track("portal.visit.no_show");
      setMarked(outcome);
      router.refresh();
      // The portal shows the outcome itself, and the rating sheet comes up
      // after a completed visit, so the sheet gets out of its way. The
      // clinician view has neither, so the sheet stays open with the status
      if (view === "patient") sheet.current?.close();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const open = () => {
    setMarked(null);
    setFailed(false);
    sheet.current?.open();
  };

  const trigger = (className: string, label: string) => (
    <button
      type="button"
      onClick={open}
      className={cx(
        "focus-ring inline-flex min-h-control-sm cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-dashed border-line-control bg-white px-4 text-body font-semibold text-navy hover:border-action",
        className,
      )}
    >
      <Sliders size={18} />
      {label}
    </button>
  );

  return (
    <>
      {trigger("lg:hidden", copy.demo.button)}
      {trigger("fixed bottom-6 left-6 z-30 max-lg:hidden shadow-card", copy.demo.title)}
      <Sheet ref={sheet} title={copy.demo.title} titleId="demo-controls-title">
        <p className="text-body text-slate">{copy.demo.note}</p>
        <div className="flex flex-col gap-2">
          <Button onClick={() => mark("completed")} disabled={busy} className="w-full">
            {copy.demo.markCompleted}
          </Button>
          <Button variant="secondary" onClick={() => mark("no_show")} disabled={busy} className="w-full">
            {copy.demo.markNoShow}
          </Button>
        </div>
        <p role="status" className="text-body font-semibold text-ink">
          {marked === "completed" && copy.demo.markedCompleted}
          {marked === "no_show" && copy.demo.markedNoShow}
        </p>
        {failed && (
          <div role="alert">
            <FieldError>{copy.common.somethingWentWrong}</FieldError>
          </div>
        )}
        <nav aria-label={copy.demo.switchLabel} className="grid grid-cols-2 gap-1 rounded-field bg-tint p-1">
          {(
            [
              { href: "/visit", label: copy.demo.patientPortal, on: view === "patient" },
              { href: "/clinician", label: copy.demo.clinicianView, on: view === "clinician" },
            ] as const
          ).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.on ? "page" : undefined}
              onClick={() => item.href !== pathname && sheet.current?.close()}
              className={cx(
                "focus-ring flex min-h-control-sm items-center justify-center rounded-[10px] text-body",
                item.on ? "bg-white font-bold text-ink shadow-card" : "font-medium text-navy hover:text-action",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Sheet>
    </>
  );
}
