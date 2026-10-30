import { cx } from "./cx";

// Skeleton loading with the spec's soft shimmer, never loading text: a card
// with a few lines in it
export function Skeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cx("card flex flex-col gap-3 p-4 md:p-6", className)}>
      <div className="shimmer h-6 w-2/3 rounded-full" />
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="shimmer h-field rounded-field" />
      ))}
    </div>
  );
}
