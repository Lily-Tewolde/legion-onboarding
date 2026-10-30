import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Progress } from "@/components/Progress";
import { Skeleton } from "@/components/Skeleton";
import { copy } from "@/copy";
import { providerOption } from "@/lib/provider/present";
import { missingFor, recommendationFor } from "@/server/booking";
import { getSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";
import { NoTimes } from "./NoTimes";
import { ProviderPicker } from "./ProviderPicker";

// Screen 4: "Recommended for you". One recommended provider first, with the
// reason built from the made-up data. Layout only for now
export default function ProviderPage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <Progress phase="your_provider" />
      <h1 className="text-3xl">{copy.provider.title}</h1>
      <Suspense fallback={<Skeleton rows={4} />}>
        <Recommended />
      </Suspense>
    </div>
  );
}

async function Recommended() {
  const visitorId = await readVisitorId();
  const session = visitorId ? await getSession(visitorId).catch(() => null) : null;
  const missing = missingFor(session, "concerns");
  if (!session || missing) redirect(missing ?? "/join");

  const result = recommendationFor(session);
  if (!result.found) return <NoTimes />;

  const payMethod = session.pay_method ?? "self_pay";
  return (
    <ProviderPicker
      recommended={providerOption(result.recommended, payMethod)}
      others={result.others.map((other) => providerOption(other, payMethod))}
      rescheduling={Boolean(session.booked_at)}
    />
  );
}
