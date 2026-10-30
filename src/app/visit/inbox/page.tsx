import { Suspense } from "react";
import { Skeleton } from "@/components/Skeleton";
import { copy } from "@/copy";
import { providerName } from "@/server/booking";
import { bookedSessionOrRedirect, messageContext, portalInbox } from "@/server/portal";
import { Message } from "../Message";
import { TrackInvite } from "../PortalTracking";

// Screens 8 and 11: the in-app inbox, newest first. The check-in invite
// arrives 72 hours before the visit, the reminders 24 hours and 1 hour before.
// Nothing real is sent. Layout only for now
export default function InboxPage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <h1 className="text-3xl">{copy.inbox.title}</h1>
      <Suspense fallback={<Skeleton rows={3} />}>
        <Inbox />
      </Suspense>
    </div>
  );
}

async function Inbox() {
  const session = await bookedSessionOrRedirect();
  const provider = providerName(session.provider_id);
  const [{ messages }, context] = await Promise.all([portalInbox(session), messageContext(session, provider)]);

  if (messages.length === 0) return <p>{copy.inbox.empty}</p>;
  return (
    <ul className="flex flex-col gap-4">
      {messages.some((message) => message.kind === "invite") && <TrackInvite slotStart={session.slot_start} />}
      {messages.map((message) => (
        <li key={message.kind}>
          <Message kind={message.kind} context={context} inInbox />
        </li>
      ))}
    </ul>
  );
}
