import { Suspense } from "react";
import { AddToCalendar } from "@/components/AddToCalendar";
import { ButtonLink } from "@/components/Button";
import { cx } from "@/components/cx";
import { DemoControls } from "@/components/DemoControls";
import { Check } from "@/components/icons";
import { Card } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { Tag } from "@/components/Tag";
import { VisitCard } from "@/components/VisitCard";
import { copy } from "@/copy";
import { TrackEvent } from "@/lib/analytics/track";
import { visitDay, visitShortDate, visitTime } from "@/lib/visit-time";
import { providerName } from "@/server/booking";
import { bookedSessionOrRedirect, type BookedSession, lessThan48Hours, portalInbox } from "@/server/portal";
import { DemoSkip } from "./DemoSkip";
import { NpsDialog } from "./NpsDialog";
import { PortalScreen } from "./PortalScreen";
import { TrackInvite } from "./PortalTracking";
import { VisitActions, WhatToExpect } from "./VisitActions";

// Screen 7: "Your first visit", a simple patient portal page (Claude Design's
// 10-Visit, 15-After and U16-NoShow). The check-in opens any time after
// booking; the 72-hour invite is a nudge, not a lock
export default function VisitPage({ searchParams }: PageProps<"/visit">) {
  return (
    <Suspense fallback={<VisitSkeleton />}>
      <Visit searchParams={searchParams} />
    </Suspense>
  );
}

function VisitSkeleton() {
  return (
    <PortalScreen active="visit" title={copy.visit.title} inboxCount={0}>
      <Skeleton rows={3} />
    </PortalScreen>
  );
}

async function Visit({ searchParams }: { searchParams: PageProps<"/visit">["searchParams"] }) {
  const session = await bookedSessionOrRedirect();
  // Back here after rescheduling: "Your visit is now {day} at {time}."
  const rescheduled = (await searchParams).rescheduled !== undefined;
  const late = await lessThan48Hours(session.slot_start);
  const provider = providerName(session.provider_id);
  const { messages, nextPoint } = await portalInbox(session);
  const outcome = session.visit_outcome;

  return (
    <PortalScreen
      active="visit"
      title={copy.visit.title}
      inboxCount={messages.length}
      wide
      demo={<DemoControls intakeDone={session.intake_done} />}
    >
      <TrackEvent event="portal.visit_page.viewed" />
      {messages.some((message) => message.kind === "invite") && <TrackInvite slotStart={session.slot_start} />}
      {rescheduled && !outcome && (
        <p role="status" className="flex items-center gap-2 rounded-field bg-tint px-4 py-2.5 text-body font-semibold text-ink">
          <Check size={18} className="text-action" />
          {copy.visit.rescheduled.replace("{day}", visitDay(session.slot_start)).replace("{time}", visitTime(session.slot_start))}
        </p>
      )}
      {outcome && (
        <p role="status" className="flex items-center gap-2 rounded-field border-[1.5px] border-dashed border-line-control bg-tint px-4 py-2.5 text-body font-semibold text-ink">
          <Check size={18} className="text-action" />
          {outcome === "completed" ? copy.demo.markedCompleted : copy.demo.markedNoShow}
        </p>
      )}
      <Milestones session={session} />

      {outcome === "no_show" && (
        <Card className="gap-3">
          <h2 className="display text-card-question">{copy.visit.missed}</h2>
          <VisitCard slotStart={session.slot_start} provider={provider} bare />
          <p className="text-body text-slate">{copy.visit.missedFee}</p>
          <ButtonLink href="/join/provider" className="w-full md:w-auto md:self-start">
            {copy.visit.reschedule}
          </ButtonLink>
        </Card>
      )}

      {outcome === "completed" && (
        <Card className="gap-3">
          <VisitCard slotStart={session.slot_start} provider={provider} bare />
          <p className="text-body">{copy.visit.done}</p>
          <ButtonLink href="/visit/inbox" className="w-full md:w-auto md:self-start">
            {copy.visit.goToInbox}
          </ButtonLink>
          <NpsDialog />
        </Card>
      )}

      {!outcome && (
        <div className="flex flex-col gap-3 md:gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start">
          {/* On phones the card opens up (board 10-Visit-M): the visit tile, then
              Reschedule and Cancel, then "What to expect" beside the demo skip */}
          <Card className="gap-3 max-md:contents">
            <div className="flex items-center justify-between gap-2 max-md:hidden">
              <h2 className="text-question font-semibold">{copy.checkout.yourVisit}</h2>
              {nextPoint && <DemoSkip to={nextPoint} />}
            </div>
            <VisitCard slotStart={session.slot_start} provider={provider} className="md:hidden" />
            <VisitCard slotStart={session.slot_start} provider={provider} icons bare className="max-md:hidden" />
            <div className="max-md:hidden">
              <AddToCalendar slotStart={session.slot_start} provider={provider} compact />
            </div>
            <div className="max-md:order-2">
              <WhatToExpect aside={nextPoint && <DemoSkip to={nextPoint} className="md:hidden" />} />
            </div>
            <div className="max-md:order-1">
              <VisitActions late={late} />
            </div>
          </Card>
          {!session.intake_done && (
            <Card className="gap-2 max-md:order-3">
              <h2 className="text-question font-semibold">{copy.visit.checkInTitle}</h2>
              <p className="text-body">{copy.visit.checkInBody}</p>
              <p className="text-body text-slate max-md:hidden">{copy.visit.checkInWhen}</p>
              <ButtonLink href="/visit/check-in" className="mt-1 w-full">
                {copy.visit.startCheckIn}
              </ButtonLink>
            </Card>
          )}
        </div>
      )}
    </PortalScreen>
  );
}

// Milestone cards with a small tag (decided Oct 29): Completed, or what's next
function Milestones({ session }: { session: BookedSession }) {
  const noShow = session.visit_outcome === "no_show";
  const milestones = [
    { label: copy.visit.milestoneBooked, tag: copy.visit.completedTag, done: true },
    {
      label: copy.visit.milestoneCheckIn,
      tag: session.intake_done ? copy.visit.completedTag : session.visit_outcome ? copy.visit.skippedTag : copy.visit.optionalTag,
      done: session.intake_done,
      current: !session.intake_done && !session.visit_outcome,
    },
    {
      label: copy.visit.milestoneFirstVisit,
      tag: session.visit_outcome === "completed" ? copy.visit.completedTag : noShow ? copy.visit.missedTag : visitShortDate(session.slot_start),
      done: session.visit_outcome === "completed",
    },
  ];
  return (
    <ol aria-label={copy.visit.milestones} className="grid grid-cols-3 gap-2">
      {milestones.map((milestone) => (
        <li
          key={milestone.label}
          aria-current={milestone.current ? "step" : undefined}
          className={cx(
            "flex min-w-0 flex-col items-start gap-1 rounded-tile bg-white px-2 py-2.5 shadow-card md:p-3",
            milestone.current ? "border-2 border-action" : "border border-card-line",
          )}
        >
          <span className="text-label leading-tight font-semibold text-ink md:text-body">{milestone.label}</span>
          {milestone.done ? <Tag>{milestone.tag}</Tag> : <span className="text-label text-slate">{milestone.tag}</span>}
        </li>
      ))}
    </ol>
  );
}
