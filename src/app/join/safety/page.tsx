import { Progress } from "@/components/Progress";
import { copy } from "@/copy";
import { FitStepForm } from "../FitStepForm";

// Screen 1, step 3 of 3: the safety and hospital questions. Layout only for now
export default function SafetyPage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <Progress phase="about_you" />
      <h1 className="text-3xl">{copy.join.title}</h1>
      <FitStepForm step="health" />
    </div>
  );
}
