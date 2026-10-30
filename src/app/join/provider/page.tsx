import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { copy } from "@/copy";
import { TrackPageview } from "@/lib/analytics/track";
import { providerOption } from "@/lib/provider/present";
import { missingFor, recommendationFor } from "@/server/booking";
import { providerSummary } from "@/server/provider-summary";
import { lessThan48Hours } from "@/server/portal";
import { getSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";
import { NoTimes } from "./NoTimes";
import { PROVIDER_FLOW } from "./flow";
import { ProviderHeading, ProviderPicker } from "./ProviderPicker";

// Screen 4: "Recommended for you". One recommended provider first, with the
// reason built from the made-up data
export default function ProviderPage() {
  return (
    <>
      <TrackPageview path="/portal/join/match" />
      <Suspense
        fallback={
          <Screen flow={PROVIDER_FLOW} width="wide">
            <ProviderHeading summary={copy.provider.summaryAny} />
            <Skeleton rows={3} />
          </Screen>
        }
      >
        <Recommended />
      </Suspense>
    </>
  );
}

async function Recommended() {
  const visitorId = await readVisitorId();
  const session = visitorId ? await getSession(visitorId).catch(() => null) : null;
  const missing = missingFor(session, "concerns");
  if (!session || missing) redirect(missing ?? "/join");

  const result = recommendationFor(session);
  const summary = providerSummary(session, result);
  if (!result.found) return <NoTimes summary={summary} />;

  const payMethod = session.pay_method ?? "self_pay";
  return (
    <ProviderPicker
      recommended={providerOption(result.recommended, payMethod)}
      summary={summary}
      hasOthers={result.others.length > 0}
      rescheduling={Boolean(session.booked_at)}
      late={session.booked_at && session.slot_start && !session.visit_outcome ? await lessThan48Hours(session.slot_start) : false}
    />
  );
}
