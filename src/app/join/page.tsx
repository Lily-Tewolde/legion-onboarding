import { Suspense } from "react";
import { FitStepForm, JoinIntro } from "./FitStepForm";
import { WelcomeBack } from "./WelcomeBack";

// Screen 1, step 1 of 3: the start content, then date of birth and Texas
export default function JoinPage() {
  return (
    <FitStepForm
      step="about"
      intro={
        <>
          <JoinIntro />
          {/* Reads the visitor's session, so it renders at request time */}
          <Suspense fallback={null}>
            <WelcomeBack />
          </Suspense>
        </>
      }
    />
  );
}
