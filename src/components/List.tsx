"use client";

import { cx } from "./cx";

// Adapted from Inspo Book 01's list: rows with a left bar on the chosen one.
// Rebuilt as a choose-one list on native radio inputs, with 44px rows,
// 16px text and an optional second line under each label
export type ListProps = {
  legend: string;
  name: string;
  items: { value: string; label: string; description?: string }[];
  value: string | undefined;
  onChange: (value: string) => void;
};

export function List({ legend, name, items, value, onChange }: ListProps) {
  return (
    <fieldset>
      <legend className="text-lg font-medium text-ink">{legend}</legend>
      <div className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line-control bg-white">
        {items.map((item) => (
          <label key={item.value} className="block">
            <input
              type="radio"
              name={name}
              value={item.value}
              checked={value === item.value}
              onChange={() => onChange(item.value)}
              className="peer sr-only"
            />
            <span
              className={cx(
                "flex min-h-control-sm cursor-pointer flex-col justify-center border-l-2 border-transparent px-4 py-2.5 text-base text-ink",
                "transition-colors duration-150 motion-reduce:transition-none hover:bg-wash",
                "peer-checked:border-action peer-checked:bg-wash peer-checked:text-navy",
                "peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-action",
              )}
            >
              <span className={cx(value === item.value && "font-medium")}>
                {item.label}
              </span>
              {item.description && (
                <span className="text-slate">{item.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
