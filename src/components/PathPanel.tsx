"use client";

import { useSyncExternalStore } from "react";
import { copy } from "@/copy";
import { findPlan } from "@/data";
import { getAnswers, getServerAnswers, subscribeAnswers } from "@/lib/fit/stored-answers";
import { parseDateOfBirth } from "@/lib/fit/rules";
import type { Phase } from "@/lib/progress";
import { recommend } from "@/lib/provider/recommend";
import { visitShortDate, visitTime } from "@/lib/visit-time";
import { whatsGoingOnStore } from "@/lib/whats-going-on/stored";
import { cx } from "./cx";
import { Calendar, Dollar } from "./icons";
import { Photo } from "./Photo";
import { PHASE_LABEL, PHASE_ORDER } from "./phase";

// Desktop: the path-to-care panel beside the content (Claude Design's
// PathPanel). A labelled photo placeholder that changes with the phase, the
// panel line, the four phases (a ring around the current one that fills
// through its steps, a check and a one-line summary on each finished one),
// then the typical cost and the earliest visit. No quote (Lily, Oct 30).
// Summaries come from this tab's answers; the provider and time from the
// server, once chosen

export type PanelProvider = { name: string; slotStart: string };

const CIRCUMFERENCE = 94.25;

const PANEL_PHOTOS = ["aboutYou", "whatsGoingOn", "yourProvider", "book"] as const;

export function PathPanel({
  phase,
  part,
  parts,
  provider,
  booked = false,
}: {
  phase: Phase;
  part: number;
  parts: number;
  provider?: PanelProvider;
  booked?: boolean;
}) {
  const answers = useSyncExternalStore(subscribeAnswers, getAnswers, getServerAnswers);
  const words = useSyncExternalStore(whatsGoingOnStore.subscribe, whatsGoingOnStore.get, whatsGoingOnStore.getServer);
  const current = booked ? PHASE_ORDER.length : PHASE_ORDER.indexOf(phase);
  const ring = Math.max(4, Math.min(CIRCUMFERENCE, (CIRCUMFERENCE * part) / parts));

  const plan = answers?.payMethod === "self_pay" ? null : answers?.planId ? findPlan(answers.planId) : undefined;
  const year = parseDateOfBirth(answers?.dateOfBirth ?? "")?.year;
  const concerns = (words?.confirmChips ?? words?.understanding?.chips ?? []).map((chip) => chip.label);
  const summaries: Record<Phase, string> = {
    about_you: year
      ? copy.panel.aboutYou.replace("{year}", String(year)).replace("{plan}", plan ? plan.name : copy.panel.selfPay)
      : "",
    whats_going_on: concerns.join(" · "),
    your_provider: provider ? `${shortName(provider.name)} · ${visitShortDate(provider.slotStart).split(",")[0]} ${visitTime(provider.slotStart)}` : "",
    book: copy.panel.booked,
  };

  const earliest = earliestVisit(answers?.payMethod, answers?.planId);
  const showFacts = current >= 1 && Boolean(answers?.payMethod);
  const photoIndex = Math.min(current, PANEL_PHOTOS.length - 1);

  return (
    <aside aria-label={copy.panel.title} className="card flex min-h-full w-full flex-col overflow-hidden rounded-card">
      <Photo photo={PANEL_PHOTOS[photoIndex]} alt={copy.panel.photos[photoIndex]} className="h-42" priority />
      <div className="flex flex-1 flex-col gap-4 px-5 pb-5">
        <p className="display text-card-question font-semibold text-ink">{copy.panel.line}</p>
        <div className="flex flex-col gap-1">
          <h2 className="mb-1 text-label font-semibold text-slate">{copy.panel.title}</h2>
          <ol className="flex flex-col gap-1">
            {PHASE_ORDER.map((id, i) => {
              const done = i < current;
              const now = i === current;
              return (
                <li
                  key={id}
                  aria-current={now ? "step" : undefined}
                  className={cx("flex items-start gap-3 rounded-field px-3 py-2", now && "bg-wash")}
                >
                  <PhaseMark n={i + 1} state={done ? "done" : now ? "current" : "upcoming"} dash={ring} />
                  <div className="flex min-w-0 flex-col pt-1">
                    <span className={cx("text-body", done || now ? "font-semibold text-ink" : "font-medium text-slate")}>
                      {PHASE_LABEL[id]}
                      <span className="sr-only">{done ? copy.panel.done : now ? copy.panel.inProgress : ""}</span>
                    </span>
                    {done && summaries[id] && <span className="truncate text-label text-slate">{summaries[id]}</span>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        {showFacts && (
          <div className="flex flex-col gap-2 rounded-tile bg-[#f5f8fe] p-3">
            {plan && (
              <p className="flex items-start gap-2 text-body whitespace-nowrap text-navy">
                <Dollar size={18} className="mt-[3px] flex-none text-action" />
                {copy.panel.typicalCost}
              </p>
            )}
            {earliest && (
              <p className="flex items-start gap-2 text-body whitespace-nowrap text-navy">
                <Calendar size={18} className="mt-[3px] flex-none text-action" />
                {provider && current >= 3
                  ? copy.panel.yourVisit.replace("{date}", visitShortDate(provider.slotStart))
                  : copy.panel.earliest.replace("{date}", visitShortDate(earliest))}
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function PhaseMark({ n, state, dash }: { n: number; state: "done" | "current" | "upcoming"; dash: number }) {
  if (state === "done") {
    return (
      <svg width="32" height="32" viewBox="0 0 36 36" aria-hidden="true" className="flex-none">
        <circle cx="18" cy="18" r="16.5" fill="#2F5FE0" />
        <path d="M11.5 18.5l4.2 4.2 8.8-9" fill="none" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="32" height="32" viewBox="0 0 36 36" aria-hidden="true" className="flex-none">
      <circle cx="18" cy="18" r="15" fill="#FFFFFF" stroke="#D5DCE8" strokeWidth="3" />
      {state === "current" && (
        <circle
          className="ring"
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="#2F5FE0"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${dash.toFixed(1)} ${CIRCUMFERENCE}`}
          transform="rotate(-90 18 18)"
        />
      )}
      <text
        x="18"
        y="23"
        textAnchor="middle"
        fontSize="15"
        fontWeight={state === "current" ? 700 : 600}
        fill={state === "current" ? "#2F5FE0" : "#4F5D72"}
        fontFamily="inherit"
      >
        {n}
      </text>
    </svg>
  );
}

// "Alex Rivera" from "Alex Rivera, PMHNP"
const shortName = (name: string) => name.split(",")[0];

// The earliest time anyone who takes their plan has (anyone, for self-pay)
function earliestVisit(payMethod: string | undefined, planId: string | undefined): string | null {
  if (!payMethod) return null;
  const result = recommend(["Not sure"], {
    payMethod: payMethod === "self_pay" ? "self_pay" : "insurance",
    planId: planId ?? null,
  });
  return result.found ? result.recommended.slots[0].start : null;
}
