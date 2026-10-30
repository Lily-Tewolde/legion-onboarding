import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { copy } from "@/copy";
import { providerOption } from "@/lib/provider/present";
import { missingFor, recommendationFor } from "@/server/booking";
import { providerSummary } from "@/server/provider-summary";
import { getSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";
import { PROVIDER_FLOW } from "../provider/ProviderPicker";
import { MorePicker } from "./MorePicker";

// "See more providers", as its own screen (decided Oct 29): provider cards
// with a reason line and the next time, the recommended one pinned at the
// top, three at a time
export default function MoreProvidersPage() {
  return (
    <Suspense
      fallback={
        <Screen flow={{ ...PROVIDER_FLOW, back: "/join/provider" }} width="wide">
          <Skeleton rows={3} />
        </Screen>
      }
    >
      <More />
    </Suspense>
  );
}

async function More() {
  const visitorId = await readVisitorId();
  const session = visitorId ? await getSession(visitorId).catch(() => null) : null;
  const missing = missingFor(session, "concerns");
  if (!session || missing) redirect(missing ?? "/join");

  const result = recommendationFor(session);
  if (!result.found) redirect("/join/provider");
  const payMethod = session.pay_method ?? "self_pay";
  return (
    <MorePicker
      title={copy.provider.moreTitle}
      summary={providerSummary(session, result)}
      providers={[result.recommended, ...result.others].map((candidate) => providerOption(candidate, payMethod))}
    />
  );
}
