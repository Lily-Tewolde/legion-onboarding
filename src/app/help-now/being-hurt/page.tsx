import { Bold } from "@/components/Bold";
import { ShieldAlert } from "@/components/icons";
import { Notice, NoticeText } from "@/components/Notice";
import { copy } from "@/copy";
import { CrisisActions, OtherAction } from "../CrisisActions";
import { SafeToContinue } from "../SafeToContinue";
import { LeaveThisPage } from "./LeaveThisPage";

// The crisis screen when someone is being hurt by someone else (board U08):
// safety resources, with "Leave this page" always in reach at the top. "I'm
// safe right now" is pinned to the bottom on phones. To confirm with Legion's
// clinical team
export default function BeingHurtPage() {
  return (
    <Notice
      top={<LeaveThisPage />}
      icon={<ShieldAlert size={24} />}
      urgent
      title={copy.crisis.beingHurt.title}
      actions={
        <CrisisActions
          call={{ href: "tel:+18007997233", label: copy.crisis.beingHurt.callHotline }}
          others={
            <>
              <OtherAction href="sms:88788?&body=START">{copy.crisis.beingHurt.textHotline}</OtherAction>
              <OtherAction href="tel:911">{copy.crisis.call911}</OtherAction>
            </>
          }
        />
      }
      keepGoing={<SafeToContinue />}
      demo={copy.common.demoNumber}
    >
      <NoticeText>
        <Bold text={copy.crisis.immediateDanger} words={["911"]} />
      </NoticeText>
      <NoticeText>
        <Bold text={copy.crisis.beingHurt.hotline} words={["1-800-799-7233", "START", "88788"]} />
      </NoticeText>
      <NoticeText>
        <Bold text={copy.crisis.legion.replace("{number}", copy.crisis.legionNumber)} words={[copy.crisis.legionNumber]} />
      </NoticeText>
    </Notice>
  );
}
