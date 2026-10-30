"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/Button";
import { Close } from "@/components/icons";
import { copy } from "@/copy";
import { track } from "@/lib/analytics/track";
import { createSessionStore } from "@/lib/session-store";

// "How was your first visit?" 0 to 10, in a small dialog in the corner, only
// after the visit is marked completed and never during onboarding (decided
// Oct 29). Not a modal: the page stays usable. A 9 or 10 leads into asking
// for a review; a lower score gets a thank-you. The score stays in this
// browser tab, and goes to PostHog as portal.visit.rated (the score only)

type Rating = { score: number | null; review: "asked" | "writing" | null; closed: boolean };

const store = createSessionStore<Rating>("lh_visit_rating", { score: null, review: null, closed: false });

const SCORES = Array.from({ length: 11 }, (_, score) => score);

export function NpsDialog() {
  const rating = useSyncExternalStore(store.subscribe, store.get, store.getServer);
  if (!rating || rating.closed) return null;

  const close = () => store.save({ ...rating, closed: true });

  // Into the body, so the phone sheet sits above the portal's tab bar. The
  // rating only exists in the browser, so this never runs on the server
  return createPortal(
    <div
      role="dialog"
      aria-labelledby="rating-title"
      className={[
        "fixed z-40 flex flex-col gap-3 bg-white",
        "inset-x-0 bottom-0 rounded-t-card px-4 pt-2 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-sheet",
        "animate-[sheet-in_var(--in)_var(--ease-spring)_both]",
        "md:inset-x-auto md:right-6 md:bottom-6 md:w-96 md:rounded-card md:border md:border-card-line md:p-5 md:shadow-dialog md:animate-[grow-in_var(--in)_var(--ease-spring)_both]",
        "motion-reduce:animate-[fade-in_.2s_ease_both]",
      ].join(" ")}
    >
      <span aria-hidden="true" className="h-[5px] w-9 self-center rounded-full bg-[#c9d1de] md:hidden" />
      <button
        type="button"
        aria-label={copy.nps.close}
        onClick={close}
        className="focus-ring absolute top-3 right-3 flex size-11 cursor-pointer items-center justify-center rounded-full text-slate hover:text-ink"
      >
        <Close size={20} />
      </button>
      {rating.score === null && (
        <>
          <h2 id="rating-title" className="display pr-10 text-card-question">
            {copy.nps.question}
          </h2>
          <div role="group" aria-labelledby="rating-title" className="grid grid-cols-6 gap-2">
            {SCORES.map((score) => (
              <Button
                key={score}
                variant="secondary"
                size="small"
                className="rounded-field! px-0"
                onClick={() => {
                  track("portal.visit.rated", { score });
                  store.save({ score, review: score >= 9 ? "asked" : null, closed: false });
                }}
              >
                {score}
              </Button>
            ))}
          </div>
          <p className="flex justify-between text-label text-slate">
            <span>{copy.nps.low}</span>
            <span>{copy.nps.high}</span>
          </p>
          <Button variant="text" onClick={close} className="self-center">
            {copy.nps.notNow}
          </Button>
        </>
      )}

      {rating.review === "asked" && (
        <>
          <p id="rating-title" role="status" className="pr-10 text-body-lg">
            {copy.nps.reviewAsk}
          </p>
          <div className="flex flex-col items-stretch gap-1">
            <Button onClick={() => store.save({ ...rating, review: "writing" })}>{copy.nps.writeReview}</Button>
            <Button variant="text" onClick={close}>
              {copy.nps.notNow}
            </Button>
          </div>
        </>
      )}

      {rating.review === "writing" && (
        <>
          <p id="rating-title" role="status" className="pr-10 text-body-lg">
            {copy.nps.reviewDemo}
          </p>
        </>
      )}

      {rating.score !== null && rating.review === null && (
        <>
          <p id="rating-title" role="status" className="pr-10 text-body-lg">
            {copy.nps.thanks}
          </p>
        </>
      )}
    </div>,
    document.body,
  );
}
