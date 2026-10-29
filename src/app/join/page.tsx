import { Suspense } from "react";
import { Progress } from "@/components/Progress";
import { copy } from "@/copy";
import { FitStepForm } from "./FitStepForm";
import { WelcomeBack } from "./WelcomeBack";

// Screen 1, step 1 of 3: the start content, then date of birth and Texas.
// Layout only for now; the visual design comes later
export default function JoinPage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <Progress phase="about_you" />
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
      <FitStepForm step="about" />
    </div>
  );
}
