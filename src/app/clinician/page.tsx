import { Suspense } from "react";
import { DemoControls } from "@/components/DemoControls";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { copy } from "@/copy";
import { visitShortDate, visitTime } from "@/lib/visit-time";
import { findPersonById } from "@/server/people";
import { getSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";
import { ClinicianView } from "./ClinicianView";

// Screen 10: the clinician view, a one-page summary like a clipboard. The
// check-in lives in the patient's browser, so this works on the same device;
// "Load a sample check-in" shows a labelled made-up one. The patient line (the
// made-up name and the visit time) comes from the server
export default function ClinicianPage() {
  return (
    <Suspense
      fallback={
        <Screen width="picker">
          <Skeleton rows={3} />
        </Screen>
      }
    >
      <Clinician />
    </Suspense>
  );
}

async function Clinician() {
  const visitorId = await readVisitorId();
  const session = visitorId ? await getSession(visitorId).catch(() => null) : null;
  const person = session?.person_id ? await findPersonById(session.person_id).catch(() => null) : null;
  const patient =
    person && session?.slot_start
      ? {
          name: person.full_name,
          when: copy.visitCard.whenValue.replace("{date}", visitShortDate(session.slot_start)).replace("{time}", visitTime(session.slot_start)),
        }
      : null;
  const booked = Boolean(session?.booked_at);
  return <ClinicianView patient={patient} demo={booked ? <DemoControls intakeDone={session?.intake_done ?? false} view="clinician" /> : undefined} />;
}
