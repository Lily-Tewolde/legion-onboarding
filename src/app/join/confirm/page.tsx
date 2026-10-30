import { TrackPageview } from "@/lib/analytics/track";
import { ConfirmForm } from "./ConfirmForm";

// Screen 3: "Here's what we understood"
export default function ConfirmPage() {
  return (
    <>
      <TrackPageview path="/portal/join/needs" />
      <ConfirmForm />
    </>
  );
}
