"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { copy } from "@/copy";
import {
  applyMedicationAnswer,
  medicationFromPatient,
  type SummaryMedication,
} from "@/lib/ai/check-in-summary";
import type { CheckInState } from "@/lib/check-in/stored";

// "Did we get your medications right?" at the end of the check-in. Each
// medication shows as the patient said it, or as it was heard. When what we
// heard isn't a known drug and one is clearly nearest, "Did you mean {drug}?":
// the patient decides, never the AI. A real drug that doesn't fit gets "Can
// you check the name of this medication?" and stays unclear. Changes are
// applied in plain code (src/lib/ai/check-in-summary.ts)

type Answers = Record<number, "accept_suggestion" | "keep">;

export function MedicationCheck({
  state,
  onDone,
}: {
  state: CheckInState;
  onDone: (patch: Partial<CheckInState>) => Promise<void>;
}) {
  const medications = state.summary?.medications ?? [];
  const [answers, setAnswers] = useState<Answers>({});
  const [fixing, setFixing] = useState(false);
  const [names, setNames] = useState<string[]>(() => medications.map((m) => m.name_as_said));
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (!state.summary) return;
    setBusy(true);
    const checked = medications.map((medication, i) =>
      applyMedicationAnswer(medication, { kind: answers[i] ?? "keep" }),
    );
    const edited = fixing ? applyEdits(checked, names) : checked;
    await onDone({
      summary: { ...state.summary, medications: edited },
      medicationsChanged: fixing || Object.values(answers).includes("accept_suggestion"),
    });
  };

  if (fixing) {
    return (
      <section aria-labelledby="meds-title" className="flex flex-col gap-6">
        <h2 id="meds-title" className="text-2xl">
          {copy.checkIn.medsTitle}
        </h2>
        {names.map((name, i) => (
          <div key={i} className="flex items-end gap-2">
            <TextField
              id={`medication-${i}`}
              label={copy.checkIn.medicationField}
              value={name}
              maxLength={100}
              onChange={(value) => setNames((current) => current.map((n, j) => (j === i ? value : n)))}
              className="flex-1"
            />
            <Button variant="text" onClick={() => setNames((current) => current.filter((_, j) => j !== i))}>
              {copy.checkIn.removeMedication}
            </Button>
          </div>
        ))}
        <Button variant="text" className="self-start" onClick={() => setNames((current) => [...current, ""])}>
          {copy.checkIn.medsAdd}
        </Button>
        <Button onClick={confirm} disabled={busy} className="self-start">
          {copy.checkIn.medsYes}
        </Button>
      </section>
    );
  }

  if (medications.length === 0) {
    return (
      <section aria-labelledby="meds-title" className="flex flex-col items-start gap-4">
        <h2 id="meds-title" className="text-2xl">
          {copy.checkIn.medsTitle}
        </h2>
        <p>{copy.checkIn.medsNone}</p>
        <Button onClick={confirm} disabled={busy}>
          {copy.checkIn.medsNoneYes}
        </Button>
        <Button
          variant="text"
          onClick={() => {
            setNames([""]);
            setFixing(true);
          }}
        >
          {copy.checkIn.medsAdd}
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="meds-title" className="flex flex-col gap-6">
      <h2 id="meds-title" className="text-2xl">
        {copy.checkIn.medsTitle}
      </h2>
      <ul className="flex flex-col gap-3">
        {medications.map((medication, i) => (
          <li key={i} className="flex flex-col gap-2 rounded-lg border border-line p-4">
            <p className="font-medium">{[medication.name_as_said, medication.dose].filter(Boolean).join(", ")}</p>
            <MedicationQuestion
              medication={medication}
              answer={answers[i]}
              onAnswer={(answer) => setAnswers((current) => ({ ...current, [i]: answer }))}
            />
          </li>
        ))}
      </ul>
      <div className="flex flex-col items-start gap-1">
        <Button onClick={confirm} disabled={busy}>
          {copy.checkIn.medsYes}
        </Button>
        <Button variant="text" onClick={() => setFixing(true)}>
          {copy.checkIn.medsFix}
        </Button>
      </div>
    </section>
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
  if (medication.question?.kind === "check_name") return <p>{copy.checkIn.checkName}</p>;
  if (medication.question?.kind !== "did_you_mean") return null;

  const question = copy.checkIn.didYouMean.replace("{drug}", medication.question.suggestion);
  return (
    <fieldset className="flex flex-col gap-2">
      <legend>{question}</legend>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="small"
          aria-pressed={answer === "accept_suggestion"}
          className={answer === "accept_suggestion" ? "border-action bg-wash" : undefined}
          onClick={() => onAnswer("accept_suggestion")}
        >
          {copy.checkIn.didYouMeanYes}
        </Button>
        <Button
          variant="secondary"
          size="small"
          aria-pressed={answer === "keep"}
          className={answer === "keep" ? "border-action bg-wash" : undefined}
          onClick={() => onAnswer("keep")}
        >
          {copy.checkIn.didYouMeanNo}
        </Button>
      </div>
    </fieldset>
  );
}

// "Fix something": a name the patient changed or added goes through the same
// name check; one they removed is dropped. Unchanged ones stay as they were
function applyEdits(medications: SummaryMedication[], names: string[]): SummaryMedication[] {
  const kept = names
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name, i) => {
      const original = medications.find((m) => m.name_as_said === name);
      return original ?? medicationFromPatient(name, medications[i]?.cites ?? []);
    });
  return kept;
}
