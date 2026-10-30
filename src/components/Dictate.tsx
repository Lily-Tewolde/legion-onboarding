"use client";

import { useLayoutEffect, useRef } from "react";
import { copy } from "@/copy";
import { cx } from "./cx";
import { Info, Mic } from "./icons";
import { useSpeech } from "./useSpeech";

// The text box with live dictation (Claude Design's Dictate): it grows gently
// as they type, from minRows to maxRows lines, then scrolls inside. The mic
// sits inside the box. While listening, the border turns blue, "Listening…
// Tap to stop." shows in placeholder colour, then each word fades in as it's
// heard; finished phrases are added to what they typed. Under the box: the
// mic blocked or nothing heard, and the note at the 1,000-character limit
// (copy audit, Oct 29)

const LINE = 26;

export function Dictate({
  id,
  label,
  labelledBy,
  describedBy,
  value,
  onChange,
  onSpoken,
  placeholder,
  minRows = 2,
  maxRows = 6,
  invalid = false,
  disabled = false,
  maxLength = 1000,
  large = false,
}: {
  id: string;
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  value: string;
  onChange: (value: string) => void;
  // Called with the new text when a spoken phrase is added
  onSpoken?: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  invalid?: boolean;
  disabled?: boolean;
  maxLength?: number;
  large?: boolean;
}) {
  const field = useRef<HTMLTextAreaElement>(null);
  const latest = useRef(value);
  useLayoutEffect(() => {
    latest.current = value;
  }, [value]);
  const pad = large ? 16 : 12;
  const min = minRows * LINE + pad * 2;
  const max = maxRows * LINE + pad * 2;

  const speech = useSpeech((spoken) => {
    const joined = [latest.current.trim(), spoken].filter(Boolean).join(" ").slice(0, maxLength);
    onChange(joined);
    onSpoken?.(joined);
  });

  // Grow with the text, between the minimum and maximum heights
  useLayoutEffect(() => {
    const element = field.current;
    if (!element) return;
    element.style.height = "auto";
    const height = Math.max(min, Math.min(max, element.scrollHeight));
    element.style.height = `${height}px`;
    element.style.overflowY = element.scrollHeight > max + 1 ? "auto" : "hidden";
  }, [value, min, max, speech.listening]);

  const words = speech.interim ? speech.interim.split(/\s+/) : [];
  const note =
    speech.problem === "blocked"
      ? copy.whatsGoingOn.micBlocked
      : speech.problem === "nothing_heard"
        ? copy.whatsGoingOn.nothingHeard
        : value.length >= maxLength
          ? copy.whatsGoingOn.atLimit
          : null;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div
        className={cx(
          "relative w-full rounded-tile bg-white transition-[border-color] duration-300",
          invalid ? "border-2 border-error" : speech.listening ? "border-2 border-action" : "border-[1.5px] border-line-control",
        )}
      >
        <textarea
          id={id}
          ref={field}
          aria-label={labelledBy ? undefined : label}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          placeholder={speech.listening ? "" : placeholder}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          onChange={(event) => {
            speech.clearProblem();
            onChange(event.target.value);
          }}
          style={{ minHeight: min }}
          className={cx(
            "focus-ring block w-full resize-none rounded-tile bg-transparent text-question leading-[26px] text-navy outline-none placeholder:text-line-control",
            large ? "py-4 pr-[72px] pl-4" : "py-3 pr-16 pl-4",
          )}
        />
        {speech.listening && (
          <div aria-hidden="true" className={cx("pointer-events-none absolute right-0 bottom-0 left-0 text-question leading-[26px]", large ? "px-4 pb-4" : "px-4 pb-3")}>
            {words.length === 0 ? (
              <span className="text-slate">{copy.whatsGoingOn.listening}</span>
            ) : (
              words.map((word, i) => (
                <span key={`${i}-${word}`} className="word">
                  {word}{" "}
                </span>
              ))
            )}
          </div>
        )}
        {speech.supported && (
          <button
            type="button"
            aria-label={copy.whatsGoingOn.speak}
            aria-pressed={speech.listening}
            disabled={disabled}
            onClick={speech.listening ? speech.stop : speech.start}
            className={cx(
              "focus-ring absolute right-2 bottom-2 flex size-12 cursor-pointer items-center justify-center rounded-full",
              speech.listening ? "bg-action text-white shadow-[0_0_0_6px_var(--color-tag)]" : "bg-wash text-action",
            )}
          >
            <Mic size={22} />
          </button>
        )}
        <span role="status" className="sr-only">
          {speech.listening ? copy.whatsGoingOn.listening : ""}
        </span>
      </div>
      <p role="status" className="flex items-start gap-2 text-body text-slate empty:hidden">
        {note && (
          <>
            <Info size={18} className="mt-[3px] flex-none text-action" />
            {note}
          </>
        )}
      </p>
    </div>
  );
}
