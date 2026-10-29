import { Progress } from "@/components/Progress";
import { copy } from "@/copy";
import { FitStepForm } from "../FitStepForm";

// Screen 1, step 2 of 3: how they'll pay, the plan and coverage, on its own
// so nothing scrolls on a phone. Layout only for now
export default function InsurancePage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <Progress phase="about_you" />
      <h1 className="text-3xl">{copy.join.title}</h1>
      <FitStepForm step="insurance" />
    </div>
  );
}
