import { ButtonLink } from "@/components/Button";
import { TalkToPersonButton } from "@/components/HelpPanel";
import { InlineLink } from "@/components/InlineLink";
import { Tag } from "@/components/Tag";
import { copy } from "@/copy";
import { FromFreeText } from "./FromFreeText";
import { SafeToContinue } from "./SafeToContinue";

// The crisis screen, from "Yes" to the safety question or a crisis in free
// text. "Call 988" is the one primary button, with "Text 988", "Call 911" and
// "Talk to a person" as text-style buttons under it; on phones they open the
// dialer or messages, and on desktop the numbers are in the labels. "I'm safe
// right now" sits on its own at the bottom. Immediate danger and being hurt by
// someone else have their own versions. Layout only for now
export default function HelpNowPage() {
  return (
    <div className="flex flex-col gap-6 pt-6">
      <h1 className="text-3xl">{copy.crisis.title}</h1>
      <FromFreeText />
      <p>{copy.crisis.immediateDanger}</p>
      <p>
        <InlineLink
          text={copy.crisis.lifeline}
          label={copy.crisis.lifelineLink}
          href="https://988lifeline.org"
          placeholder="{link}"
        />
      </p>
      <div className="flex flex-col gap-1">
        <p>
          <InlineLink text={copy.crisis.legion} label={copy.crisis.legionNumber} href="tel:+15550100123" />
        </p>
        <div>
          <Tag>{copy.common.demoNumber}</Tag>
        </div>
      </div>

      <div className="flex flex-col items-start gap-1">
        <ButtonLink href="tel:988">{copy.crisis.call988}</ButtonLink>
        <ButtonLink href="sms:988" variant="text">
          {copy.crisis.text988}
        </ButtonLink>
        <ButtonLink href="tel:911" variant="text">
          {copy.crisis.call911}
        </ButtonLink>
        <TalkToPersonButton label={copy.crisis.talkToPerson} />
      </div>

      <SafeToContinue />
    </div>
  );
}
