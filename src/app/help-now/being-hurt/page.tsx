import { ButtonLink } from "@/components/Button";
import { InlineLink } from "@/components/InlineLink";
import { Tag } from "@/components/Tag";
import { copy } from "@/copy";
import { SafeToContinue } from "../SafeToContinue";
import { LeaveThisPage } from "./LeaveThisPage";

// The crisis screen when someone is being hurt by someone else: safety
// resources, with "Leave this page" always visible at the top. "I'm safe right
// now" sits on its own at the bottom. To confirm with Legion's clinical team.
// Layout only for now
export default function BeingHurtPage() {
  return (
    <div className="flex flex-col gap-6">
      <LeaveThisPage />
      <h1 className="text-3xl">{copy.crisis.beingHurt.title}</h1>
      <p>{copy.crisis.immediateDanger}</p>
      <p>{copy.crisis.beingHurt.hotline}</p>
      <div className="flex flex-col gap-1">
        <p>
          <InlineLink text={copy.crisis.legion} label={copy.crisis.legionNumber} href="tel:+15550100123" />
        </p>
        <div>
          <Tag>{copy.common.demoNumber}</Tag>
        </div>
      </div>

      <div className="flex flex-col items-start gap-1">
        <ButtonLink href="tel:+18007997233">{copy.crisis.beingHurt.callHotline}</ButtonLink>
        <ButtonLink href="sms:88788?&body=START" variant="text">
          {copy.crisis.beingHurt.textHotline}
        </ButtonLink>
        <ButtonLink href="tel:911" variant="text">
          {copy.crisis.call911}
        </ButtonLink>
      </div>

      <SafeToContinue />
    </div>
  );
}
