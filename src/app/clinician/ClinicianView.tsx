"use client";

import { type ReactNode, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/Button";
import { cx } from "@/components/cx";
import { Flag } from "@/components/icons";
import { Card, DemoLine, PageTitle, Screen } from "@/components/Screen";
import { Sheet, type SheetHandle } from "@/components/Sheet";
import { Skeleton } from "@/components/Skeleton";
import { copy } from "@/copy";
import type { ClinicianSummary, SummaryMedication } from "@/lib/ai/check-in-summary";
import { track, useTrackOnShow } from "@/lib/analytics/track";
import { SAMPLE_CHECK_IN, SAMPLE_PATIENT } from "@/lib/check-in/sample";
import { type CheckInFlag, type CheckInState, checkInStore } from "@/lib/check-in/stored";
import { ageOn, parseDateOfBirth } from "@/lib/fit/rules";
import { getAnswers } from "@/lib/fit/stored-answers";
import { todayInCentral } from "@/lib/central-time";

// Screen 10, the clinician view (Claude Design's 13-Clinician): it leads with
// what a doctor scans first, the safety flag if there is one (with the quote
// and its source), the concern in one line, and the medications. Everything
// else is behind "All answers", a sheet on phones and a dialog on desktop
// (decided Oct 29). Flags meant for the clinician are only ever shown here

const SAFETY_KINDS = new Set(["self_harm", "harm_to_others", "being_harmed", "immediate_danger", "past_risk"]);

export type Patient = { name: string; when: string } | null;

export function ClinicianView({ patient, demo }: { patient: Patient; demo?: ReactNode }) {
  const stored = useSyncExternalStore(checkInStore.subscribe, checkInStore.get, checkInStore.getServer);
  const [sample, setSample] = useState(false);

  if (!stored) {
    return (
      <Screen width="picker">
        <Skeleton rows={3} />
      </Screen>
    );
  }
  const hasCheckIn = stored.turns.length > 0 || stored.stage === "stopped";
  const record = sample ? SAMPLE_CHECK_IN : hasCheckIn ? stored : null;

  if (!record) {
    return (
      <Screen width="picker" footer={<div className="flex items-center justify-between gap-2">{demo}</div>}>
        <Header provider={stored.provider} />
        <Card className="items-start gap-3">
          <p className="text-body-lg">{copy.clinician.noCheckIn}</p>
          <Button onClick={() => setSample(true)}>{copy.clinician.loadSample}</Button>
        </Card>
      </Screen>
    );
  }
  return <Summary record={record} sample={sample} patient={sample ? SAMPLE_PATIENT : patient} demo={demo} />;
}

function Header({ provider, line }: { provider: string; line?: string }) {
  return (
    <>
      <p className="-mb-2 text-label font-semibold text-slate">{copy.clinician.viewLabel}</p>
      <div className="flex flex-col gap-1.5">
        <PageTitle>{provider ? copy.clinician.title.replace("{provider}", provider) : copy.clinician.titleNoProvider}</PageTitle>
        {line && <p className="text-body font-semibold text-navy">{line}</p>}
        <p className="self-start rounded-full bg-tag px-2.5 py-0.5 text-label font-semibold text-navy">{copy.clinician.label}</p>
      </div>
    </>
  );
}

function Summary({
  record,
  sample,
  patient,
  demo,
}: {
  record: CheckInState;
  sample: boolean;
  patient: { name: string; when: string; age?: number } | null;
  demo?: ReactNode;
}) {
  const summary = record.summary ?? null;
  const sheet = useRef<SheetHandle>(null);
  useTrackOnShow(() => track("portal.intake.summary_viewed", { sample }));

  const number = (id: string) => record.turns.findIndex((turn) => turn.id === id) + 1;
  const answerText = (id: string) => record.turns.find((turn) => turn.id === id)?.answer ?? "";
  const safety = record.flags.filter((flag) => SAFETY_KINDS.has(flag.kind));
  const eligibility = record.flags.filter((flag) => !SAFETY_KINDS.has(flag.kind));
  const allSkipped = record.turns.length > 0 && record.turns.every((turn) => turn.skipped);
  // The AI's own flags, less any the crisis layers or the check-in already raised
  const flagged = new Map(record.flags.map((flag) => [flag.messageId, SAFETY_KINDS.has(flag.kind) ? "safety" : "eligibility"]));
  const aiFlags = (summary?.flags ?? []).filter((flag) => {
    const category = flag.type === "past_risk" ? "safety" : flag.type;
    return !flag.cites.every((cite) => flagged.get(cite) === category);
  });

  const age = patient && "age" in patient && patient.age ? patient.age : ageFromThisTab();
  const line = patient
    ? (age ? copy.clinician.patientLine.replace("{age}", String(age)) : copy.clinician.patientLineNoAge)
        .replace("{name}", patient.name)
        .replace("{when}", patient.when)
    : undefined;

  // A source chip opens "All answers" at that answer
  const openAt = (id: string) => {
    sheet.current?.open();
    requestAnimationFrame(() => {
      const answer = document.getElementById(`answer-${id}`);
      answer?.scrollIntoView({ block: "start" });
      answer?.focus();
    });
  };
  const Source = ({ cites }: { cites: string[] }) => (
    <span className="flex flex-none gap-1">
      {cites.map((cite) =>
        number(cite) > 0 ? (
          <button
            key={cite}
            type="button"
            aria-label={copy.clinician.sourceReader.replace("{number}", String(number(cite)))}
            onClick={() => openAt(cite)}
            className="focus-ring flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-full bg-wash px-2 text-label font-bold text-action hover:bg-tag"
          >
            {copy.clinician.sourceChip.replace("{number}", String(number(cite)))}
          </button>
        ) : null,
      )}
    </span>
  );

  return (
    <Screen
      width="picker"
      footer={
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 lg:justify-center">
            {demo ?? <span />}
            <Button variant="text" onClick={() => sheet.current?.open()}>
              {copy.clinician.allAnswers}
            </Button>
          </div>
          {sample && <DemoLine>{copy.clinician.sample}</DemoLine>}
        </div>
      }
    >
      <Header provider={record.provider} line={line} />

      {safety.map((flag) => (
        <SafetyCard key={`${flag.kind}-${flag.messageId}`} flag={flag} quote={answerText(flag.messageId)} keptGoing={number(flag.messageId) < record.turns.length} source={<Source cites={[flag.messageId]} />} />
      ))}

      {(eligibility.length > 0 || aiFlags.length > 0) && (
        <Card className="gap-2">
          <h2 className="text-label font-semibold text-slate">{copy.clinician.flagsTitle}</h2>
          <ul className="flex flex-col gap-2">
            {eligibility.map((flag) => (
              <li key={`${flag.kind}-${flag.messageId}`} className="flex items-start justify-between gap-3 text-body">
                <span>{copy.clinician.flagKinds[flag.kind]}</span>
                <Source cites={[flag.messageId]} />
              </li>
            ))}
            {aiFlags.map((flag, i) => (
              <li key={`ai-${i}`} className="flex items-start justify-between gap-3 text-body">
                <span>{flag.note}</span>
                <Source cites={flag.cites} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {allSkipped && <p className="text-body">{copy.clinician.skippedAll}</p>}
      {summary === null && !allSkipped && <p className="text-body">{copy.clinician.noSummary}</p>}

      {summary && (summary.main_concern.length > 0 || summary.medications.length > 0) && (
        <Card className="gap-0 divide-y divide-line">
          {summary.main_concern.length > 0 && (
            <Section title={copy.clinician.sections.main_concern}>
              {summary.main_concern.map((item, i) => (
                <Row key={i} source={<Source cites={item.cites} />}>
                  “{item.quote}”
                </Row>
              ))}
            </Section>
          )}
          {summary.medications.length > 0 && (
            <Section title={copy.clinician.sections.medications}>
              {summary.medications.map((medication, i) => (
                <Row key={i} source={<Source cites={medication.cites} />} bullet>
                  <MedicationLine medication={medication} />
                </Row>
              ))}
            </Section>
          )}
        </Card>
      )}

      <Sheet ref={sheet} title={copy.clinician.allAnswers} titleId="all-answers-title">
        <div className="-mx-4 flex max-h-[70dvh] flex-col gap-4 overflow-y-auto px-4 md:-mx-6 md:px-6">
          {summary && <OtherSections summary={summary} Source={Source} />}
          <ol className="flex flex-col gap-3">
            {record.turns.map((turn, i) => (
              <li key={turn.id} id={`answer-${turn.id}`} tabIndex={-1} className="flex scroll-mt-2 flex-col gap-0.5 rounded-tile bg-tint p-3 outline-none">
                <p className="text-label font-semibold text-slate">
                  {copy.clinician.sourceChip.replace("{number}", String(i + 1))} · {turn.question}
                </p>
                <p className={cx("text-body", turn.skipped ? "text-slate" : "text-ink")}>{turn.skipped ? copy.clinician.skipped : turn.answer}</p>
              </li>
            ))}
          </ol>
        </div>
      </Sheet>
    </Screen>
  );
}

function SafetyCard({ flag, quote, keptGoing, source }: { flag: CheckInFlag; quote: string; keptGoing: boolean; source: ReactNode }) {
  return (
    <section aria-label={copy.clinician.safetyTitle} className="flex flex-col gap-1.5 rounded-card border-[1.5px] border-error-line bg-error-tint p-4 text-error-ink md:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-body font-bold">
          <Flag size={18} className="text-error" />
          {copy.clinician.safetyTitle}
        </h2>
        {source}
      </div>
      <p className="text-label font-semibold">{copy.clinician.flagKinds[flag.kind]}</p>
      {quote && <p className="text-body-lg font-bold">“{quote}”</p>}
      {keptGoing && <p className="text-body">{copy.clinician.keptGoing}</p>}
    </section>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
      <h2 className="text-label font-semibold text-slate">{title}</h2>
      <ul className="flex flex-col gap-1.5">{children}</ul>
    </section>
  );
}

function Row({ children, source, bullet = false }: { children: ReactNode; source: ReactNode; bullet?: boolean }) {
  return (
    <li className="flex items-start justify-between gap-3 text-body text-ink">
      <span className={cx(bullet && "relative pl-4 before:absolute before:top-2.5 before:left-1 before:size-1.5 before:rounded-full before:bg-navy")}>{children}</span>
      {source}
    </li>
  );
}

function OtherSections({ summary, Source }: { summary: ClinicianSummary; Source: (props: { cites: string[] }) => ReactNode }) {
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
              <Row key={i} source={<Source cites={item.cites} />}>
                {item.text}
              </Row>
            ))}
          </Section>
        ) : null,
      )}
      {summary.unclear.length > 0 && (
        <Section title={copy.clinician.sections.unclear}>
          {summary.unclear.map((item, i) => (
            <Row key={i} source={<Source cites={item.cites} />}>
              “{item.quote}”
            </Row>
          ))}
        </Section>
      )}
    </>
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

// The age, from the date of birth this tab answered on screen 1, if it's here
function ageFromThisTab(): number | null {
  try {
    const dob = parseDateOfBirth(getAnswers().dateOfBirth ?? "");
    return dob ? ageOn(dob, todayInCentral()) : null;
  } catch {
    return null;
  }
}
