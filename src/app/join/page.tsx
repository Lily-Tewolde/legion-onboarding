import { Suspense } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { copy } from "@/copy";
import { BOOKING_STEPS } from "@/lib/fit/flow";
import { FactsForm } from "./FactsForm";
import { WelcomeBack } from "./WelcomeBack";

// Screen 1: "Let's get you care". The start screen, the quick facts and
// coverage, on one screen. Layout only for now; the visual design comes later
export default function JoinPage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <ProgressBar step={1} total={BOOKING_STEPS} />
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl">{copy.join.title}</h1>
        <p>{copy.join.intro}</p>
        <p>{copy.join.video}</p>
        <p className="rounded-lg bg-wash px-4 py-3 text-navy">{copy.join.aiNotice}</p>
      </div>
      {/* Reads the visitor's session, so it renders at request time */}
      <Suspense fallback={null}>
        <WelcomeBack />
      </Suspense>
      <FactsForm />
    </div>
  );
}
