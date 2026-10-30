import { TalkToPersonButton } from "@/components/HelpPanel";
import { InlineLink } from "@/components/InlineLink";
import { copy } from "@/copy";
import { ThisIsForMe } from "./ThisIsForMe";

// When "What's going on?" sounds like it's for someone else ("My husband needs
// help with his anxiety"): they'll need to sign up themselves, with 988 if
// they're worried about the person's safety. Layout only for now
export default function SomeoneElsePage() {
  return (
    <div className="flex flex-col gap-6 pt-6">
      <h1 className="text-3xl">{copy.someoneElse.title}</h1>
      <p>{copy.someoneElse.body}</p>
      <p>
        <InlineLink text={copy.someoneElse.safety} label={copy.someoneElse.safetyNumber} href="tel:988" />
      </p>
      <div className="flex flex-col items-start gap-1">
        <ThisIsForMe />
        <TalkToPersonButton label={copy.someoneElse.talkToPerson} />
      </div>
    </div>
  );
}
