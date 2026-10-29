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
import { type FieldErrors, type FitAnswers, validateFacts, type YesNo } from "@/lib/fit/rules";
import { getAnswers, getServerAnswers, saveAnswers, subscribeAnswers } from "@/lib/fit/stored-answers";

// The quick facts on screen 1. Errors show on Continue, next to each question.
// "Yes" to the safety question goes straight to the crisis screen, and "Yes"
// to the hospital question straight to its screen-out; both are saved in the
// background so the next screen never waits on the network. Continue sends
// everything to the server, which runs the rules and saves the outcome

const NOT_LISTED = "not_listed";

const FIELD_ORDER = ["dateOfBirth", "inTexas", "payMethod", "planId", "safety", "hospital"] as const;

const ERROR_TEXT = {
  date_of_birth: copy.join.errors.dateOfBirth,
  pay_method: copy.join.errors.payMethod,
  required: copy.join.errors.required,
};

const planOptions = [
  ...plans.map((plan) => ({ value: plan.id, label: plan.name })),
  { value: NOT_LISTED, label: copy.join.planNotListed },
];

// The answers live in this browser tab's storage, so the form renders in the
// browser only, with a skeleton until then. Reading them from the store (not
// component state) means they're current when Next shows this page again
// after "Go back" or "I'm safe right now"
export function FactsForm() {
  const answers = useSyncExternalStore(subscribeAnswers, getAnswers, getServerAnswers);
  return answers ? <Form answers={answers} /> : <FormSkeleton />;
}

function FormSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-8">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex flex-col gap-3">
          <div className="h-6 w-2/3 rounded-md bg-wash motion-safe:animate-pulse" />
          <div className="h-control rounded-lg bg-wash motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function Form({ answers }: { answers: FitAnswers }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  // Next keeps this page alive when people move on. Clear what was in
  // progress as it's hidden, so it isn't still "submitting" when they come back
  useLayoutEffect(
    () => () => {
      setSubmitting(false);
      setFailed(false);
      setErrors({});
    },
    [],
  );

  // The crisis screen has to open straight away, so it's loaded in advance,
  // along with the hospital screen-out
  useEffect(() => {
    router.prefetch("/help-now");
    router.prefetch("/join/not-a-fit/hospital_stay");
  }, [router]);

  const update = (patch: FitAnswers) => {
    const next = { ...answers, ...patch };
    saveAnswers(next);
    setErrors((current) => {
      const rest = { ...current };
      for (const key of Object.keys(patch)) delete rest[key as keyof FieldErrors];
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

  const onSafety = (value: YesNo) => {
    const next = update({ safety: value, safeConfirmed: false });
    if (value === "yes") leaveEarly(next, "/help-now");
  };

  const onHospital = (value: YesNo) => {
    const next = update({ hospital: value });
    if (value === "yes") leaveEarly(next, "/join/not-a-fit/hospital_stay");
  };

  const leaveEarly = (next: FitAnswers, path: string) => {
    fetch("/api/join/fit", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "early", answers: next }),
    }).catch(() => {});
    router.push(path);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateFacts(answers, todayInCentral());
    if (Object.keys(found).length > 0) {
      setErrors(found);
      focusFirstError(found);
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

  const error = (field: keyof FieldErrors) => {
    const code = errors[field];
    return code ? ERROR_TEXT[code] : undefined;
  };

  const plan = answers.planId ? findPlan(answers.planId) : undefined;

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-8">
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
            onChange={(value) => update({ planId: value })}
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
          {answers.planId === NOT_LISTED && (
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

      <SegmentedControl
        legend={copy.join.safety}
        name="safety"
        hint={copy.join.safetyHint}
        options={[
          { value: "no", label: copy.join.no },
          { value: "yes", label: copy.join.yes },
        ]}
        value={answers.safety}
        onChange={(value) => onSafety(value as YesNo)}
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
        onChange={(value) => onHospital(value as YesNo)}
        error={error("hospital")}
      />

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
      </div>
    </form>
  );
}

// Moves focus to the first question with an error, so keyboard and screen
// reader users land on it
function focusFirstError(errors: FieldErrors) {
  const field = FIELD_ORDER.find((name) => errors[name]);
  if (!field) return;
  const target =
    document.getElementById(field) ?? document.querySelector<HTMLInputElement>(`input[name="${field}"]`);
  target?.focus();
}
