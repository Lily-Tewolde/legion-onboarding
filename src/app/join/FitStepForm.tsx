"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { TalkToPersonButton } from "@/components/HelpPanel";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Select } from "@/components/Select";
import { Tag } from "@/components/Tag";
import { TextField } from "@/components/TextField";
import { copy } from "@/copy";
import { findPlan, plans } from "@/data";
import { todayInCentral } from "@/lib/central-time";
import { FIT_STEPS, type FitStep, nextStep, outcomePath, previousStep, stepOf } from "@/lib/fit/flow";
import {
  type FieldErrors,
  type FitAnswers,
  type FitField,
  type FitOutcome,
  PLAN_NOT_LISTED,
  partialOutcome,
  validateFacts,
  validateFields,
  type YesNo,
} from "@/lib/fit/rules";
import { getAnswers, getServerAnswers, saveAnswers, subscribeAnswers } from "@/lib/fit/stored-answers";

// One step of screen 1. Errors show on Continue, next to each question. A
// rule acts as soon as its answer is in: "Yes" to safety opens the crisis
// screen, Medicaid or Medicare and "Yes" to the hospital question open their
// screen-out, all straight away and saved in the background; age and Texas
// are checked on the first step's Continue. The last step's Continue sends
// everything to the server, which runs the rules and saves the outcome

const ERROR_TEXT = {
  date_of_birth: copy.join.errors.dateOfBirth,
  pay_method: copy.join.errors.payMethod,
  plan_not_listed: copy.join.errors.planNotListed,
  required: copy.join.errors.required,
};

const planOptions = [
  ...plans.map((plan) => ({ value: plan.id, label: plan.name })),
  { value: PLAN_NOT_LISTED, label: copy.join.planNotListed },
];

// Where each step can go next, loaded in advance so it opens straight away
const PREFETCH: Record<FitStep, string[]> = {
  about: [FIT_STEPS.insurance.path, "/join/not-a-fit/under_18", "/join/not-a-fit/not_in_texas"],
  insurance: [FIT_STEPS.health.path, "/join/not-a-fit/medicaid_medicare"],
  health: ["/help-now", "/join/not-a-fit/hospital_stay"],
};

// The answers live in this browser tab's storage, so the form renders in the
// browser only, with a skeleton until then. Reading them from the store (not
// component state) means they're current when Next shows a step again after
// "Go back" or "I'm safe right now"
export function FitStepForm({ step }: { step: FitStep }) {
  const answers = useSyncExternalStore(subscribeAnswers, getAnswers, getServerAnswers);
  return answers ? <StepForm step={step} answers={answers} /> : <FormSkeleton />;
}

function FormSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-8">
      {[0, 1].map((row) => (
        <div key={row} className="flex flex-col gap-3">
          <div className="h-6 w-2/3 rounded-md bg-wash motion-safe:animate-pulse" />
          <div className="h-control rounded-lg bg-wash motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function StepForm({ step, answers }: { step: FitStep; answers: FitAnswers }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const started = useRef(false);
  const fields: readonly FitField[] = FIT_STEPS[step].fields;

  // Next keeps this step alive when people move on. Clear what was in
  // progress as it's hidden, so it isn't still "submitting" when they come back
  useLayoutEffect(
    () => () => {
      setSubmitting(false);
      setFailed(false);
      setErrors({});
    },
    [],
  );

  useEffect(() => {
    for (const path of PREFETCH[step]) router.prefetch(path);
  }, [router, step]);

  const update = (patch: FitAnswers) => {
    const next = { ...answers, ...patch };
    saveAnswers(next);
    setErrors((current) => {
      const rest = { ...current };
      for (const key of Object.keys(patch)) delete rest[key as FitField];
      return rest;
    });
    startSession();
    return next;
  };

  // The visitor has started once they answer anything
  const startSession = () => {
    if (started.current) return;
    started.current = true;
    fetch("/api/session", { method: "POST" }).catch(() => {});
  };

  // Saved in the background, so the screen-out or crisis screen never waits
  const leave = (outcome: FitOutcome, next: FitAnswers) => {
    fetch("/api/join/fit", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "outcome", answers: next }),
    }).catch(() => {});
    router.push(outcomePath(outcome));
  };

  const actOn = (next: FitAnswers) => {
    const outcome = partialOutcome(next, todayInCentral());
    if (outcome) leave(outcome, next);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const today = todayInCentral();
    const found = validateFields(fields, answers, today);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      focusFirstError(fields, found);
      return;
    }

    const following = nextStep[step];
    if (following) {
      const outcome = partialOutcome(answers, today);
      if (outcome) leave(outcome, answers);
      else router.push(FIT_STEPS[following].path);
      return;
    }

    // The last step: an earlier step that isn't finished comes first
    const missing = Object.keys(validateFacts(answers, today)) as FitField[];
    if (missing.length > 0) {
      router.push(FIT_STEPS[stepOf(missing[0])].path);
      return;
    }
    setSubmitting(true);
    setFailed(false);
    try {
      const response = await fetch("/api/join/fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "submit", answers }),
      });
      if (!response.ok) throw new Error(`fit check failed: ${response.status}`);
      const { path } = await response.json();
      router.push(path);
    } catch {
      setFailed(true);
      setSubmitting(false);
    }
  };

  const error = (field: FitField) => {
    const code = errors[field];
    return code ? ERROR_TEXT[code] : undefined;
  };

  const back = previousStep[step];

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-8">
      {step === "about" && (
        <>
          <TextField
            id="dateOfBirth"
            label={copy.join.dateOfBirth}
            hint={copy.join.dateOfBirthHint}
            value={answers.dateOfBirth ?? ""}
            onChange={(value) => update({ dateOfBirth: value })}
            error={error("dateOfBirth")}
            inputMode="numeric"
            autoComplete="bday"
          />
          <SegmentedControl
            legend={copy.join.inTexas}
            name="inTexas"
            options={[
              { value: "yes", label: copy.join.yes },
              { value: "no", label: copy.join.no },
            ]}
            value={answers.inTexas}
            onChange={(value) => update({ inTexas: value as YesNo })}
            error={error("inTexas")}
          />
        </>
      )}

      {step === "insurance" && (
        <InsuranceQuestions
          answers={answers}
          update={update}
          actOn={actOn}
          error={error}
        />
      )}

      {step === "health" && (
        <>
          <SegmentedControl
            legend={copy.join.safety}
            name="safety"
            hint={copy.join.safetyHint}
            options={[
              { value: "no", label: copy.join.no },
              { value: "yes", label: copy.join.yes },
            ]}
            value={answers.safety}
            onChange={(value) => actOn(update({ safety: value as YesNo, safeConfirmed: false }))}
            error={error("safety")}
          />
          <SegmentedControl
            legend={copy.join.hospital}
            name="hospital"
            hint={copy.join.hospitalHint}
            options={[
              { value: "no", label: copy.join.no },
              { value: "yes", label: copy.join.yes },
            ]}
            value={answers.hospital}
            onChange={(value) => actOn(update({ hospital: value as YesNo }))}
            error={error("hospital")}
          />
        </>
      )}

      <div className="flex flex-col items-start gap-3">
        {failed && (
          <div role="alert" className="flex flex-col gap-1">
            <p className="text-error">{copy.common.somethingWentWrong}</p>
            <p>{copy.common.keepsHappening}</p>
          </div>
        )}
        <Button type="submit" disabled={submitting}>
          {failed ? copy.common.tryAgain : copy.common.continue}
        </Button>
        {back && (
          <Button variant="text" onClick={() => router.push(FIT_STEPS[back].path)}>
            {copy.common.back}
          </Button>
        )}
      </div>
    </form>
  );
}

function InsuranceQuestions({
  answers,
  update,
  actOn,
  error,
}: {
  answers: FitAnswers;
  update: (patch: FitAnswers) => FitAnswers;
  actOn: (next: FitAnswers) => void;
  error: (field: FitField) => string | undefined;
}) {
  const plan = answers.planId ? findPlan(answers.planId) : undefined;

  return (
    <>
      <SegmentedControl
        legend={copy.join.payMethod}
        name="payMethod"
        options={[
          { value: "insurance", label: copy.join.withInsurance },
          { value: "self_pay", label: copy.join.selfPay },
        ]}
        value={answers.payMethod}
        onChange={(value) =>
          update(value === "self_pay" ? { payMethod: "self_pay", planId: undefined } : { payMethod: "insurance" })
        }
        error={error("payMethod")}
      />

      {answers.payMethod === "insurance" && (
        <div className="flex flex-col gap-3">
          <Select
            id="planId"
            label={copy.join.plan}
            placeholder={copy.join.planPlaceholder}
            options={planOptions}
            value={answers.planId}
            onChange={(value) => actOn(update({ planId: value }))}
            error={error("planId")}
          />
          {plan && !plan.screensOut && (
            <div className="flex flex-col gap-2">
              <p>{copy.coverage.covered}</p>
              <div>
                <Tag>{copy.common.fromLegion}</Tag>
              </div>
              <p>{copy.coverage.fullCostLater}</p>
              <div>
                <Tag>{copy.coverage.simulated}</Tag>
              </div>
            </div>
          )}
          {answers.planId === PLAN_NOT_LISTED && (
            <div className="flex flex-col items-start gap-2">
              <p>{copy.coverage.notListed}</p>
              <Button
                variant="secondary"
                onClick={() => update({ payMethod: "self_pay", planId: undefined })}
              >
                {copy.coverage.continueSelfPay}
              </Button>
              <TalkToPersonButton label={copy.coverage.talkToPerson} />
            </div>
          )}
        </div>
      )}

      {answers.payMethod === "self_pay" && (
        <div className="flex flex-col gap-2">
          <p>{copy.join.selfPayPrice}</p>
          <div>
            <Tag>{copy.common.fromLegion}</Tag>
          </div>
        </div>
      )}
    </>
  );
}

// Moves focus to the step's first question with an error, so keyboard and
// screen reader users land on it
function focusFirstError(fields: readonly FitField[], errors: FieldErrors) {
  const field = fields.find((name) => errors[name]);
  if (!field) return;
  const target =
    document.getElementById(field) ?? document.querySelector<HTMLInputElement>(`input[name="${field}"]`);
  target?.focus();
}
