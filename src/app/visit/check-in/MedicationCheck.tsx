"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { cx } from "@/components/cx";
import { Pill } from "@/components/icons";
import { Card } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { copy } from "@/copy";
import { applyMedicationAnswer, medicationFromPatient, type SummaryMedication } from "@/lib/ai/check-in-summary";
import { track } from "@/lib/analytics/track";
import type { CheckInState } from "@/lib/check-in/stored";
import { CheckInScreen } from "./CheckInScreen";

// "Did we get your medications right?" at the end of the check-in (Claude
// Design's 12-MedCheck). Each medication shows as the patient said it, or as
// it was heard. When what we heard isn't a known drug and one is clearly
// nearest, "Did you mean {drug}?": the patient decides, never the AI. A real
// drug that doesn't fit gets "Can you check the name of this medication?" and
// stays unclear. Changes are applied in plain code

type Answers = Record<number, "accept_suggestion" | "keep">;

export function MedicationCheck({ state, onDone }: { state: CheckInState; onDone: (patch: Partial<CheckInState>) => Promise<void> }) {
  const medications = state.summary?.medications ?? [];
  const [answers, setAnswers] = useState<Answers>({});
  const [fixing, setFixing] = useState(false);
  const [names, setNames] = useState<string[]>(() => medications.map((m) => m.name_as_said));
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (!state.summary) return;
    setBusy(true);
    const checked = medications.map((medication, i) => applyMedicationAnswer(medication, { kind: answers[i] ?? "keep" }));
    const edited = fixing ? applyEdits(checked, names) : checked;
    await onDone({
      summary: { ...state.summary, medications: edited },
      medicationsChanged: fixing || Object.values(answers).includes("accept_suggestion"),
    });
  };

  const none = medications.length === 0 && !fixing;
  const skip = (
    <ButtonLink
      href="/visit"
      variant="text"
      className="min-h-control-sm self-center text-label! font-medium! text-slate! underline underline-offset-4"
      onClick={() => track("portal.intake.skipped")}
    >
      {copy.checkIn.skipCheckIn}
    </ButtonLink>
  );

  return (
    <CheckInScreen
      answered={copy.checkIn.questions.length}
      footer={
        <div className="flex flex-col items-stretch gap-1">
          <Button onClick={confirm} disabled={busy} className="w-full">
            {none ? copy.checkIn.medsNoneYes : copy.checkIn.medsYes}
          </Button>
          {!fixing && (
            <Button
              variant="text"
              onClick={() => {
                if (none) setNames([""]);
                setFixing(true);
              }}
            >
              {none ? copy.checkIn.medsAdd : copy.checkIn.medsFix}
            </Button>
          )}
          {skip}
        </div>
      }
    >
      <Card className="gap-3">
        <h2 id="meds-title" className="text-question font-semibold text-ink md:text-card-question">
          {copy.checkIn.medsTitle}
        </h2>
        {fixing ? (
          <div className="flex flex-col gap-2">
            {names.map((name, i) => (
              <div key={i} className="flex items-start gap-1">
                <TextField
                  id={`medication-${i}`}
                  label={copy.checkIn.medicationField}
                  value={name}
                  maxLength={100}
                  onChange={(value) => setNames((current) => current.map((n, j) => (j === i ? value : n)))}
                  className="flex-1"
                />
                <Button variant="text" className="mt-1" onClick={() => setNames((current) => current.filter((_, j) => j !== i))}>
                  {copy.checkIn.removeMedication}
                </Button>
              </div>
            ))}
            <Button variant="text" className="-ml-2 self-start" onClick={() => setNames((current) => [...current, ""])}>
              {copy.checkIn.medsAdd}
            </Button>
          </div>
        ) : none ? (
          <p className="text-body">{copy.checkIn.medsNone}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {medications.map((medication, i) => (
              <li key={i} className="flex gap-3 rounded-tile bg-tint p-3">
                <span aria-hidden="true" className="flex size-9 flex-none items-center justify-center rounded-full bg-white text-brand">
                  <Pill size={18} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-body font-bold text-ink">{[medication.name_as_said, medication.dose].filter(Boolean).join(" ")}</p>
                  {medication.details && <p className="text-body text-slate">“{medication.details}”</p>}
                  <MedicationQuestion
                    medication={medication}
                    answer={answers[i]}
                    onAnswer={(answer) => setAnswers((current) => ({ ...current, [i]: answer }))}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </CheckInScreen>
  );
}

function MedicationQuestion({
  medication,
  answer,
  onAnswer,
}: {
  medication: SummaryMedication;
  answer: Answers[number] | undefined;
  onAnswer: (answer: Answers[number]) => void;
}) {
  if (medication.question?.kind === "check_name") return <p className="text-body font-semibold text-ink">{copy.checkIn.checkName}</p>;
  if (medication.question?.kind !== "did_you_mean") return null;

  const question = copy.checkIn.didYouMean.replace("{drug}", medication.question.suggestion);
  const option = (value: Answers[number], label: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={answer === value}
      onClick={() => onAnswer(value)}
      className={cx(
        "focus-ring inline-flex min-h-control-sm cursor-pointer items-center rounded-full px-4 text-body whitespace-nowrap",
        answer === value ? "border-2 border-action bg-wash font-bold text-ink" : "border-[1.5px] border-line-control bg-white font-medium text-navy hover:border-action",
      )}
    >
      {label}
    </button>
  );
  return (
    <div role="radiogroup" aria-label={question} className="flex flex-col gap-2 pt-1">
      <p className="text-body font-semibold text-ink">{question}</p>
      <div className="flex flex-wrap gap-2">
        {option("accept_suggestion", copy.checkIn.didYouMeanYes)}
        {option("keep", copy.checkIn.didYouMeanNo)}
      </div>
    </div>
  );
}

// "Fix something": a name the patient changed or added goes through the same
// name check; one they removed is dropped. Unchanged ones stay as they were
function applyEdits(medications: SummaryMedication[], names: string[]): SummaryMedication[] {
  return names
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name, i) => medications.find((m) => m.name_as_said === name) ?? medicationFromPatient(name, medications[i]?.cites ?? []));
}
