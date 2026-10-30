import { Suspense } from "react";
import { DemoControls } from "@/components/DemoControls";
import { Card, DemoLine } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { copy } from "@/copy";
import { findPersonById } from "@/server/people";
import { bookedSessionOrRedirect, portalInbox } from "@/server/portal";
import { PortalScreen } from "../PortalScreen";

// The Profile tab: only an entry point (decided). It shows the made-up details
// from the checkout; nothing can be changed here
export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <PortalScreen active="profile" title={copy.profile.title} inboxCount={0}>
          <Skeleton rows={3} />
        </PortalScreen>
      }
    >
      <Profile />
    </Suspense>
  );
}

async function Profile() {
  const session = await bookedSessionOrRedirect();
  const [person, { messages }] = await Promise.all([
    session.person_id ? findPersonById(session.person_id).catch(() => null) : null,
    portalInbox(session),
  ]);
  const rows = person
    ? [
        { label: copy.checkout.name, value: person.full_name },
        { label: copy.checkout.email, value: person.email },
        { label: copy.checkout.phone, value: person.phone },
      ]
    : [];

  return (
    <PortalScreen
      active="profile"
      title={copy.profile.title}
      inboxCount={messages.length}
      demo={<DemoControls intakeDone={session.intake_done} />}
    >
      <Card className="gap-0">
        <dl className="flex flex-col divide-y divide-line">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col py-3 first:pt-0 last:pb-0">
              <dt className="text-label font-semibold text-slate">{row.label}</dt>
              <dd className="text-body-lg font-semibold break-all text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <DemoLine>{copy.profile.notBuilt}</DemoLine>
    </PortalScreen>
  );
}
