"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/Button";
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

  return (
    <div
      role="dialog"
      aria-labelledby="rating-title"
      className="fixed right-4 bottom-4 left-4 z-10 flex flex-col gap-3 rounded-card border border-line bg-white p-4 shadow-float sm:left-auto sm:w-96"
    >
      {rating.score === null && (
        <>
          <h2 id="rating-title" className="text-lg">
            {copy.nps.question}
          </h2>
          <div role="group" aria-labelledby="rating-title" className="grid grid-cols-6 gap-2">
            {SCORES.map((score) => (
              <Button
                key={score}
                variant="secondary"
                size="small"
                className="px-0"
                onClick={() => {
                  track("portal.visit.rated", { score });
                  store.save({ score, review: score >= 9 ? "asked" : null, closed: false });
                }}
              >
                {score}
              </Button>
            ))}
          </div>
          <p className="flex justify-between text-sm text-slate">
            <span>0 = {copy.nps.low}</span>
            <span>10 = {copy.nps.high}</span>
          </p>
          <Button variant="text" className="self-start" onClick={close}>
            {copy.nps.close}
          </Button>
        </>
      )}

      {rating.review === "asked" && (
        <>
          <p id="rating-title" role="status">
            {copy.nps.reviewAsk}
          </p>
          <div className="flex flex-col items-start gap-1">
            <Button onClick={() => store.save({ ...rating, review: "writing" })}>{copy.nps.writeReview}</Button>
            <Button variant="text" onClick={close}>
              {copy.nps.notNow}
            </Button>
          </div>
        </>
      )}

      {rating.review === "writing" && (
        <>
          <p id="rating-title" role="status">
            {copy.nps.reviewDemo}
          </p>
          <Button variant="text" className="self-start" onClick={close}>
            {copy.nps.close}
          </Button>
        </>
      )}

      {rating.score !== null && rating.review === null && (
        <>
          <p id="rating-title" role="status">
            {copy.nps.thanks}
          </p>
          <Button variant="text" className="self-start" onClick={close}>
            {copy.nps.close}
          </Button>
        </>
      )}
    </div>
  );
}
