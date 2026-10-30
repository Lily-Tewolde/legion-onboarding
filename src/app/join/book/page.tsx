import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { VisitCard } from "@/components/VisitCard";
import { copy } from "@/copy";
import { missingFor, providerName } from "@/server/booking";
import { getSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";
import { DetailsForm } from "./DetailsForm";
import { WhatIfCancel } from "./WhatIfCancel";

// Screen 5, the checkout's first step: the visit and "Your details". The
// full cost and the cancellation line come before the card (decided). On
// desktop the cost is in the path panel, so it shows once per layout
const FLOW = { phase: "book" as const, part: 1, parts: 2, back: "/join/provider" };

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <Screen flow={FLOW} width="wide">
          <Skeleton rows={3} />
        </Screen>
      }
    >
      <Checkout />
    </Suspense>
  );
}

async function Checkout() {
  const visitorId = await readVisitorId();
  const session = visitorId ? await getSession(visitorId).catch(() => null) : null;
  const missing = missingFor(session, "provider");
  if (!session || missing || !session.slot_start || !session.provider_id) redirect(missing ?? "/join");
  if (session.booked_at) redirect("/join/booked");

  const insured = session.pay_method === "insurance";
  const provider = providerName(session.provider_id);
  return (
    <DetailsForm
      flow={{ ...FLOW, provider: { name: provider, slotStart: session.slot_start } }}
      visit={
        <section aria-labelledby="your-visit" className="flex flex-col gap-2 lg:card lg:p-5">
          <h1 id="your-visit" className="display text-page-title lg:text-question lg:tracking-normal">
            {copy.checkout.yourVisit}
          </h1>
          {/* Phones: two rows and the cost; desktop: three rows with icons, cost in the panel */}
          <div className="lg:hidden">
            <VisitCard slotStart={session.slot_start} provider={provider} rows={2}>
              <p className="text-body">{insured ? copy.checkout.insuredCost : copy.checkout.selfPayCost}</p>
              <p className="text-body">{insured ? copy.checkout.insuredCharged : copy.checkout.selfPayCharged}</p>
              <p className="text-body">{copy.checkout.freeToCancel}</p>
              <WhatIfCancel />
            </VisitCard>
          </div>
          <div className="hidden lg:block">
            <VisitCard slotStart={session.slot_start} provider={provider} icons bare>
              <p className="text-body">{copy.checkout.freeToCancel}</p>
              <WhatIfCancel />
            </VisitCard>
          </div>
        </section>
      }
    />
  );
}
