import { Suspense } from "react";
import { Card, PageTitle, Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { VisitCard } from "@/components/VisitCard";
import { copy } from "@/copy";
import { providerName } from "@/server/booking";
import { bookedSessionOrRedirect } from "@/server/portal";
import { DemoControls } from "./DemoControls";

// Screen 12 as a page: where "Join visit" lands, since there's no real video
// visit. The same controls as the demo panel on every portal screen
export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <Screen>
          <PageTitle>{copy.demo.title}</PageTitle>
          <Skeleton rows={2} />
        </Screen>
      }
    >
      <Demo />
    </Suspense>
  );
}

async function Demo() {
  const session = await bookedSessionOrRedirect();
  return (
    <Screen>
      <PageTitle>{copy.demo.title}</PageTitle>
      <Card className="gap-3">
        <VisitCard slotStart={session.slot_start} provider={providerName(session.provider_id)} bare />
        <p className="text-body text-slate">{copy.demo.note}</p>
        <DemoControls intakeDone={session.intake_done} />
      </Card>
    </Screen>
  );
}
