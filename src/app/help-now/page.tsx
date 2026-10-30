import { TalkToPersonButton } from "@/components/HelpPanel";
import { Bold } from "@/components/Bold";
import { Phone } from "@/components/icons";
import { InlineLink } from "@/components/InlineLink";
import { Notice, NoticeText } from "@/components/Notice";
import { copy } from "@/copy";
import { CrisisActions, OtherAction } from "./CrisisActions";
import { FromFreeText } from "./FromFreeText";
import { SafeToContinue } from "./SafeToContinue";

// The crisis screen (board U06), from "Yes" to the safety question or a crisis
// in free text. "Call 988" is the one primary button, with "Text 988", "Call
// 911" and "Talk to a person" as text-style buttons under it; on phones they
// open the dialer or messages. "I'm safe right now" is pinned to the bottom on
// phones and sits in its own card on desktop. Immediate danger and being hurt
// by someone else have their own versions
export default function HelpNowPage() {
  const [beforeLink, afterLink] = copy.crisis.lifeline.split("{link}");
  return (
    <Notice
      icon={<Phone size={24} />}
      urgent
      title={copy.crisis.title}
      actions={
        <CrisisActions
          call={{ href: "tel:988", label: copy.crisis.call988 }}
          others={
            <>
              <OtherAction href="sms:988">{copy.crisis.text988}</OtherAction>
              <OtherAction href="tel:911">{copy.crisis.call911}</OtherAction>
              <TalkToPersonButton label={copy.crisis.talkToPerson} className="w-full max-md:col-span-2 md:w-auto" />
            </>
          }
        />
      }
      keepGoing={<SafeToContinue />}
      demo={copy.common.demoNumber}
    >
      <FromFreeText />
      <NoticeText>
        <Bold text={copy.crisis.immediateDanger} words={["911"]} />
      </NoticeText>
      <NoticeText>
        <Bold text={beforeLink} words={["988"]} />
        <InlineLink text="{number}" label={copy.crisis.lifelineLink} href="https://988lifeline.org" />
        {afterLink}
      </NoticeText>
      <NoticeText>
        <Bold text={copy.crisis.legion.replace("{number}", copy.crisis.legionNumber)} words={[copy.crisis.legionNumber]} />
      </NoticeText>
    </Notice>
  );
}
