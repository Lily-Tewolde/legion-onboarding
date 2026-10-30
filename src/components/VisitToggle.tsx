"use client";

import { type ReactNode, useId, useState } from "react";
import { cx } from "./cx";
import { Calendar, ChevronDown } from "./icons";

// The visit, collapsed to its summary and opening inside the same card (board
// 08-Payment-M). Payment uses it above the card fields, and details on phones
export function VisitToggle({ summary, children, className }: { summary: ReactNode; children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={cx("card overflow-hidden", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="focus-ring flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left md:px-6"
      >
        <Calendar size={20} className="flex-none text-brand" />
        <span className="flex flex-1 flex-col">{summary}</span>
        <ChevronDown size={22} className={cx("flex-none text-action transition-transform duration-300", open && "rotate-180")} />
      </button>
      {open && (
        <div id={id} className="expand">
          <div className="px-4 pb-4 md:px-6">{children}</div>
        </div>
      )}
    </div>
  );
}
