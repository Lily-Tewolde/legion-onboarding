"use client";

import { cx } from "@/components/cx";
import { copy } from "@/copy";
import type { SlotOption } from "@/lib/provider/present";
import { visitShortDate } from "@/lib/visit-time";

// A provider's own times (Claude Design's Availability): a short day strip,
// then that day's times. Selected is the 2px blue border, the soft fill and bold
export function Availability({
  name,
  slots,
  selected,
  onPick,
}: {
  name: string;
  slots: SlotOption[];
  selected: string | null;
  onPick: (start: string) => void;
}) {
  const days = [...new Set(slots.map((slot) => visitShortDate(slot.start)))];
  const chosenDay = selected ? visitShortDate(selected) : days[0];
  const times = slots.filter((slot) => visitShortDate(slot.start) === chosenDay);

  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label={`${copy.provider.days}, ${name}`} className="flex gap-2 overflow-x-auto pb-0.5">
        {days.map((day) => {
          const [dow, date] = day.split(", ");
          const on = day === chosenDay;
          return (
            <button
              key={day}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={day}
              onClick={() => onPick(slots.find((slot) => visitShortDate(slot.start) === day)?.start ?? "")}
              className={cx(
                "focus-ring flex min-h-14 min-w-[72px] flex-none cursor-pointer flex-col items-center justify-center rounded-field px-3",
                on ? "border-2 border-action bg-wash text-ink" : "border-[1.5px] border-line-control bg-white text-navy hover:border-action",
              )}
            >
              <span className={cx("text-label", on ? "font-bold" : "font-semibold text-slate")}>{dow}</span>
              <span className={cx("text-body", on ? "font-bold" : "font-medium")}>{date}</span>
            </button>
          );
        })}
      </div>
      <div role="radiogroup" aria-label={copy.provider.times.replace("{day}", chosenDay ?? "")} className="flex flex-wrap gap-2">
        {times.map((slot) => {
          const on = slot.start === selected;
          return (
            <button
              key={slot.start}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={slot.label}
              onClick={() => onPick(slot.start)}
              className={cx(
                "focus-ring inline-flex min-h-control-sm cursor-pointer items-center rounded-full px-4 text-body whitespace-nowrap",
                on ? "border-2 border-action bg-wash font-bold text-ink" : "border-[1.5px] border-line-control bg-white font-medium text-navy hover:border-action",
              )}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// A provider's initials in a soft circle (decided Oct 29), in place of a
// photo. The name is always beside it, so screen readers skip it
export function ProviderPhoto({ name, large = false }: { name: string; large?: boolean }) {
  const initials = name
    .split(",")[0]
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={cx(
        "flex flex-none items-center justify-center rounded-full bg-wash font-semibold text-action",
        large ? "size-14 text-question" : "size-12 text-body-lg",
      )}
    >
      {initials}
    </span>
  );
}
