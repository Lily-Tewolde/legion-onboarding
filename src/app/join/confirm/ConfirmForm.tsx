"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { cx } from "@/components/cx";
import { SegmentedControl } from "@/components/SegmentedControl";
import { TextField } from "@/components/TextField";
import { copy } from "@/copy";
import { CONCERN_LABELS, type ConcernLabel } from "@/data";
import type { Diagnosed, Understanding } from "@/lib/ai/whats-going-on";
import { todayInCentral } from "@/lib/central-time";
import { partialOutcome, tapOutcome, validateFacts, type YesNo } from "@/lib/fit/rules";
import { getAnswers, saveAnswers } from "@/lib/fit/stored-answers";
import { useLeave } from "@/lib/fit/use-leave";
import { diagnosisRows, knownDiagnoses, type RecheckType, recheckRows, toggleChip } from "@/lib/whats-going-on/flow";
import { type WhatsGoingOnState, whatsGoingOnStore } from "@/lib/whats-going-on/stored";

// Screen 3. The patient checks what we understood: removes what's wrong, adds
// what we missed, answers "Have you been diagnosed with {item}?" for each
// concern where we don't
// know, and answers one small double-check row for anything that contradicted
// screen 1. The double-checks run the same rule as screen 1: a one-tap answer
// acts as soon as it's tapped, the date of birth on "Looks right" (Lily, PR 5).
// "Looks right" saves the standard English labels to the session

type Chip = Understanding["chips"][number];

type RecheckField = "inTexas" | "medicaidOrMedicare" | "hospital";

const RECHECK_FIELD: Record<Exclude<RecheckType, "age">, RecheckField> = {
  state: "inTexas",
  insurance: "medicaidOrMedicare",
  hospital_stay: "hospital",
};

const RECHECK_LEGEND: Record<Exclude<RecheckType, "age">, string> = {
  state: `${copy.confirm.recheck.stateLead} ${copy.join.inTexas}`,
  insurance: `${copy.confirm.recheck.insuranceLead} ${copy.join.selfPayMedicaid}`,
  hospital_stay: `${copy.confirm.recheck.hospitalLead} ${copy.join.hospital}`,
};

export function ConfirmForm() {
  const state = useSyncExternalStore(whatsGoingOnStore.subscribe, whatsGoingOnStore.get, whatsGoingOnStore.getServer);
  if (!state) return <ConfirmSkeleton />;
  return state.understanding ? <Confirm state={state} understanding={state.understanding} /> : <BackToStart />;
}

function ConfirmSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <div className="h-control-sm w-2/3 rounded-full bg-wash motion-safe:animate-pulse" />
      <div className="h-6 w-full rounded-md bg-wash motion-safe:animate-pulse" />
    </div>
  );
}

// Nothing to confirm in this tab (opened directly, or in a new tab). Checks
// the store again when it runs: Next keeps this screen alive in the
// background, so it can render here after "Start over" and only run once a
// new answer has been saved
function BackToStart() {
  const router = useRouter();
  useEffect(() => {
    if (!whatsGoingOnStore.get().understanding) router.replace("/join/whats-going-on");
  }, [router]);
  return <ConfirmSkeleton />;
}

// Each concern's diagnosis question has its own error, keyed by its label
type Errors = Partial<Record<RecheckType | "save", boolean>> & { diagnoses?: ConcernLabel[] };

function Confirm({ state, understanding }: { state: WhatsGoingOnState; understanding: Understanding }) {
  const router = useRouter();
  const leave = useLeave();
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [rechecks, setRechecks] = useState<Partial<Record<RecheckField, YesNo>> & { dateOfBirth?: string }>({});

  // Next keeps this screen alive when people move on. Clear what was in
  // progress as it's hidden
  useLayoutEffect(
    () => () => {
      setAdding(false);
      setErrors({});
      setSaving(false);
      setRechecks({});
    },
    [],
  );

  const chips: Chip[] = state.confirmChips ?? understanding.chips;
  const labels = chips.map((chip) => chip.label);
  const diagnosisFor = diagnosisRows(labels, knownDiagnoses(understanding));
  const answers = state.diagnoses ?? {};
  const rows = recheckRows(understanding);

  const setChips = (next: ConcernLabel[]) => {
    const display = new Map(chips.map((chip) => [chip.label, chip.display]));
    whatsGoingOnStore.save({
      ...state,
      confirmChips: next.map((label) => ({ label, display: display.get(label) ?? copy.conditions[label] })),
    });
  };

  const tap = (type: Exclude<RecheckType, "age">, value: YesNo) => {
    const field = RECHECK_FIELD[type];
    setRechecks((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [type]: false }));
    const nextFit = { ...getAnswers(), [field]: value };
    saveAnswers(nextFit);
    const outcome = tapOutcome(field, nextFit);
    if (outcome) leave(outcome, nextFit, field);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const today = todayInCentral();
    const found: Errors = {};
    const unanswered = diagnosisFor.filter((label) => !answers[label]);
    if (unanswered.length > 0) found.diagnoses = unanswered;
    for (const row of rows) {
      if (row === "age") {
        if (validateFacts({ dateOfBirth: rechecks.dateOfBirth }, today).dateOfBirth) found.age = true;
      } else if (!rechecks[RECHECK_FIELD[row]]) {
        found[row] = true;
      }
    }
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    // The date of birth double-check runs the age rule, like screen 1's Continue
    if (rows.includes("age")) {
      const nextFit = { ...getAnswers(), dateOfBirth: rechecks.dateOfBirth };
      saveAnswers(nextFit);
      const outcome = partialOutcome(nextFit, today);
      if (outcome) {
        leave(outcome, nextFit);
        return;
      }
    }

    setSaving(true);
    try {
      const response = await fetch("/api/join/concerns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labels }),
      });
      if (!response.ok) throw new Error(`saving concerns failed: ${response.status}`);
      const { path } = await response.json();
      router.push(path);
    } catch {
      setErrors({ save: true });
      setSaving(false);
    }
  };

  const startOver = () => {
    whatsGoingOnStore.save({ text: "", chips: [] });
    router.push("/join/whats-going-on");
  };

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <ul className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <li
              key={chip.label}
              className="inline-flex min-h-control-sm items-center gap-1 rounded-full border border-action bg-wash pl-4 text-base font-medium text-navy"
            >
              {chip.display}
              {chips.length > 1 ? (
                <button
                  type="button"
                  aria-label={copy.confirm.remove.replace("{item}", chip.display)}
                  onClick={() => setChips(labels.filter((label) => label !== chip.label))}
                  className="focus-ring inline-flex size-control-sm cursor-pointer items-center justify-center rounded-full text-lg"
                >
                  <span aria-hidden="true">×</span>
                </button>
              ) : (
                <span className="pr-4" />
              )}
            </li>
          ))}
        </ul>
        <Button variant="text" className="self-start" aria-expanded={adding} onClick={() => setAdding(!adding)}>
          {copy.confirm.add}
        </Button>
        {adding && (
          <div className="flex flex-wrap gap-2">
            {CONCERN_LABELS.filter((label) => !labels.includes(label)).map((label) => (
              <Button
                key={label}
                variant="secondary"
                size="small"
                onClick={() => {
                  setChips(toggleChip(labels, label));
                  setAdding(false);
                }}
              >
                {copy.conditions[label]}
              </Button>
            ))}
          </div>
        )}
      </div>

      {labels.includes("Anxiety") && <p className="text-slate">{copy.confirm.policy.Anxiety}</p>}

      {diagnosisFor.map((label) => {
        const display = chips.find((chip) => chip.label === label)?.display ?? copy.conditions[label];
        return (
          <SegmentedControl
            key={label}
            legend={copy.confirm.diagnosed.replace("{item}", display)}
            name={`diagnosed-${label}`}
            options={[
              { value: "yes", label: copy.join.yes },
              { value: "no", label: copy.join.no },
              { value: "not_sure", label: copy.confirm.notSure },
            ]}
            value={answers[label]}
            onChange={(value) => {
              setErrors((current) => ({ ...current, diagnoses: current.diagnoses?.filter((l) => l !== label) }));
              whatsGoingOnStore.save({ ...state, diagnoses: { ...answers, [label]: value as Diagnosed } });
            }}
            error={errors.diagnoses?.includes(label) ? copy.join.errors.required : undefined}
          />
        );
      })}

      {rows.map((row) =>
        row === "age" ? (
          <TextField
            key={row}
            id="recheck-dateOfBirth"
            label={copy.confirm.recheck.dateOfBirth}
            hint={copy.join.dateOfBirthHint}
            value={rechecks.dateOfBirth ?? ""}
            onChange={(value) => {
              setRechecks((current) => ({ ...current, dateOfBirth: value }));
              setErrors((current) => ({ ...current, age: false }));
            }}
            error={errors.age ? copy.join.errors.dateOfBirth : undefined}
            inputMode="numeric"
            autoComplete="bday"
          />
        ) : (
          <SegmentedControl
            key={row}
            legend={RECHECK_LEGEND[row]}
            name={`recheck-${row}`}
            options={[
              { value: "yes", label: copy.join.yes },
              { value: "no", label: copy.join.no },
            ]}
            value={rechecks[RECHECK_FIELD[row]]}
            onChange={(value) => tap(row, value as YesNo)}
            error={errors[row] ? copy.join.errors.required : undefined}
          />
        ),
      )}

      <p className="text-slate">{copy.confirm.notDiagnosis}</p>

      <div className="flex flex-col items-start gap-3">
        {errors.save && (
          <div role="alert" className="flex flex-col gap-1">
            <p className="text-error">{copy.common.somethingWentWrong}</p>
            <p>{copy.common.keepsHappening}</p>
          </div>
        )}
        <Button type="submit" disabled={saving}>
          {errors.save ? copy.common.tryAgain : copy.confirm.looksRight}
        </Button>
        <Button variant="text" onClick={startOver} className={cx(saving && "pointer-events-none")}>
          {copy.confirm.startOver}
        </Button>
      </div>
    </form>
  );
}
