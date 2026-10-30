"use client";

import { useSyncExternalStore } from "react";
import { ButtonLink } from "@/components/Button";
import { Photo } from "@/components/Photo";
import { DemoLine, Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { copy } from "@/copy";
import { findPlan } from "@/data";
import { FIT_STEPS } from "@/lib/fit/flow";
import { getAnswers, getServerAnswers, subscribeAnswers } from "@/lib/fit/stored-answers";
import { recommend } from "@/lib/provider/recommend";
import { visitDay, visitShortDate } from "@/lib/visit-time";

// Made-up numbers of Texas clinicians per plan, labelled as demo on screen
const DEMO_CLINICIANS: Record<string, number> = { aetna: 128, bcbs: 214, cigna: 96, unitedhealthcare: 173, oscar: 41 };

export function ProofMoment() {
  const answers = useSyncExternalStore(subscribeAnswers, getAnswers, getServerAnswers);
  const plan = answers?.planId ? findPlan(answers.planId) : undefined;
  const flow = { phase: "about_you" as const, part: 2, parts: 3, back: FIT_STEPS.insurance.path };

  if (!answers) {
    return (
      <Screen flow={flow}>
        <Skeleton rows={2} />
      </Screen>
    );
  }

  const earliest = plan ? recommend(["Not sure"], { payMethod: "insurance", planId: plan.id }) : null;
  const start = earliest?.found ? earliest.recommended.slots[0].start : null;

  return (
    <Screen
      flow={flow}
      footer={
        <div className="flex flex-col gap-2">
          <ButtonLink href={FIT_STEPS.health.path} className="w-full">
            {copy.common.continue}
          </ButtonLink>
          <DemoLine>{copy.coverage.proofDemo}</DemoLine>
        </div>
      }
    >
      <section aria-labelledby="proof-title" className="rise card overflow-hidden">
        {/* Her head starts about 11% down the photo: anchored near the top so
            it isn't cut off, with room on phones for her hands too */}
        <Photo
          photo="yourProvider"
          alt={copy.coverage.proofPhoto}
          className="h-44 md:h-40"
          crop="object-[50%_30%] md:object-[50%_17%]"
          priority
        />
        <div className="flex flex-col gap-3 px-4 pb-4 md:px-6 md:pb-6">
          <h1 id="proof-title" className="display text-[22px] leading-7 md:text-[28px] md:leading-9">
            {copy.coverage.proofTitle}
          </h1>
          <dl className="flex flex-col divide-y divide-line">
            {plan && (
              <Fact label={copy.coverage.proofClinicians.replace("{plan}", plan.name)} value={String(DEMO_CLINICIANS[plan.id] ?? 0)} />
            )}
            {start && (
              <Fact label={copy.coverage.proofEarliest.replace("{day}", visitDay(start))} value={visitShortDate(start).split(", ")[1]} />
            )}
            <Fact label={copy.coverage.proofCost} value={copy.coverage.proofCostValue} />
          </dl>
        </div>
      </section>
    </Screen>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-body text-navy">{label}</dt>
      <dd className="display text-card-question font-semibold whitespace-nowrap text-ink md:text-card-question-lg">{value}</dd>
    </div>
  );
}
