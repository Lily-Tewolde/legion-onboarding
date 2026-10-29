import { copy, fillCopy } from "@/copy";

// The one progress style, on the booking screens only, ending at
// "You're booked": "Step 2 of 4" above a thin bar. The same text is the
// screen reader label, so the visible copy is hidden from screen readers
export type ProgressBarProps = {
  step: number;
  total: number;
};

export function ProgressBar({ step, total }: ProgressBarProps) {
  const text = fillCopy(copy.progress.step, { step, total });
  const percent = Math.min(100, Math.max(0, (step / total) * 100));

  return (
    <div className="flex flex-col gap-2">
      <p aria-hidden="true" className="text-sm font-medium text-slate">
        {text}
      </p>
      <div
        role="progressbar"
        aria-label={text}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={step}
        className="h-1.5 w-full overflow-hidden rounded-full bg-wash"
      >
        <div
          className="h-full rounded-full bg-action transition-[width] duration-200 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
