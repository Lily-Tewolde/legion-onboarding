import { cx } from "./cx";

// Adapted from Inspo Book 01's filter chip: a toggle button with aria-pressed.
// Sized up to 16px text and a 44px tap target. Selected shows a tick as well
// as the colour change, so the state never relies on colour alone
export type ChipProps = {
  label: string;
  selected: boolean;
  onToggle: (next: boolean) => void;
};

export function Chip({ label, selected, onToggle }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onToggle(!selected)}
      className={cx(
        "focus-ring inline-flex min-h-control-sm items-center gap-1.5 rounded-full border px-4 text-base",
        "cursor-pointer transition-colors duration-150 motion-reduce:transition-none",
        selected
          ? "border-action bg-wash font-medium text-navy"
          : "border-line-control bg-white text-ink hover:border-ink",
      )}
    >
      {selected && <Tick />}
      {label}
    </button>
  );
}

const Tick = () => (
  <svg
    className="size-4 flex-none text-action"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3.5 8.5l3 3 6-7" />
  </svg>
);
