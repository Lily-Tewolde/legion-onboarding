import { FitStepForm } from "../FitStepForm";

// Screen 1, step 2 of 3: insurance on its own, with the plan cards, coverage
// or the self-pay price, so nothing scrolls on a phone
export default function InsurancePage() {
  return <FitStepForm step="insurance" />;
}
