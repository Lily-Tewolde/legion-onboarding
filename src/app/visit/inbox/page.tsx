import { Suspense } from "react";
import { DemoControls } from "@/components/DemoControls";
import { DemoLine } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { copy } from "@/copy";
import { providerName } from "@/server/booking";
import { bookedSessionOrRedirect, messageContext, portalInbox } from "@/server/portal";
import { Message } from "../Message";
import { PortalScreen } from "../PortalScreen";
import { TrackInvite } from "../PortalTracking";

// Screens 8 and 11: the in-app inbox, newest first (Claude Design's
// 10-Inbox). The check-in invite arrives 72 hours before the visit, the
// reminders 24 hours and 1 hour before. Nothing real is sent
export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <PortalScreen active="inbox" title={copy.inbox.title} inboxCount={0}>
          <Skeleton rows={2} />
        </PortalScreen>
      }
    >
      <Inbox />
    </Suspense>
  );
}

async function Inbox() {
  const session = await bookedSessionOrRedirect();
  const provider = providerName(session.provider_id);
  const [{ messages }, context] = await Promise.all([portalInbox(session), messageContext(session, provider)]);

  return (
    <PortalScreen
      active="inbox"
      title={copy.inbox.title}
      inboxCount={messages.length}
      demo={<DemoControls intakeDone={session.intake_done} />}
    >
      {messages.length === 0 ? (
        <p className="text-body text-slate">{copy.inbox.empty}</p>
      ) : (
        <>
          {messages.some((message) => message.kind === "invite") && <TrackInvite slotStart={session.slot_start} />}
          <ul className="flex flex-col gap-3">
            {messages.map((message) => (
              <li key={message.kind}>
                <Message kind={message.kind} context={context} inInbox />
              </li>
            ))}
          </ul>
          <DemoLine>{copy.inbox.label}</DemoLine>
        </>
      )}
    </PortalScreen>
  );
}
