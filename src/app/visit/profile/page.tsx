import { Suspense } from "react";
import { Skeleton } from "@/components/Skeleton";
import { copy } from "@/copy";
import { findPersonById } from "@/server/people";
import { bookedSessionOrRedirect } from "@/server/portal";

// The Profile tab: a placeholder. It shows the made-up details from the
// checkout and nothing can be changed here yet
export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <h1 className="text-3xl">{copy.profile.title}</h1>
      <Suspense fallback={<Skeleton rows={3} />}>
        <Profile />
      </Suspense>
    </div>
  );
}

async function Profile() {
  const session = await bookedSessionOrRedirect();
  const person = session.person_id ? await findPersonById(session.person_id).catch(() => null) : null;
  const rows = person
    ? [
        { label: copy.checkout.name, value: person.full_name },
        { label: copy.checkout.email, value: person.email },
        { label: copy.checkout.phone, value: person.phone },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <dl className="flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col">
            <dt className="text-slate">{row.label}</dt>
            <dd className="font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-slate">{copy.profile.notBuilt}</p>
    </div>
  );
}
