"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/Button";
import { cx } from "@/components/cx";
import { CheckCircleFilled, Search, Sparkle, Video } from "@/components/icons";
import { InsurerLogo } from "@/components/InsurerLogo";
import { Card, DemoLine, PageTitle, Screen } from "@/components/Screen";
import { FieldError, SegmentedControl } from "@/components/SegmentedControl";
import { Skeleton } from "@/components/Skeleton";
import { TextField } from "@/components/TextField";
import { copy } from "@/copy";
import { findPlan, plans } from "@/data";
import { todayInCentral } from "@/lib/central-time";
import { FIT_STEPS, type FitStep, nextStep, stepOf } from "@/lib/fit/flow";
import {
  type FieldErrors,
  type FitAnswers,
  type FitField,
  parseDateOfBirth,
  partialOutcome,
  type TapField,
  tapOutcome,
  validateFacts,
  validateFields,
  type YesNo,
} from "@/lib/fit/rules";
import { TrackEvent, TrackPageview, trackPageview } from "@/lib/analytics/track";
import { getAnswers, getServerAnswers, saveAnswers, subscribeAnswers } from "@/lib/fit/stored-answers";
import { trackFitOutcome, useLeave } from "@/lib/fit/use-leave";

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

// Where each step's back arrow and Back link go
const BACK: Record<FitStep, string | undefined> = {
  about: undefined,
  insurance: FIT_STEPS.about.path,
  health: FIT_STEPS.insurance.path,
};

const PART: Record<FitStep, number> = { about: 1, insurance: 2, health: 3 };

// After a covered plan, the proof moment comes before the safety questions
export const PROOF_PATH = "/join/your-plan";

// Where each step can go next, loaded in advance so it opens straight away
const PREFETCH: Record<FitStep, string[]> = {
  about: [FIT_STEPS.insurance.path, "/join/not-a-fit/under_18", "/join/not-a-fit/not_in_texas"],
  insurance: [FIT_STEPS.health.path, PROOF_PATH, "/join/plan-search", "/join/not-a-fit/medicaid_medicare"],
  health: ["/help-now", "/join/not-a-fit/hospital_stay"],
};

// The answers live in this browser tab's storage, so the form renders in the
// browser only, with a skeleton until then. Reading them from the store (not
// component state) means they're current when Next shows a step again after
// "Go back" or "I'm safe right now"
export function FitStepForm({ step, intro }: { step: FitStep; intro?: ReactNode }) {
  const answers = useSyncExternalStore(subscribeAnswers, getAnswers, getServerAnswers);
  if (!answers) {
    return (
      <Screen flow={{ phase: "about_you", part: PART[step], parts: 3, back: BACK[step] }}>
        {intro}
        <Skeleton rows={1} />
      </Screen>
    );
  }
  return <StepForm step={step} answers={answers} intro={intro} />;
}

function StepForm({ step, answers, intro }: { step: FitStep; answers: FitAnswers; intro?: ReactNode }) {
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
    if (step === "about") trackPageview("/portal/join/fit");
    fetch("/api/session", { method: "POST" }).catch(() => {});
  };

  const leave = useLeave();

  // A one-tap answer, acted on by its own rule only. An arrow key only
  // records the answer; leaving needs a tap, Space, Enter or Continue
  const tap = (field: TapField, patch: FitAnswers, explicit = true) => {
    const next = update(patch);
    if (!explicit) return;
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
      else if (step === "insurance" && answers.payMethod === "insurance") router.push(PROOF_PATH);
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
      const { outcome, path } = await response.json();
      trackFitOutcome(outcome);
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

  const plan = answers.planId ? findPlan(answers.planId) : undefined;
  const covered = step === "insurance" && answers.payMethod === "insurance" && plan && !plan.screensOut;

  return (
    <Screen
      flow={{ phase: "about_you", part: PART[step], parts: 3, back: BACK[step] }}
      footer={
        <div className="flex flex-col gap-2">
          {failed && (
            <div role="alert" className="flex flex-col gap-1">
              <FieldError>{copy.common.somethingWentWrong}</FieldError>
              <p className="text-body text-slate">{copy.common.keepsHappening}</p>
            </div>
          )}
          <Button type="submit" form="fit-form" disabled={submitting} className="w-full">
            {failed ? copy.common.tryAgain : copy.common.continue}
          </Button>
          {covered && <DemoLine>{copy.coverage.simulated}</DemoLine>}
        </div>
      }
    >
      {intro}
      <form id="fit-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-3 md:gap-4">
        {step === "about" && <TrackPageview path="/portal/join" />}
        {step === "about" && <AboutQuestions answers={answers} update={update} tap={tap} error={error} />}
        {step === "insurance" && <InsuranceQuestions answers={answers} update={update} tap={tap} error={error} />}
        {step === "health" && <HealthQuestions answers={answers} tap={tap} error={error} />}
      </form>
    </Screen>
  );
}

type QuestionProps = {
  answers: FitAnswers;
  update: (patch: FitAnswers) => FitAnswers;
  tap: (field: TapField, patch: FitAnswers, explicit?: boolean) => void;
  error: (field: FitField) => string | undefined;
};

const YES_NO = [
  { value: "yes", label: copy.join.yes },
  { value: "no", label: copy.join.no },
];

// "04 / 12 / 1968" as they type, like the board
const formatDateOfBirth = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join(" / ");
};

function AboutQuestions({ answers, update, tap, error }: QuestionProps) {
  const dob = answers.dateOfBirth ?? "";
  const complete = parseDateOfBirth(dob) !== null && dob.replace(/\D/g, "").length === 8;
  const showTexas = complete || answers.inTexas !== undefined || Boolean(error("inTexas"));

  return (
    <>
      <Card>
        <TextField
          id="dateOfBirth"
          labelOutside
          label={copy.join.dateOfBirth}
          hint={copy.join.dateOfBirthHint}
          value={dob}
          onChange={(value) => update({ dateOfBirth: formatDateOfBirth(value) })}
          error={error("dateOfBirth")}
          valid={complete}
          inputMode="numeric"
          autoComplete="bday"
          className="md:max-w-80"
          inputClassName="text-[22px] tracking-[0.04em]"
        />
      </Card>
      {showTexas && (
        <Card className="rise gap-0">
          <SegmentedControl
            legend={copy.join.inTexas}
            name="inTexas"
            options={YES_NO}
            value={answers.inTexas}
            onChange={(value, { explicit }) => tap("inTexas", { inTexas: value as YesNo }, explicit)}
            error={error("inTexas")}
          />
        </Card>
      )}
    </>
  );
}

function HealthQuestions({ answers, tap, error }: Omit<QuestionProps, "update">) {
  const showHospital = answers.safety === "no" || answers.hospital !== undefined || Boolean(error("hospital"));
  return (
    <>
      <Card className="gap-0">
        <SegmentedControl
          legend={copy.join.safety}
          legendClassName="display text-card-question md:text-card-question-lg"
          name="safety"
          hint={copy.join.safetyHint}
          options={YES_NO}
          value={answers.safety}
          onChange={(value, { explicit }) => tap("safety", { safety: value as YesNo, safeConfirmed: false }, explicit)}
          error={error("safety")}
        />
      </Card>
      {showHospital && (
        <Card className="rise gap-0">
          <SegmentedControl
            legend={copy.join.hospital}
            name="hospital"
            hint={copy.join.hospitalHint}
            options={YES_NO}
            value={answers.hospital}
            onChange={(value, { explicit }) => tap("hospital", { hospital: value as YesNo }, explicit)}
            error={error("hospital")}
          />
        </Card>
      )}
    </>
  );
}

// The start content above screen 1's first questions
export function JoinIntro() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <PageTitle>{copy.join.title}</PageTitle>
        <p className="text-body md:text-body-lg">{copy.join.intro}</p>
        <p className="flex items-center gap-2 text-body md:text-body-lg">
          <Video size={18} className="flex-none text-brand" />
          {copy.join.video}
        </p>
      </div>
      <p className="flex items-start gap-2 text-body md:text-body-lg">
        <Sparkle size={18} className="mt-[3px] flex-none text-brand" />
        {copy.join.aiNotice}
      </p>
    </>
  );
}

function InsuranceQuestions({ answers, update, tap, error }: QuestionProps) {
  const plan = answers.planId ? findPlan(answers.planId) : undefined;
  const picked = plan && !plan.screensOut;

  return (
    <>
      <Card className="gap-0">
        <SegmentedControl
          legend={copy.join.payMethod}
          legendClassName="display text-card-question md:text-card-question-lg"
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
      </Card>

      {answers.payMethod === "insurance" && (
        <Card className="rise gap-3">
          <p id="plan-label" className="text-question font-semibold text-ink">
            {copy.join.plan}
          </p>
          {picked ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex min-h-field flex-1 items-center gap-3 rounded-field border-2 border-action bg-wash px-4 text-body-lg font-bold whitespace-nowrap text-ink">
                  <InsurerLogo planId={plan.id} />
                  {plan.name}
                </div>
                <Button variant="text" onClick={() => update({ planId: undefined })}>
                  {copy.coverage.change}
                </Button>
              </div>
              <div role="status" className="rise flex gap-3">
                <TrackEvent event="portal.coverage.shown" properties={{ pay_method: "insurance" }} />
                <CheckCircleFilled size={22} className="mt-px flex-none text-action" />
                <div className="flex flex-col gap-1">
                  <p className="text-body">
                    <strong className="font-bold text-ink">{coveredLead}</strong> {coveredRest}
                  </p>
                  <p className="text-body text-slate">{copy.coverage.fullCostLater}</p>
                </div>
              </div>
            </>
          ) : (
            // The real plans, with their logos, then Medicaid, Medicare and "I
            // don't see my plan" in their own short block under them (Lily,
            // Oct 30): they aren't plans we take, so they're kept apart, and
            // stay above the pinned Continue on short phones
            <div role="radiogroup" aria-labelledby="plan-label" aria-describedby={error("planId") ? "plan-error" : undefined} className="flex flex-col gap-3 short:gap-2">
              {/* Two columns from 768px, each as wide as its longest name, so
                  "Blue Cross Blue Shield" sits on one line (Lily, Oct 30) */}
              <div className="flex flex-col gap-1 md:grid md:grid-cols-[auto_auto] md:gap-2">
                {plans
                  .filter((option) => !option.screensOut)
                  .map((option) => (
                    <PlanOption key={option.id} checked={answers.planId === option.id} invalid={Boolean(error("planId"))} onClick={() => tap("planId", { planId: option.id })}>
                      <InsurerLogo planId={option.id} />
                      {option.name}
                    </PlanOption>
                  ))}
              </div>
              <div className="grid grid-cols-2 gap-1 border-t border-line pt-3 short:pt-2 md:gap-2">
                {plans
                  .filter((option) => option.screensOut)
                  .map((option) => (
                    <PlanOption key={option.id} checked={answers.planId === option.id} invalid={Boolean(error("planId"))} onClick={() => tap("planId", { planId: option.id })}>
                      {option.name}
                    </PlanOption>
                  ))}
                <Link
                  href="/join/plan-search"
                  className="focus-ring col-span-2 flex min-h-[46px] items-center gap-3 rounded-field border-[1.5px] border-line-control bg-white px-4 text-body-lg font-medium whitespace-nowrap text-navy hover:border-action short:min-h-control-sm"
                >
                  <span aria-hidden="true" className="flex size-[34px] flex-none items-center justify-center rounded-[9px] bg-wash text-action short:size-7">
                    <Search size={18} />
                  </span>
                  {copy.join.planNotListed}
                </Link>
              </div>
              {error("planId") && <FieldError id="plan-error">{error("planId")}</FieldError>}
            </div>
          )}
        </Card>
      )}

      {answers.payMethod === "self_pay" && (
        <Card className="rise gap-3">
          <TrackEvent event="portal.coverage.shown" properties={{ pay_method: "self_pay" }} />
          <p className="text-body">{copy.join.selfPayPrice}</p>
          <div className="border-t border-line pt-3">
            <SegmentedControl
              legend={copy.join.selfPayMedicaid}
              name="medicaidOrMedicare"
              options={YES_NO}
              value={answers.medicaidOrMedicare}
              onChange={(value, { explicit }) => tap("medicaidOrMedicare", { medicaidOrMedicare: value as YesNo }, explicit)}
              error={error("medicaidOrMedicare")}
            />
          </div>
        </Card>
      )}
    </>
  );
}

// "You're covered." in bold, then the rest of the sentence
const [coveredFirst, ...coveredParts] = copy.coverage.covered.split(". ");
const coveredLead = `${coveredFirst}.`;
const coveredRest = coveredParts.join(". ");

// Moves focus to the step's first question with an error, so keyboard and
// screen reader users land on it
function focusFirstError(fields: readonly FitField[], errors: FieldErrors) {
  const field = fields.find((name) => errors[name]);
  if (!field) return;
  const target =
    document.getElementById(field) ?? document.querySelector<HTMLInputElement>(`input[name="${field}"]`);
  target?.focus();
}

// One option in the plan list: a radio that acts on tap
function PlanOption({ checked, invalid, onClick, children }: { checked: boolean; invalid: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onClick}
      className={cx(
        "focus-ring flex min-h-[46px] w-full cursor-pointer items-center gap-3 rounded-field px-4 text-left text-body-lg whitespace-nowrap short:min-h-control-sm",
        "border-[1.5px] bg-white font-medium text-navy hover:border-action",
        invalid ? "border-error" : "border-line-control",
      )}
    >
      {children}
    </button>
  );
}
