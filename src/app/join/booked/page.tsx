import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ButtonLink } from "@/components/Button";
import { AddToCalendar } from "@/components/AddToCalendar";
import { CheckCircleFilled } from "@/components/icons";
import { Photo } from "@/components/Photo";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { VisitCard } from "@/components/VisitCard";
import { copy } from "@/copy";
import { missingFor, providerName } from "@/server/booking";
import { getSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// Screen 6: "You're booked". A compact confirmation card, "Add to calendar"
// that actually works, and the next step. The path panel slides away
export default function BookedPage() {
  return (
    <Suspense
      fallback={
        <Screen>
          <Skeleton rows={3} />
        </Screen>
      }
    >
      <Booked />
    </Suspense>
  );
}

async function Booked() {
  const visitorId = await readVisitorId();
  const session = visitorId ? await getSession(visitorId).catch(() => null) : null;
  const missing = missingFor(session, "booked");
  if (!session || missing || !session.slot_start || !session.provider_id) redirect(missing ?? "/join");

  const provider = providerName(session.provider_id);
  return (
    <Screen
      departingFlow={{ phase: "book", part: 2, parts: 2, booked: true, provider: { name: provider, slotStart: session.slot_start } }}
      footer={
        <ButtonLink href="/visit" className="w-full">
          {copy.booked.goToVisit}
        </ButtonLink>
      }
    >
      <section aria-labelledby="booked-title" className="rise card overflow-hidden">
        <Photo photo="book" alt={copy.booked.photo} className="h-28 md:h-36" priority />
        <div className="flex flex-col gap-3 px-4 pb-4 md:px-6 md:pb-6">
          <div className="flex items-center gap-2">
            <CheckCircleFilled size={28} className="flex-none text-action" />
            <h1 id="booked-title" className="display text-page-title md:text-page-title-lg">
              {copy.booked.title}
            </h1>
          </div>
          <VisitCard slotStart={session.slot_start} provider={provider} />
          <p className="text-body">{copy.booked.reminder}</p>
          <div className="hidden md:block">
            <AddToCalendar slotStart={session.slot_start} provider={provider} id="add-to-calendar-wide" />
          </div>
        </div>
      </section>
      <div className="md:hidden">
        <AddToCalendar slotStart={session.slot_start} provider={provider} />
      </div>
    </Screen>
  );
}
