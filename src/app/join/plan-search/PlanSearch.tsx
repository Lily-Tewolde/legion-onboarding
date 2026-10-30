"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { Button } from "@/components/Button";
import { cx } from "@/components/cx";
import { TalkToPersonButton } from "@/components/HelpPanel";
import { Info, Search } from "@/components/icons";
import { PageTitle, Screen } from "@/components/Screen";
import { FieldError } from "@/components/SegmentedControl";
import { TextField } from "@/components/TextField";
import { copy } from "@/copy";
import { findPlan } from "@/data";
import { FIT_STEPS } from "@/lib/fit/flow";
import { searchPlanList } from "@/lib/fit/plan-search";
import { tapOutcome } from "@/lib/fit/rules";
import { getAnswers, saveAnswers } from "@/lib/fit/stored-answers";
import { useLeave } from "@/lib/fit/use-leave";
import { LogoPlaceholder, PROOF_PATH } from "../FitStepForm";

const SHOWN = 5;

export function PlanSearch() {
  const router = useRouter();
  const leave = useLeave();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  // Next keeps this screen alive; start fresh each time it's opened
  useLayoutEffect(
    () => () => {
      setQuery("");
      setPicked(null);
      setNotFound(false);
      setError(false);
    },
    [],
  );

  const results = searchPlanList(query);
  const missing = notFound || (query.trim() !== "" && results.length === 0);
  const hidden = results.length - SHOWN;

  const pick = (name: string, planId: string | null) => {
    setError(false);
    setPicked(name);
    if (!planId) {
      // An insurer Legion doesn't take
      setNotFound(true);
      return;
    }
    const next = { ...getAnswers(), payMethod: "insurance" as const, planId, medicaidOrMedicare: undefined };
    saveAnswers(next);
    // Medicaid or Medicare screens out on tap, like everywhere else
    const outcome = tapOutcome("planId", next);
    if (outcome) leave(outcome, next, "planId");
  };

  const onContinue = () => {
    const planId = getAnswers().planId;
    if (!picked || !planId || !findPlan(planId)) {
      setError(true);
      return;
    }
    router.push(PROOF_PATH);
  };

  // Self-pay still answers "Do you have Medicaid or Medicare?" on the insurance step
  const continueSelfPay = () => {
    saveAnswers({ ...getAnswers(), payMethod: "self_pay", planId: undefined });
    router.push(FIT_STEPS.insurance.path);
  };

  return (
    <Screen
      flow={{ phase: "about_you", part: 2, parts: 3, back: FIT_STEPS.insurance.path }}
      footer={
        missing ? (
          <div className="flex flex-col items-stretch gap-1">
            <Button onClick={continueSelfPay} className="w-full">
              {copy.coverage.continueSelfPay}
            </Button>
            <TalkToPersonButton label={copy.coverage.talkToPerson} />
          </div>
        ) : (
          <div className="flex flex-col items-stretch gap-1">
            <Button onClick={onContinue} className="w-full">
              {copy.common.continue}
            </Button>
            <Button variant="text" onClick={() => setNotFound(true)}>
              {copy.coverage.stillNotListed}
            </Button>
          </div>
        )
      }
    >
      <PageTitle>{copy.coverage.searchTitle}</PageTitle>
      {missing ? (
        <div role="status" className="rise card flex flex-col items-start gap-3 p-4 md:p-6">
          <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-wash text-action">
            <Info size={22} />
          </span>
          <p className="text-body-lg">{copy.coverage.notListed}</p>
          <Button
            variant="text"
            className="-ml-2"
            onClick={() => {
              setQuery("");
              setPicked(null);
              setNotFound(false);
            }}
          >
            {copy.coverage.searchAgain}
          </Button>
        </div>
      ) : (
        <>
          <TextField
            id="planSearch"
            type="search"
            autoComplete="off"
            label={copy.coverage.searchLabel}
            icon={<Search size={20} />}
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPicked(null);
              setError(false);
            }}
            aria-controls="plan-list"
          />
          <div id="plan-list" role="radiogroup" aria-label={copy.coverage.searchTitle} className="flex flex-col gap-1.5">
            {results.slice(0, SHOWN).map((item) => {
              const on = picked === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => pick(item.name, item.planId)}
                  className={cx(
                    "focus-ring flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-field py-1.5 pr-3.5 pl-2.5 text-left text-body-lg",
                    on
                      ? "border-2 border-action bg-wash font-bold text-ink"
                      : "border-[1.5px] border-line-control bg-white font-medium text-navy hover:border-action",
                  )}
                >
                  <LogoPlaceholder selected={on} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
          {hidden > 0 && <p className="text-body text-slate">{copy.coverage.searchMore.replace("{count}", String(hidden))}</p>}
          {error && (
            <div role="alert">
              <FieldError>{copy.coverage.choosePlan}</FieldError>
            </div>
          )}
        </>
      )}
    </Screen>
  );
}
