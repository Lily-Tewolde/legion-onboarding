import { InlineLink } from "@/components/InlineLink";
import { copy } from "@/copy";
import type { InboxKind } from "@/lib/portal/inbox";
import { fill } from "@/lib/provider/present";
import { visitDay, visitTime } from "@/lib/visit-time";
import { JoinVisitLink, ShowAll, TrackReminderSeen } from "./PortalTracking";

// One message in the in-app inbox: the check-in invite, or a reminder.
// Nothing real is sent; each one says it would also go to email and phone.
// "Join visit" opens the demo panel, since there's no real video visit
export type MessageContext = { slotStart: string; provider: string; firstName: string };

// In the inbox, a reminder counts as viewed once it's scrolled into view
export function Message({ kind, context, inInbox = false }: { kind: InboxKind; context: MessageContext; inInbox?: boolean }) {
  const values = {
    firstName: context.firstName,
    provider: context.provider,
    day: visitDay(context.slotStart),
    time: visitTime(context.slotStart),
  };

  const label = kind === "reminder_24h" ? copy.inbox.before24h : kind === "reminder_1h" ? copy.inbox.before1h : null;

  return (
    <article className="card flex gap-3 p-4 md:px-6">
      <span aria-hidden="true" className="mt-2 size-2 flex-none rounded-full bg-action" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {label && <p className="text-label font-semibold text-slate">{label}</p>}
        {kind === "invite" && <h2 className="text-body font-bold text-ink">{fill(copy.inbox.inviteSubject, values)}</h2>}
        {kind === "invite" && (
          <ShowAll>
            <InlineLink text={fill(copy.inbox.invite, values)} label={copy.visit.startCheckIn} href="/visit/check-in" placeholder="{link}" />
          </ShowAll>
        )}
        {inInbox && kind === "reminder_24h" && <TrackReminderSeen hoursBefore={24} />}
        {inInbox && kind === "reminder_1h" && <TrackReminderSeen hoursBefore={1} />}
        {kind === "reminder_24h" && (
          <p className="text-body">
            <InlineLink text={fill(copy.inbox.reminder24h, values)} label={copy.visit.reschedule} href="/join/provider" placeholder="{link}" />
          </p>
        )}
        {kind === "reminder_1h" && (
          <>
            <p className="text-body">{fill(copy.inbox.reminder1h, values).replace("{link}", "").trim()}</p>
            <JoinVisitLink />
          </>
        )}
      </div>
    </article>
  );
}
