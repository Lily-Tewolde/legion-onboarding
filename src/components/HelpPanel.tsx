"use client";

import { useRef } from "react";
import { copy } from "@/copy";
import { Button } from "./Button";
import { Tag } from "./Tag";

// The "Talk to a person" link and the panel it opens, on every screen.
// A native <dialog>: it traps focus, closes on Escape and returns focus
// to the link. Tapping outside the panel closes it too
export function HelpPanel() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="focus-ring min-h-control-sm cursor-pointer rounded-md px-2 text-base font-medium text-action underline underline-offset-4 hover:text-action-hover"
      >
        {copy.shell.helpLink}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="help-panel-title"
        onClick={(event) => event.target === dialogRef.current && close()}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-card bg-white p-0 text-ink shadow-float backdrop:bg-navy/40"
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 id="help-panel-title" className="text-2xl">
            {copy.helpPanel.title}
          </h2>
          <div className="flex flex-col gap-1">
            <p>{copy.helpPanel.phone}</p>
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
            {copy.helpPanel.crisis}
          </p>
          <Button variant="secondary" onClick={close} className="self-start">
            {copy.helpPanel.close}
          </Button>
        </div>
      </dialog>
    </>
  );
}
