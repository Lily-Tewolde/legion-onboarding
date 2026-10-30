import { TalkToPersonButton } from "@/components/HelpPanel";
import { Users } from "@/components/icons";
import { InlineLink } from "@/components/InlineLink";
import { NoticeText } from "@/components/Notice";
import { Screen } from "@/components/Screen";
import { copy } from "@/copy";
import { ThisIsForMe } from "./ThisIsForMe";

// When "What's going on?" sounds like it's for someone else ("My husband needs
// help with his anxiety", board U09): they'll need to sign up themselves, with
// 988 if they're worried about the person's safety. Still part of "What's
// going on", so the progress and the path panel stay
const FLOW = { phase: "whats_going_on" as const, part: 1, parts: 2, back: "/join/whats-going-on" };

export default function SomeoneElsePage() {
  return (
    <Screen
      flow={FLOW}
      footer={
        <div className="flex flex-col gap-1">
          <ThisIsForMe />
          <TalkToPersonButton label={copy.someoneElse.talkToPerson} className="w-full" />
        </div>
      }
    >
      <section className="flex flex-col gap-3 md:mt-2 md:rounded-card md:border md:border-card-line md:bg-white md:p-6 md:shadow-notice">
        <span aria-hidden="true" className="flex size-12 flex-none items-center justify-center rounded-full bg-wash text-action md:size-14">
          <Users size={24} />
        </span>
        <h1 className="display text-page-title text-ink md:text-notice-title">{copy.someoneElse.title}</h1>
        <NoticeText>{copy.someoneElse.body}</NoticeText>
        <NoticeText>
          <InlineLink text={copy.someoneElse.safety} label={copy.someoneElse.safetyNumber} href="tel:988" />
        </NoticeText>
      </section>
    </Screen>
  );
}
