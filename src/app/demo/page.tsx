import { Suspense } from "react";
import { Skeleton } from "@/components/Skeleton";
import { copy } from "@/copy";
import { visitLine } from "@/lib/provider/present";
import { providerName } from "@/server/booking";
import { bookedSessionOrRedirect } from "@/server/portal";
import { DemoControls } from "./DemoControls";

// Screen 12: the demo panel, separate from the portal and the clinician view.
// It records how the visit went, so the funnel runs to a completed first visit
export default function DemoPage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <h1 className="text-3xl">{copy.demo.title}</h1>
      <Suspense fallback={<Skeleton rows={3} />}>
        <Demo />
      </Suspense>
    </div>
  );
}

async function Demo() {
  const session = await bookedSessionOrRedirect();
  return (
    <div className="flex flex-col gap-6">
      <p className="font-medium">{visitLine(session.slot_start, providerName(session.provider_id))}</p>
      <p>{copy.demo.note}</p>
      <DemoControls />
    </div>
  );
}
