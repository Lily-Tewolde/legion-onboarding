"use client";

import { useRouter } from "next/navigation";
import { type FocusEvent, type FormEvent, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Card, DemoLine, Screen } from "@/components/Screen";
import { FieldError } from "@/components/SegmentedControl";
import { TextField } from "@/components/TextField";
import { copy } from "@/copy";
import { identify, track, trackPageview, useTrackInView } from "@/lib/analytics/track";
import { type Details, type DetailsErrors, MAX_NAME, validateDetails } from "@/lib/checkout/validate";
import type { Flow } from "@/components/Screen";

// The checkout's first step, "Your details" (Claude Design's 07-Details). The
// details are saved as soon as the section is complete and left, so progress
// is kept even if the card step isn't finished; an email that's already used
// offers the simulated sign-in instead. Consent stays here (Lily, Oct 29),
// because the made-up person is saved with it at this step; the terms notice
// is on payment, right before "Book my visit"

type SaveState = "idle" | "saving" | "saved" | "email_taken" | "failed";

export const PAYMENT_PATH = "/join/book/payment";

export function DetailsForm({ flow, visit }: { flow: Flow; visit: React.ReactNode }) {
  const router = useRouter();
  const [details, setDetails] = useState<Details>({ name: "", email: "", phone: "", consent: false });
  const [errors, setErrors] = useState<DetailsErrors>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [busy, setBusy] = useState(false);
  const savedKey = useRef("");
  const section = useRef<HTMLDivElement>(null);
  useTrackInView(section, () => trackPageview("/portal/join/patient"));

  useLayoutEffect(() => () => setBusy(false), []);

  const keyOf = (d: Details) => `${d.name}\n${d.email}\n${d.phone}`;
  const valid = validateDetails(details);

  const saveDetails = async (): Promise<boolean> => {
    if (Object.keys(validateDetails(details)).length > 0) return false;
    if (savedKey.current === keyOf(details) && saveState === "saved") return true;
    setSaveState("saving");
    try {
      const response = await fetch("/api/join/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      if (!response.ok) throw new Error(`details failed: ${response.status}`);
      const { status, personId, created } = await response.json();
      if (status === "email_taken") {
        setSaveState("email_taken");
        return false;
      }
      identify(personId);
      if (created) track("portal.onboarding.userCreated");
      savedKey.current = keyOf(details);
      setSaveState("saved");
      return true;
    } catch {
      setSaveState("failed");
      return false;
    }
  };

  // Saved when focus leaves a complete details section
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    if (Object.keys(validateDetails(details)).length === 0) void saveDetails();
  };

  const update = (patch: Partial<Details>) => {
    setDetails((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const rest = { ...current };
      for (const key of Object.keys(patch)) delete rest[key as keyof Details];
      return rest;
    });
    if ("email" in patch && saveState === "email_taken") setSaveState("idle");
  };

  const signIn = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/join/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: details.email }),
      });
      if (!response.ok) throw new Error(`sign-in failed: ${response.status}`);
      identify((await response.json()).personId);
      savedKey.current = keyOf(details);
      setSaveState("saved");
      router.push(PAYMENT_PATH);
    } catch {
      setSaveState("failed");
      setBusy(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateDetails(details);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = (["name", "email", "phone", "consent"] as const).find((key) => found[key]);
      document.getElementById(first === "consent" ? "consent" : `details-${first}`)?.focus();
      return;
    }
    setBusy(true);
    if (await saveDetails()) {
      router.push(PAYMENT_PATH);
      return;
    }
    setBusy(false);
  };

  const emailTaken = saveState === "email_taken";

  return (
    <Screen
      flow={flow}
      width="wide"
      footer={
        <div className="flex flex-col items-stretch gap-1 lg:hidden">
          <Actions emailTaken={emailTaken} busy={busy} failed={saveState === "failed"} signIn={signIn} />
        </div>
      }
    >
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start lg:gap-6">
        <div className="contents lg:order-2 lg:block">{visit}</div>
        <div ref={section} onBlur={onBlur} className="lg:order-1">
          <Card className="gap-3 max-lg:border-0 max-lg:bg-transparent max-lg:p-0 max-lg:shadow-none">
            <div className="flex flex-col gap-1">
              <h2 id="your-details" className="display text-card-question md:text-card-question-lg">
                {copy.checkout.yourDetails}
              </h2>
              <p className="text-body text-slate">{copy.checkout.detailsIntro}</p>
            </div>
            <form id="details-form" noValidate onSubmit={onSubmit} aria-labelledby="your-details" className="flex flex-col gap-2">
              <TextField
                id="details-name"
                label={copy.checkout.name}
                value={details.name}
                onChange={(name) => update({ name })}
                maxLength={MAX_NAME}
                error={errors.name ? copy.checkout.errors.name : undefined}
                valid={!valid.name && details.name !== ""}
                autoComplete="name"
              />
              <TextField
                id="details-email"
                label={copy.checkout.email}
                type="email"
                value={details.email}
                onChange={(email) => update({ email })}
                error={errors.email ? copy.checkout.errors.email : emailTaken ? copy.checkout.emailTaken : undefined}
                valid={!valid.email && details.email !== ""}
                autoComplete="email"
              />
              <TextField
                id="details-phone"
                label={copy.checkout.phone}
                type="tel"
                value={details.phone}
                onChange={(phone) => update({ phone })}
                error={errors.phone ? copy.checkout.errors.phone : undefined}
                valid={!valid.phone && details.phone !== ""}
                autoComplete="tel-national"
              />
              <div id="consent" tabIndex={-1}>
                <Checkbox
                  label={copy.checkout.consent}
                  checked={details.consent}
                  onChange={(consent) => update({ consent })}
                  error={errors.consent ? copy.checkout.errors.consent : undefined}
                />
              </div>
              <div className="hidden flex-col gap-1 pt-2 lg:flex">
                <Actions emailTaken={emailTaken} busy={busy} failed={saveState === "failed"} signIn={signIn} />
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Screen>
  );
}

// Continue, or the email-already-used choices, with the simulated sign-in
function Actions({ emailTaken, busy, failed, signIn }: { emailTaken: boolean; busy: boolean; failed: boolean; signIn: () => void }) {
  if (emailTaken) {
    return (
      <>
        <Button onClick={signIn} disabled={busy} className="w-full">
          {copy.checkout.signIn}
        </Button>
        <Button
          variant="text"
          onClick={() => {
            const field = document.getElementById("details-email") as HTMLInputElement | null;
            field?.focus();
            field?.select();
          }}
        >
          {copy.checkout.differentEmail}
        </Button>
        <DemoLine>{copy.checkout.signInLabel}</DemoLine>
      </>
    );
  }
  return (
    <>
      {failed && (
        <div role="alert" className="flex flex-col gap-1">
          <FieldError>{copy.common.somethingWentWrong}</FieldError>
          <p className="text-body text-slate">{copy.common.keepsHappening}</p>
        </div>
      )}
      <Button type="submit" form="details-form" disabled={busy} className="w-full">
        {failed ? copy.common.tryAgain : copy.common.continue}
      </Button>
    </>
  );
}
