import { type ReactNode, Suspense } from "react";
import { AddToCalendar } from "@/components/AddToCalendar";
import { ButtonLink } from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import { Tag } from "@/components/Tag";
import { copy } from "@/copy";
import { visitLine } from "@/lib/provider/present";
import { VISIT_MINUTES, visitDay, visitTime } from "@/lib/visit-time";
import { providerName } from "@/server/booking";
import { bookedSessionOrRedirect, type BookedSession, messageContext, portalInbox } from "@/server/portal";
import { DemoSkip } from "./DemoSkip";
import { Message } from "./Message";
import { NpsDialog } from "./NpsDialog";
import { VisitActions } from "./VisitActions";

// Screen 7: "Your first visit", a simple patient portal page. The check-in
// opens any time after booking; the 72-hour invite is a nudge, not a lock.
// After a no-show, the reschedule prompt and the first-visit fee; after the
// visit, the rating. Layout only for now
export default function VisitPage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <h1 className="text-3xl">{copy.visit.title}</h1>
      <Suspense fallback={<Skeleton rows={5} />}>
        <Visit />
      </Suspense>
    </div>
  );
}

async function Visit() {
  const session = await bookedSessionOrRedirect();
  const provider = providerName(session.provider_id);
  const { messages, nextPoint } = await portalInbox(session);
  const upcoming = session.visit_outcome === null;
  const latestReminder = messages.find((message) => message.kind !== "invite");
  const context = await messageContext(session, provider);

  return (
    <div className="flex flex-col gap-8">
      <Milestones session={session} />

      <section className="flex flex-col gap-3 rounded-lg border border-line p-4">
        <p className="font-medium">{visitLine(session.slot_start, provider)}</p>
        {upcoming && nextPoint && <DemoSkip to={nextPoint} />}
      </section>

      {session.visit_outcome === "no_show" && (
        <section className="flex flex-col items-start gap-3">
          <p className="text-lg font-medium">{copy.visit.missed}</p>
          <ButtonLink href="/join/provider">{copy.visit.reschedule}</ButtonLink>
          <p>{copy.visit.missedFee}</p>
        </section>
      )}

      {session.visit_outcome === "completed" && (
        <section className="flex flex-col items-start gap-3">
          <p className="text-lg font-medium">{copy.visit.done}</p>
          <ButtonLink href="/visit/inbox">{copy.visit.goToInbox}</ButtonLink>
          <NpsDialog />
        </section>
      )}

      {upcoming && (
        <>
          <CalendarPreview slotStart={session.slot_start} provider={provider}>
            {latestReminder && <Message kind={latestReminder.kind} context={context} />}
          </CalendarPreview>
          <AddToCalendar slotStart={session.slot_start} provider={provider} />

          <section aria-labelledby="expect" className="flex flex-col gap-2">
            <h2 id="expect" className="text-xl">
              {copy.visit.expectTitle}
            </h2>
            <p>{copy.visit.expect}</p>
          </section>

          <VisitActions />

          {!session.intake_done && (
            <section aria-labelledby="check-in" className="flex flex-col items-start gap-3 rounded-lg border border-line p-4">
              <h2 id="check-in" className="text-xl">
                {copy.visit.checkInTitle}
              </h2>
              <p>{copy.visit.checkInBody}</p>
              <p>{copy.visit.checkInWhen}</p>
              <ButtonLink href="/visit/check-in">{copy.visit.startCheckIn}</ButtonLink>
            </section>
          )}
        </>
      )}

      <ButtonLink href="/demo" variant="text" className="self-start">
        {copy.visit.demoControls}
      </ButtonLink>
    </div>
  );
}

// Milestone cards with a small "Completed" tag (decided Oct 29)
function Milestones({ session }: { session: BookedSession }) {
  const milestones = [
    { label: copy.visit.milestoneBooked, done: true },
    { label: copy.visit.milestoneCheckIn, done: session.intake_done },
    { label: copy.visit.milestoneFirstVisit, done: session.visit_outcome === "completed" },
  ];
  return (
    <ul className="flex flex-col gap-2">
      {milestones.map((milestone) => (
        <li key={milestone.label} className="flex items-center justify-between gap-3 rounded-lg border border-line px-4 py-3">
          <span>{milestone.label}</span>
          {milestone.done && <Tag>{copy.visit.completedTag}</Tag>}
        </li>
      ))}
    </ul>
  );
}

// A small calendar page for the visit: the month and day, then the weekday
// and the hour it runs, in Central time
function CalendarPreview({
  slotStart,
  provider,
  children,
}: {
  slotStart: string;
  provider: string;
  children?: ReactNode;
}) {
  const end = new Date(new Date(slotStart).getTime() + VISIT_MINUTES * 60_000).toISOString();
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", ...options }).format(new Date(slotStart));

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line p-4">
      <div className="flex items-center gap-4">
        <div aria-hidden="true" className="flex w-16 flex-col items-center rounded-md border border-line py-1">
          <span className="text-sm font-medium text-action">{part({ month: "short" })}</span>
          <span className="text-2xl font-semibold">{part({ day: "numeric" })}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-medium">{copy.booked.calendarTitle.replace("{provider}", provider)}</span>
          <span className="text-slate">
            {visitDay(slotStart)}, {visitTime(slotStart)} – {visitTime(end)}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
