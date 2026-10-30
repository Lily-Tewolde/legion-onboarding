import { Suspense } from "react";
import { Skeleton } from "@/components/Skeleton";
import { copy } from "@/copy";
import { providerName } from "@/server/booking";
import { bookedSessionOrRedirect } from "@/server/portal";
import { CheckInFlow } from "./CheckInFlow";

// Screen 9: the pre-visit check-in. One question at a time, form-style, never
// chat bubbles; skipping never blocks the visit. Layout only for now
export default function CheckInPage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl">{copy.checkIn.title}</h1>
        <p>{copy.checkIn.intro}</p>
      </div>
      <Suspense fallback={<Skeleton rows={3} />}>
        <CheckIn />
      </Suspense>
    </div>
  );
}

async function CheckIn() {
  const session = await bookedSessionOrRedirect();
  return <CheckInFlow provider={providerName(session.provider_id)} />;
}
