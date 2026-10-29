// The one progress style for the whole flow: a thin bar, no step text.
// The label is for screen readers and comes from src/copy.ts
export type ProgressBarProps = {
  label: string;
  value: number;
  max: number;
};

export function ProgressBar({ label, value, max }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-1.5 w-full overflow-hidden rounded-full bg-wash"
    >
      <div
        className="h-full rounded-full bg-action transition-[width] duration-200 motion-reduce:transition-none"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
