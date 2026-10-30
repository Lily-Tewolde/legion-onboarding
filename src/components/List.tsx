"use client";

import { cx } from "./cx";

// A choose-one list of options (52px rows, 12px radius), on native radio
// inputs. Selected is the 2px blue border, the soft fill and bold, like every
// other option. An optional second line sits under each label
export type ListProps = {
  legend: string;
  name: string;
  items: { value: string; label: string; description?: string }[];
  value: string | undefined;
  onChange: (value: string) => void;
};

export function List({ legend, name, items, value, onChange }: ListProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-3 text-question font-semibold text-ink">{legend}</legend>
      {items.map((item) => (
        <label key={item.value} className="flex">
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
              "flex min-h-field flex-1 cursor-pointer flex-col justify-center rounded-field px-4 py-3 text-body-lg",
              "border-[1.5px] border-line-control bg-white font-medium text-navy hover:border-action",
              "peer-checked:border-2 peer-checked:border-action peer-checked:bg-wash peer-checked:font-bold peer-checked:text-ink",
              "peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-action",
            )}
          >
            {item.label}
            {item.description && <span className="text-body font-normal text-slate">{item.description}</span>}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
