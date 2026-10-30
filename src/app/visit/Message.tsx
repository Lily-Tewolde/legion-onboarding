import { InlineLink } from "@/components/InlineLink";
import { Tag } from "@/components/Tag";
import { copy } from "@/copy";
import type { InboxKind } from "@/lib/portal/inbox";
import { fill } from "@/lib/provider/present";
import { visitDay, visitTime } from "@/lib/visit-time";
import { JoinVisitLink, TrackReminderSeen } from "./PortalTracking";

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

  return (
    <article className="flex flex-col gap-2 rounded-lg border border-line p-4">
      {kind === "invite" && <h3 className="text-lg">{fill(copy.inbox.inviteSubject, values)}</h3>}
      {kind === "invite" && (
        <p>
          <InlineLink
            text={fill(copy.inbox.invite, values)}
            label={copy.visit.startCheckIn}
            href="/visit/check-in"
            placeholder="{link}"
          />
        </p>
      )}
      {inInbox && kind === "reminder_24h" && <TrackReminderSeen hoursBefore={24} />}
      {inInbox && kind === "reminder_1h" && <TrackReminderSeen hoursBefore={1} />}
      {kind === "reminder_24h" && (
        <p>
          <InlineLink
            text={fill(copy.inbox.reminder24h, values)}
            label={copy.visit.reschedule}
            href="/join/provider"
            placeholder="{link}"
          />
        </p>
      )}
      {kind === "reminder_1h" && (
        <>
          <p>{fill(copy.inbox.reminder1h, values).replace("{link}", "").trim()}</p>
          <JoinVisitLink />
        </>
      )}
      <div>
        <Tag>{copy.inbox.label}</Tag>
      </div>
    </article>
  );
}
