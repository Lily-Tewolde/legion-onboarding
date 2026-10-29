import { type Phase, PHASES } from "@/lib/progress";
import { cx } from "./cx";

// The one progress style, on the booking screens only, ending at "You're
// booked": the four named phases, each with its own segment of a thin bar.
// Done and current phases are filled; the current one is named in navy and
// marked for screen readers with aria-current, so there are no step numbers
export function Progress({ phase }: { phase: Phase }) {
  const current = PHASES.findIndex((p) => p.id === phase);

  return (
    <ol className="grid grid-cols-4 gap-2">
      {PHASES.map((p, index) => (
        <li
          key={p.id}
          aria-current={index === current ? "step" : undefined}
          className="flex flex-col gap-1.5"
        >
          <span
            aria-hidden="true"
            className={cx("h-1.5 rounded-full", index <= current ? "bg-action" : "bg-wash")}
          />
          <span
            className={cx(
              "text-sm",
              index === current ? "font-medium text-navy" : "text-slate",
            )}
          >
            {p.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
