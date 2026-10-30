import { ClinicianView } from "./ClinicianView";

// Screen 10: the clinician view, a one-page summary like a clipboard. The
// check-in lives in the patient's browser, so this works on the same device;
// "Load a sample check-in" shows a labelled made-up one. Layout only for now
export default function ClinicianPage() {
  return (
    <div className="pt-6">
      <ClinicianView />
    </div>
  );
}
