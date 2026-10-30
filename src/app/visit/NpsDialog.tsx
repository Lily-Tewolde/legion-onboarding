"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/Button";
import { copy } from "@/copy";
import { createSessionStore } from "@/lib/session-store";

// "How was your first visit?" 0 to 10, in a small dialog in the corner, only
// after the visit is marked completed and never during onboarding (decided
// Oct 29). Not a modal: the page stays usable. The score stays in this
// browser tab; nothing sends it anywhere yet (no column or event for it)

type Rating = { score: number | null; closed: boolean };

const store = createSessionStore<Rating>("lh_visit_rating", { score: null, closed: false });

const SCORES = Array.from({ length: 11 }, (_, score) => score);

export function NpsDialog() {
  const rating = useSyncExternalStore(store.subscribe, store.get, store.getServer);
  if (!rating || rating.closed) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="rating-title"
      className="fixed right-4 bottom-4 left-4 z-10 flex flex-col gap-3 rounded-card border border-line bg-white p-4 shadow-float sm:left-auto sm:w-96"
    >
      {rating.score === null ? (
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
                onClick={() => store.save({ score, closed: false })}
              >
                {score}
              </Button>
            ))}
          </div>
          <p className="flex justify-between text-sm text-slate">
            <span>{copy.nps.low}</span>
            <span>{copy.nps.high}</span>
          </p>
        </>
      ) : (
        <p id="rating-title" role="status">
          {copy.nps.thanks}
        </p>
      )}
      <Button variant="text" className="self-start" onClick={() => store.save({ ...rating, closed: true })}>
        {copy.nps.close}
      </Button>
    </div>
  );
}
