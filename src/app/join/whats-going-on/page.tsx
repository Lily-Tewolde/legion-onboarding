import { Progress } from "@/components/Progress";
import { copy } from "@/copy";
import { TrackPageview } from "@/lib/analytics/track";
import { WhatsGoingOnForm } from "./WhatsGoingOnForm";

// Screen 2: "What's going on?". Layout only for now; the visual design comes later
export default function WhatsGoingOnPage() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <TrackPageview path="/portal/join/conditions" />
      <Progress phase="whats_going_on" />
      <div className="flex flex-col gap-3">
        <h1 id="wgo-title" className="text-3xl">
          {copy.whatsGoingOn.title}
        </h1>
        <p id="wgo-intro">{copy.whatsGoingOn.intro}</p>
      </div>
      <WhatsGoingOnForm />
    </div>
  );
}
