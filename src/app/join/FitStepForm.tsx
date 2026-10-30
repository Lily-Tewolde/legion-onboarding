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
import { FIT_STEPS, type FitStep, nextStep, previousStep, stepOf } from "@/lib/fit/flow";
import {
  type FieldErrors,
  type FitAnswers,
  type FitField,
  PLAN_NOT_LISTED,
  partialOutcome,
  type TapField,
  tapOutcome,
  validateFacts,
  validateFields,
  type YesNo,
} from "@/lib/fit/rules";
import { searchPlans } from "@/lib/fit/plan-search";
import { getAnswers, getServerAnswers, saveAnswers, subscribeAnswers } from "@/lib/fit/stored-answers";
import { useLeave } from "@/lib/fit/use-leave";

// One step of screen 1. Errors show on Continue, next to each question. Every
// one-tap answer acts the moment it's tapped, by its own rule: "Yes" to safety
// opens the crisis screen; "No" to Texas, Medicaid or Medicare (as a plan, or
// "Yes" for self-pay) and "Yes" to the hospital question open their
// screen-out, saved in the background. The date of birth waits for the first
// step's Continue. The last step's Continue sends everything to the server,
// which runs the rules and saves the outcome

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

  const leave = useLeave();

  // A one-tap answer, acted on by its own rule only
  const tap = (field: TapField, patch: FitAnswers) => {
    const next = update(patch);
    const outcome = tapOutcome(field, next);
    if (outcome) leave(outcome, next, field);
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
            onChange={(value) => tap("inTexas", { inTexas: value as YesNo })}
            error={error("inTexas")}
          />
        </>
      )}

      {step === "insurance" && (
        <InsuranceQuestions answers={answers} update={update} tap={tap} error={error} />
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
            onChange={(value) => tap("safety", { safety: value as YesNo, safeConfirmed: false })}
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
            onChange={(value) => tap("hospital", { hospital: value as YesNo })}
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
  tap,
  error,
}: {
  answers: FitAnswers;
  update: (patch: FitAnswers) => FitAnswers;
  tap: (field: TapField, patch: FitAnswers) => void;
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
          update(
            value === "self_pay"
              ? { payMethod: "self_pay", planId: undefined }
              : { payMethod: "insurance", medicaidOrMedicare: undefined },
          )
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
            onChange={(value) => tap("planId", { planId: value })}
            error={answers.planId === PLAN_NOT_LISTED ? undefined : error("planId")}
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
            <PlanSearch
              onPick={(planId) => tap("planId", { planId })}
              onSelfPay={() => update({ payMethod: "self_pay", planId: undefined })}
              showError={Boolean(error("planId"))}
            />
          )}
        </div>
      )}

      {answers.payMethod === "self_pay" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p>{copy.join.selfPayPrice}</p>
            <div>
              <Tag>{copy.common.fromLegion}</Tag>
            </div>
          </div>
          <SegmentedControl
            legend={copy.join.selfPayMedicaid}
            name="medicaidOrMedicare"
            options={[
              { value: "yes", label: copy.join.yes },
              { value: "no", label: copy.join.no },
            ]}
            value={answers.medicaidOrMedicare}
            onChange={(value) => tap("medicaidOrMedicare", { medicaidOrMedicare: value as YesNo })}
            error={error("medicaidOrMedicare")}
          />
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

// "I don't see my plan": the full plan list with a search first. Only when
// their plan still isn't there do they get self-pay or a person. Picking a
// plan here works like picking it from the field, so Medicaid or Medicare
// still screens out on tap. At most five plans show at a time
const SHOWN_PLANS = 5;

function PlanSearch({
  onPick,
  onSelfPay,
  showError,
}: {
  onPick: (planId: string) => void;
  onSelfPay: () => void;
  // Continue was pressed without a plan
  showError: boolean;
}) {
  const [query, setQuery] = useState("");
  const [stillNotListed, setStillNotListed] = useState(false);
  const results = searchPlans(query);
  const notFound = stillNotListed || results.length === 0;
  const hidden = results.length - SHOWN_PLANS;

  if (notFound) {
    return (
      <div aria-live="polite" className="flex flex-col items-start gap-2">
        <p>{copy.coverage.notListed}</p>
        <Button variant="secondary" onClick={onSelfPay}>
          {copy.coverage.continueSelfPay}
        </Button>
        <TalkToPersonButton label={copy.coverage.talkToPerson} />
        <Button
          variant="text"
          onClick={() => {
            setQuery("");
            setStillNotListed(false);
          }}
        >
          {copy.coverage.searchAgain}
        </Button>
        {showError && (
          <p role="alert" className="text-error">
            {copy.join.errors.planNotListed}
          </p>
        )}
      </div>
    );
  }

  return (
    <section aria-labelledby="plan-search-title" className="flex flex-col gap-3">
      <h2 id="plan-search-title" className="text-lg font-medium">
        {copy.coverage.searchTitle}
      </h2>
      <TextField
        id="planSearch"
        type="search"
        autoComplete="off"
        label={copy.coverage.searchLabel}
        value={query}
        onChange={setQuery}
        error={showError ? copy.coverage.choosePlan : undefined}
      />
      <ul aria-labelledby="plan-search-title" className="flex flex-col gap-2">
        {results.slice(0, SHOWN_PLANS).map((plan) => (
          <li key={plan.id}>
            <Button variant="secondary" className="w-full justify-start" onClick={() => onPick(plan.id)}>
              {plan.name}
            </Button>
          </li>
        ))}
      </ul>
      <div aria-live="polite" className="flex flex-col items-start gap-2">
        {hidden > 0 && <p className="text-slate">{copy.coverage.searchMore.replace("{count}", String(hidden))}</p>}
        <Button variant="text" onClick={() => setStillNotListed(true)}>
          {copy.coverage.stillNotListed}
        </Button>
      </div>
    </section>
  );
}
