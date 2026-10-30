import type { ReactNode } from "react";
import { PageTitle, Screen } from "@/components/Screen";
import { copy } from "@/copy";
import { CheckInStepper } from "./CheckInStepper";

// The check-in's layout (Claude Design's 11-Checkin): its one stepper, the
// "Check-in" label above the title, then the step, with Next pinned at the
// bottom on phones. No portal tabs while it's open
export function CheckInScreen({ answered, footer, children }: { answered: number; footer?: ReactNode; children: ReactNode }) {
  return (
    <Screen footer={footer}>
      <CheckInStepper answered={answered} />
      <p className="-mb-2 text-label font-semibold text-slate">{copy.checkIn.label}</p>
      <div className="flex flex-col gap-1">
        <PageTitle>{copy.checkIn.title}</PageTitle>
        <p className="text-body text-slate">{copy.checkIn.intro}</p>
      </div>
      {children}
    </Screen>
  );
}
