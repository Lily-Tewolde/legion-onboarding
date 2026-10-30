import { ButtonLink } from "@/components/Button";
import { copy } from "@/copy";

// The crisis screen when someone may be in danger right now, for example "I
// took a bunch of my pills an hour ago": 911 first, with 988 under it, and no
// "I'm safe" checkbox. To confirm with Legion's clinical team. Layout only for now
export default function ImmediateDangerPage() {
  return (
    <div className="flex flex-col gap-6 pt-6">
      <h1 className="text-3xl">{copy.crisis.immediate.title}</h1>
      <p>{copy.crisis.immediate.body}</p>
      <div className="flex flex-col items-start gap-1">
        <ButtonLink href="tel:911">{copy.crisis.immediate.call911}</ButtonLink>
        <ButtonLink href="tel:988" variant="text">
          {copy.crisis.immediate.callOrText988}
        </ButtonLink>
      </div>
    </div>
  );
}
