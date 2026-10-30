import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Progress } from "@/components/Progress";
import { Skeleton } from "@/components/Skeleton";
import { Tag } from "@/components/Tag";
import { copy } from "@/copy";
import { visitLine } from "@/lib/provider/present";
import { missingFor, providerName } from "@/server/booking";
import { getSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";
import { CheckoutForm } from "./CheckoutForm";
import { WhatIfCancel } from "./WhatIfCancel";

// Screen 5: "Book your visit", one page like an online checkout. The full
// cost and the cancellation line come before the card. Layout only for now
export default function BookPage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <Progress phase="book" />
      <h1 className="text-3xl">{copy.checkout.title}</h1>
      <Suspense fallback={<Skeleton rows={5} />}>
        <Checkout />
      </Suspense>
    </div>
  );
}

async function Checkout() {
  const visitorId = await readVisitorId();
  const session = visitorId ? await getSession(visitorId).catch(() => null) : null;
  const missing = missingFor(session, "provider");
  if (!session || missing) redirect(missing ?? "/join");
  if (session.booked_at) redirect("/join/booked");

  const insured = session.pay_method === "insurance";
  return (
    <>
      <section aria-labelledby="your-visit" className="flex flex-col gap-2 rounded-lg border border-line p-4">
        <h2 id="your-visit" className="text-xl">
          {copy.checkout.yourVisit}
        </h2>
        <p className="font-medium">{visitLine(session.slot_start ?? "", providerName(session.provider_id ?? ""))}</p>
        <p>{insured ? copy.checkout.insuredCost : copy.checkout.selfPayCost}</p>
        <div>
          <Tag>{copy.common.fromLegion}</Tag>
        </div>
        <p>{insured ? copy.checkout.insuredCharged : copy.checkout.selfPayCharged}</p>
        {insured && (
          <div>
            <Tag>{copy.common.fromLegion}</Tag>
          </div>
        )}
        <p>{copy.checkout.freeToCancel}</p>
        <WhatIfCancel />
      </section>
      <CheckoutForm />
    </>
  );
}
