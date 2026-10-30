import { Suspense } from "react";
import { Skeleton } from "@/components/Skeleton";
import { providerName } from "@/server/booking";
import { bookedSessionOrRedirect } from "@/server/portal";
import { CheckInFlow } from "./CheckInFlow";
import { CheckInScreen } from "./CheckInScreen";

// Screen 9: the pre-visit check-in. One question at a time, form-style, never
// chat bubbles; skipping never blocks the visit
export default function CheckInPage() {
  return (
    <Suspense
      fallback={
        <CheckInScreen answered={0}>
          <Skeleton rows={1} />
        </CheckInScreen>
      }
    >
      <CheckIn />
    </Suspense>
  );
}

async function CheckIn() {
  const session = await bookedSessionOrRedirect();
  return <CheckInFlow provider={providerName(session.provider_id)} />;
}
