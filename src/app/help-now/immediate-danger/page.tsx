import { ButtonLink } from "@/components/Button";
import { Bold } from "@/components/Bold";
import { AlertTriangle } from "@/components/icons";
import { Notice, NoticeText } from "@/components/Notice";
import { copy } from "@/copy";

// The crisis screen when someone may be in danger right now (board U07), for
// example "I took a bunch of my pills an hour ago": 911 first, with 988 under
// it, and no "I'm safe" checkbox. To confirm with Legion's clinical team
export default function ImmediateDangerPage() {
  return (
    <Notice
      icon={<AlertTriangle size={24} />}
      urgent
      title={copy.crisis.immediate.title}
      actions={
        <>
          <ButtonLink href="tel:911" className="w-full">
            {copy.crisis.immediate.call911}
          </ButtonLink>
          <ButtonLink href="tel:988" variant="text" className="w-full">
            {copy.crisis.immediate.callOrText988}
          </ButtonLink>
        </>
      }
    >
      <NoticeText>
        <Bold text={copy.crisis.immediate.body} words={["911"]} />
      </NoticeText>
    </Notice>
  );
}
