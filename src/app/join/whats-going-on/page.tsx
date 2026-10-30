import { TrackPageview } from "@/lib/analytics/track";
import { WhatsGoingOnForm } from "./WhatsGoingOnForm";

// Screen 2: "What's going on?"
export default function WhatsGoingOnPage() {
  return (
    <>
      <TrackPageview path="/portal/join/conditions" />
      <WhatsGoingOnForm />
    </>
  );
}
