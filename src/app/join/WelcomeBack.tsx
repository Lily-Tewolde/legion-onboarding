import { ButtonLink } from "@/components/Button";
import { copy } from "@/copy";
import { RESUME_PATHS } from "@/lib/fit/flow";
import { getSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// "Welcome back" when this device already got past screen 1. Shows nothing
// for new visitors, or if the session can't be read
export async function WelcomeBack() {
  const visitorId = await readVisitorId();
  if (!visitorId) return null;

  const session = await getSession(visitorId).catch(() => null);
  const path = session ? RESUME_PATHS[session.current_screen] : undefined;
  if (!path) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line p-4">
      <p>{copy.join.welcomeBack}</p>
      <ButtonLink href={path} variant="secondary" className="self-start">
        {copy.common.continue}
      </ButtonLink>
    </div>
  );
}
