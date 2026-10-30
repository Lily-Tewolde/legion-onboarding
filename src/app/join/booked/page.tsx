import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AddToCalendar } from "@/components/AddToCalendar";
import { ButtonLink } from "@/components/Button";
import { Progress } from "@/components/Progress";
import { Skeleton } from "@/components/Skeleton";
import { copy } from "@/copy";
import { visitLine } from "@/lib/provider/present";
import { missingFor, providerName } from "@/server/booking";
import { getSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// Screen 6: "You're booked". A compact confirmation card, "Add to calendar"
// that actually works, and the next step. Layout only for now
export default function BookedPage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <Progress phase="book" />
      <h1 className="text-3xl">{copy.booked.title}</h1>
      <Suspense fallback={<Skeleton rows={3} />}>
        <Booked />
      </Suspense>
    </div>
  );
}

async function Booked() {
  const visitorId = await readVisitorId();
  const session = visitorId ? await getSession(visitorId).catch(() => null) : null;
  const missing = missingFor(session, "booked");
  if (!session || missing || !session.slot_start || !session.provider_id) redirect(missing ?? "/join");

  const provider = providerName(session.provider_id);
  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-lg border border-line p-4 font-medium">{visitLine(session.slot_start, provider)}</p>
      <p>{copy.booked.reminder}</p>
      <AddToCalendar slotStart={session.slot_start} provider={provider} />
      <ButtonLink href="/visit" className="self-start">
        {copy.booked.goToVisit}
      </ButtonLink>
    </div>
  );
}
