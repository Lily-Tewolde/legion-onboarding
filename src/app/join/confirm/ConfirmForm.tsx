"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { ConcernIcon } from "@/components/concernIcons";
import { cx } from "@/components/cx";
import { Close, Info, Plus } from "@/components/icons";
import { Card, PageTitle, Screen } from "@/components/Screen";
import { FieldError, SegmentedControl } from "@/components/SegmentedControl";
import { Skeleton } from "@/components/Skeleton";
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
import { track } from "@/lib/analytics/track";

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

const FLOW = { phase: "whats_going_on" as const, part: 2, parts: 2, back: "/join/whats-going-on" };

function Heading() {
  return (
    <div className="flex flex-col gap-2">
      <PageTitle>{copy.confirm.title}</PageTitle>
      <p className="text-body md:text-body-lg">{copy.confirm.intro}</p>
    </div>
  );
}

function ConfirmSkeleton() {
  return (
    <Screen flow={FLOW} width="picker">
      <Heading />
      <Skeleton rows={1} />
    </Screen>
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

  // An arrow key only records the answer; leaving needs a tap, Space, Enter
  // or "Looks right"
  const tap = (type: Exclude<RecheckType, "age">, value: YesNo, explicit = true) => {
    const field = RECHECK_FIELD[type];
    setRechecks((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [type]: false }));
    const nextFit = { ...getAnswers(), [field]: value };
    saveAnswers(nextFit);
    if (!explicit) return;
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
      const original = understanding.chips.map((chip) => chip.label);
      const corrected = original.length !== labels.length || original.some((label) => !labels.includes(label));
      track("portal.concern.confirmed", { corrected, labels });
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

  const YES_NO = [
    { value: "yes", label: copy.join.yes },
    { value: "no", label: copy.join.no },
  ];

  return (
    <Screen
      flow={FLOW}
      width="picker"
      footer={
        <div className="flex flex-col items-stretch gap-1">
          {errors.save && (
            <div role="alert" className="flex flex-col gap-1">
              <FieldError>{copy.common.somethingWentWrong}</FieldError>
              <p className="text-body text-slate">{copy.common.keepsHappening}</p>
            </div>
          )}
          <Button type="submit" form="confirm-form" disabled={saving} className="w-full">
            {errors.save ? copy.common.tryAgain : copy.confirm.looksRight}
          </Button>
          <Button variant="text" onClick={startOver} className={cx(saving && "pointer-events-none")}>
            {copy.confirm.startOver}
          </Button>
        </div>
      }
    >
      <Heading />
      <form id="confirm-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-3 md:gap-4">
        <div className="flex flex-col gap-2">
          <ul className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li
                key={chip.label}
                className="inline-flex min-h-control-sm items-center gap-2 rounded-full border-2 border-action bg-wash pl-2 text-body font-bold whitespace-nowrap text-ink"
              >
                <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-white text-brand">
                  <ConcernIcon label={chip.label} />
                </span>
                {chip.display}
                {chips.length > 1 ? (
                  <button
                    type="button"
                    aria-label={copy.confirm.remove.replace("{item}", chip.display)}
                    onClick={() => setChips(labels.filter((label) => label !== chip.label))}
                    className="focus-ring -ml-1 inline-flex size-control-sm cursor-pointer items-center justify-center rounded-full text-slate hover:text-ink"
                  >
                    <Close size={16} />
                  </button>
                ) : (
                  <span className="pr-3" />
                )}
              </li>
            ))}
            <li>
              <button
                type="button"
                aria-expanded={adding}
                onClick={() => setAdding(!adding)}
                className="focus-ring inline-flex min-h-control-sm cursor-pointer items-center justify-center rounded-full border-[1.5px] border-dashed border-line-control bg-white text-body font-semibold text-action hover:border-action max-md:size-control-sm md:px-4"
              >
                {/* On phones a round + that screen readers hear as "Add something we missed" */}
                <Plus size={20} className="md:hidden" />
                <span className="sr-only md:hidden">{copy.confirm.addLabel}</span>
                <span className="max-md:hidden">{copy.confirm.add}</span>
              </button>
            </li>
          </ul>
          {adding && (
            <div className="rise flex flex-wrap gap-2">
              {CONCERN_LABELS.filter((label) => !labels.includes(label)).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setChips(toggleChip(labels, label));
                    setAdding(false);
                  }}
                  className="focus-ring inline-flex min-h-control-sm cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line-control bg-white pr-3 pl-2 text-body font-medium whitespace-nowrap text-navy hover:border-action"
                >
                  <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-wash text-brand">
                    <ConcernIcon label={label} />
                  </span>
                  {copy.conditions[label]}
                </button>
              ))}
            </div>
          )}
        </div>

        {labels.includes("Anxiety") && (
          <p className="flex items-start gap-2 text-body text-navy">
            <Info size={18} className="mt-[3px] flex-none text-brand" />
            {copy.confirm.policy.Anxiety.replace(/(\d) mg/g, "$1\u00a0mg")}
          </p>
        )}

        {diagnosisFor.length > 0 && (
          <Card className="gap-4">
            {diagnosisFor.map((label) => {
              const name =
                label in copy.confirm.diagnosisNames
                  ? copy.confirm.diagnosisNames[label as keyof typeof copy.confirm.diagnosisNames]
                  : copy.conditions[label];
              return (
                <SegmentedControl
                  key={label}
                  legend={copy.confirm.diagnosed.replace("{item}", name)}
                  name={`diagnosed-${label}`}
                  options={[...YES_NO, { value: "not_sure", label: copy.confirm.notSure }]}
                  value={answers[label]}
                  onChange={(value) => {
                    setErrors((current) => ({ ...current, diagnoses: current.diagnoses?.filter((l) => l !== label) }));
                    whatsGoingOnStore.save({ ...state, diagnoses: { ...answers, [label]: value as Diagnosed } });
                  }}
                  error={errors.diagnoses?.includes(label) ? copy.join.errors.required : undefined}
                />
              );
            })}
          </Card>
        )}

        {rows.map((row) => (
          <Card key={row} className="rise gap-3">
            {row === "age" ? (
              <TextField
                id="recheck-dateOfBirth"
                labelOutside
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
                legend={RECHECK_LEGEND[row]}
                name={`recheck-${row}`}
                options={YES_NO}
                value={rechecks[RECHECK_FIELD[row]]}
                onChange={(value, { explicit }) => tap(row, value as YesNo, explicit)}
                error={errors[row] ? copy.join.errors.required : undefined}
              />
            )}
          </Card>
        ))}

        <p className="flex items-start gap-2 text-body text-slate">
          <Info size={18} className="mt-[3px] flex-none" />
          {copy.confirm.notDiagnosis}
        </p>
      </form>
    </Screen>
  );
}
