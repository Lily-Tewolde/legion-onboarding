// Skeleton loading, not loading text (build brief, section 2)
export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="h-control rounded-lg bg-wash motion-safe:animate-pulse" />
      ))}
    </div>
  );
}
