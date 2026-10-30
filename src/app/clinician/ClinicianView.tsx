"use client";

import { type MouseEvent, type ReactNode, useState, useSyncExternalStore } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { Tag } from "@/components/Tag";
import { copy } from "@/copy";
import type { ClinicianSummary, SummaryMedication } from "@/lib/ai/check-in-summary";
import { track, useTrackOnShow } from "@/lib/analytics/track";
import { SAMPLE_CHECK_IN } from "@/lib/check-in/sample";
import { type CheckInFlag, type CheckInState, checkInStore } from "@/lib/check-in/stored";

// Leads with what a clinician scans first: the safety flag if there is one,
// with the quote and a link to the answer, the concern in one line with its
// source, and the medications. Everything else is behind "All answers"
// (decided Oct 29). Flags meant for the clinician are only ever shown here

const SAFETY_KINDS = new Set(["self_harm", "harm_to_others", "being_harmed", "immediate_danger", "past_risk"]);

export function ClinicianView() {
  const stored = useSyncExternalStore(checkInStore.subscribe, checkInStore.get, checkInStore.getServer);
  const [sample, setSample] = useState(false);

  if (!stored) return <div aria-hidden="true" className="h-40 rounded-lg bg-wash motion-safe:animate-pulse" />;
  const hasCheckIn = stored.turns.length > 0 || stored.stage === "stopped";
  const record = sample ? SAMPLE_CHECK_IN : hasCheckIn ? stored : null;

  if (!record) {
    return (
      <div className="flex flex-col items-start gap-6">
        <h1 className="text-3xl">
          {stored.provider ? copy.clinician.title.replace("{provider}", stored.provider) : copy.clinician.titleNoProvider}
        </h1>
        <p>{copy.clinician.noCheckIn}</p>
        <Button onClick={() => setSample(true)}>{copy.clinician.loadSample}</Button>
        <ButtonLink href="/demo" variant="text">
          {copy.clinician.openPortal}
        </ButtonLink>
      </div>
    );
  }
  return <Summary record={record} sample={sample} />;
}

function Summary({ record, sample }: { record: CheckInState; sample: boolean }) {
  const summary = record.summary ?? null;
  useTrackOnShow(() => track("portal.intake.summary_viewed", { sample }));
  const [open, setOpen] = useState(summary === null);
  const answerText = (id: string) => record.turns.find((turn) => turn.id === id)?.answer ?? "";
  const safety = record.flags.filter((flag) => SAFETY_KINDS.has(flag.kind));
  const eligibility = record.flags.filter((flag) => !SAFETY_KINDS.has(flag.kind));
  const allSkipped = record.turns.length > 0 && record.turns.every((turn) => turn.skipped);
  // The AI's own flags, less any the crisis layers or the check-in already
  // raised for the same answers
  const flagged = new Map(record.flags.map((flag) => [flag.messageId, SAFETY_KINDS.has(flag.kind) ? "safety" : "eligibility"]));
  const aiFlags = (summary?.flags ?? []).filter((flag) => {
    const category = flag.type === "past_risk" ? "safety" : flag.type;
    return !flag.cites.every((cite) => flagged.get(cite) === category);
  });

  // A source link opens "All answers" first, then goes to the answer
  const onSourceClick = (event: MouseEvent) => {
    const link = (event.target as HTMLElement).closest("a[href^='#answer-']");
    if (!link) return;
    event.preventDefault();
    setOpen(true);
    const id = link.getAttribute("href")?.slice(1) ?? "";
    requestAnimationFrame(() => {
      const answer = document.getElementById(id);
      answer?.scrollIntoView({ block: "start" });
      answer?.focus();
    });
  };

  return (
    <div className="flex flex-col gap-8" onClickCapture={onSourceClick}>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl">{copy.clinician.title.replace("{provider}", record.provider)}</h1>
        <p className="font-medium text-slate">{copy.clinician.label}</p>
      </div>

      {(safety.length > 0 || eligibility.length > 0 || aiFlags.length > 0) && (
        <section aria-labelledby="flags" className="flex flex-col gap-3 rounded-lg border-2 border-error p-4">
          <h2 id="flags" className="text-xl">
            {copy.clinician.flagsTitle}
          </h2>
          {safety.length > 0 && <p className="font-medium">{copy.clinician.safetyFlag}</p>}
          <ul className="flex flex-col gap-3">
            {[...safety, ...eligibility].map((flag) => (
              <FlagLine key={`${flag.kind}-${flag.messageId}`} flag={flag} quote={answerText(flag.messageId)} turns={record.turns} />
            ))}
            {aiFlags.map((flag, i) => (
              <li key={`ai-${i}`}>
                {flag.note} <Sources cites={flag.cites} turns={record.turns} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {allSkipped && <p>{copy.clinician.skippedAll}</p>}
      {summary === null && !allSkipped && <p>{copy.clinician.noSummary}</p>}

      {summary && summary.main_concern.length > 0 && (
        <Section title={copy.clinician.sections.main_concern}>
          {summary.main_concern.map((item, i) => (
            <li key={i}>
              “{item.quote}” <Sources cites={item.cites} turns={record.turns} />
            </li>
          ))}
        </Section>
      )}

      {summary && summary.medications.length > 0 && (
        <Section title={copy.clinician.sections.medications}>
          {summary.medications.map((medication, i) => (
            <li key={i}>
              <MedicationLine medication={medication} /> <Sources cites={medication.cites} turns={record.turns} />
            </li>
          ))}
        </Section>
      )}

      <Button variant="text" className="self-start" aria-expanded={open} aria-controls="all-answers" onClick={() => setOpen(!open)}>
        {copy.clinician.allAnswers}
      </Button>

      {open && (
        <div id="all-answers" className="flex flex-col gap-8">
          {summary && <OtherSections summary={summary} turns={record.turns} />}
          <section aria-labelledby="answers" className="flex flex-col gap-3">
            <h2 id="answers" className="text-xl">
              {copy.clinician.allAnswers}
            </h2>
            <ol className="flex flex-col gap-4">
              {record.turns.map((turn) => (
                <li key={turn.id} id={`answer-${turn.id}`} tabIndex={-1} className="flex scroll-mt-4 flex-col gap-1 outline-none">
                  <p className="font-medium">{turn.question}</p>
                  <p className={turn.skipped ? "text-slate" : undefined}>{turn.skipped ? copy.clinician.skipped : turn.answer}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}

      <div className="flex flex-col items-start gap-2 border-t border-line pt-6">
        {sample && <Tag>{copy.clinician.sample}</Tag>}
        <ButtonLink href="/demo" variant="text">
          {copy.clinician.openPortal}
        </ButtonLink>
      </div>
    </div>
  );
}

function OtherSections({ summary, turns }: { summary: ClinicianSummary; turns: CheckInState["turns"] }) {
  const lines = [
    ["whats_been_happening", summary.whats_been_happening],
    ["past_care", summary.past_care],
    ["sleep", summary.sleep],
    ["other_health", summary.other_health],
    ["goals", summary.goals],
  ] as const;
  return (
    <>
      {lines.map(([key, items]) =>
        items.length > 0 ? (
          <Section key={key} title={copy.clinician.sections[key]}>
            {items.map((item, i) => (
              <li key={i}>
                {item.text} <Sources cites={item.cites} turns={turns} />
              </li>
            ))}
          </Section>
        ) : null,
      )}
      {summary.unclear.length > 0 && (
        <Section title={copy.clinician.sections.unclear}>
          {summary.unclear.map((item, i) => (
            <li key={i}>
              “{item.quote}” <Sources cites={item.cites} turns={turns} />
            </li>
          ))}
        </Section>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl">{title}</h2>
      <ul className="flex flex-col gap-2">{children}</ul>
    </section>
  );
}

function FlagLine({ flag, quote, turns }: { flag: CheckInFlag; quote: string; turns: CheckInState["turns"] }) {
  return (
    <li className="flex flex-col gap-1">
      <span className="font-medium">{copy.clinician.flagKinds[flag.kind]}</span>
      {quote && (
        <span>
          “{quote}” <Sources cites={[flag.messageId]} turns={turns} />
        </span>
      )}
    </li>
  );
}

function MedicationLine({ medication }: { medication: SummaryMedication }) {
  if (!medication.name) {
    const heard = copy.clinician.asHeard.replace("{name}", medication.name_as_said);
    return <>{[heard, medication.dose, medication.details].filter(Boolean).join(", ")}</>;
  }
  const said = medication.name.toLowerCase() !== medication.name_as_said.toLowerCase();
  const parts = [
    [medication.name, medication.dose, medication.details].filter(Boolean).join(", "),
    copy.clinician.statuses[medication.status],
    said ? copy.clinician.saidAs.replace("{name}", medication.name_as_said) : "",
    medication.confirmed_by_patient ? copy.clinician.confirmedByPatient : "",
  ].filter(Boolean);
  return <>{parts.join(" · ")}</>;
}

// Each line links to the answers it came from
function Sources({ cites, turns }: { cites: string[]; turns: CheckInState["turns"] }) {
  return (
    <>
      {cites.map((cite) => {
        const number = turns.findIndex((turn) => turn.id === cite) + 1;
        if (number === 0) return null;
        return (
          <a
            key={cite}
            href={`#answer-${cite}`}
            className="focus-ring ml-1 rounded-sm text-sm font-medium text-action underline underline-offset-4"
          >
            {copy.clinician.source.replace("{number}", String(number))}
          </a>
        );
      })}
    </>
  );
}
