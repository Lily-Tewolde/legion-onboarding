import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { VisitCard } from "@/components/VisitCard";
import { copy } from "@/copy";
import { visitShortDate, visitTime } from "@/lib/visit-time";
import { missingFor, providerName } from "@/server/booking";
import { getSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";
import { PaymentForm } from "./PaymentForm";

// The checkout's second step: payment, simulated
const FLOW = { phase: "book" as const, part: 2, parts: 2, back: "/join/book" };

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <Screen flow={FLOW}>
          <Skeleton rows={3} />
        </Screen>
      }
    >
      <Payment />
    </Suspense>
  );
}

async function Payment() {
  const visitorId = await readVisitorId();
  const session = visitorId ? await getSession(visitorId).catch(() => null) : null;
  const missing = missingFor(session, "provider");
  if (!session || missing || !session.slot_start || !session.provider_id) redirect(missing ?? "/join");
  if (session.booked_at) redirect("/join/booked");
  if (!session.person_id) redirect("/join/book");

  const provider = providerName(session.provider_id);
  const panel = { name: provider, slotStart: session.slot_start };
  return (
    <PaymentForm
      flow={{ ...FLOW, provider: panel }}
      whenShort={copy.visitCard.whenValue.replace("{date}", visitShortDate(session.slot_start)).replace("{time}", visitTime(session.slot_start))}
      summary={<VisitCard slotStart={session.slot_start} provider={provider} bare />}
    />
  );
}
