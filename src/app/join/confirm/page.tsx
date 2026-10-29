import { Progress } from "@/components/Progress";
import { copy } from "@/copy";
import { ConfirmForm } from "./ConfirmForm";

// Screen 3: "Here's what we understood". Layout only for now
export default function ConfirmPage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <Progress phase="whats_going_on" />
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl">{copy.confirm.title}</h1>
        <p>{copy.confirm.intro}</p>
      </div>
      <ConfirmForm />
    </div>
  );
}
