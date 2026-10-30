"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState, type FocusEvent, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Tag } from "@/components/Tag";
import { TextField } from "@/components/TextField";
import { copy } from "@/copy";
import { todayInCentral } from "@/lib/central-time";
import { daysToVisit } from "@/lib/analytics/events";
import { identify, track, trackPageview, useTrackInView } from "@/lib/analytics/track";
import { cardLooksValid, type Details, type DetailsErrors, validateDetails } from "@/lib/checkout/validate";

// "Your details" and "Payment" on the one-page checkout. The details are
// saved as soon as the section is complete and left (so progress is kept even
// if the card step isn't finished); an email that's already used offers the
// simulated sign-in. The card is checked in the browser only and never sent
// anywhere: payment is simulated

type SaveState = "idle" | "saving" | "saved" | "email_taken" | "failed";

const EMPTY_CARD = { number: "", expiry: "", securityCode: "", zip: "" };

export function CheckoutForm() {
  const router = useRouter();
  const [details, setDetails] = useState<Details>({ name: "", email: "", phone: "", consent: false });
  const [card, setCard] = useState(EMPTY_CARD);
  const [errors, setErrors] = useState<DetailsErrors & { card?: true }>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [booking, setBooking] = useState(false);
  const [failed, setFailed] = useState(false);
  const savedKey = useRef("");

  // Next keeps this page alive when people move on. Clear the card as it's
  // hidden, so it's never left sitting in the page
  useLayoutEffect(
    () => () => {
      setCard(EMPTY_CARD);
      setBooking(false);
      setFailed(false);
    },
    [],
  );

  const detailsSection = useRef<HTMLElement>(null);
  const paymentSection = useRef<HTMLElement>(null);
  useTrackInView(detailsSection, () => trackPageview("/portal/join/patient"));
  useTrackInView(paymentSection, () => trackPageview("/portal/join/payment"));

  const keyOf = (d: Details) => `${d.name}\n${d.email}\n${d.phone}`;

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
  const onDetailsBlur = (event: FocusEvent<HTMLElement>) => {
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
    } catch {
      setSaveState("failed");
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found: DetailsErrors & { card?: true } = validateDetails(details);
    if (!cardLooksValid(card, todayInCentral())) found.card = true;
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = (["name", "email", "phone", "consent", "card"] as const).find((key) => found[key]);
      document.getElementById(first === "card" ? "card-number" : first === "consent" ? "consent" : `details-${first}`)?.focus();
      return;
    }

    track("portal.payment.method_added", { simulated: true });
    setBooking(true);
    setFailed(false);
    if (!(await saveDetails())) {
      setBooking(false);
      return;
    }
    try {
      const response = await fetch("/api/join/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardSimulated: true }),
      });
      if (!response.ok) throw new Error(`book failed: ${response.status}`);
      const { path, slotStart } = await response.json();
      track("portal.appointment.confirmed", { days_to_visit: daysToVisit(slotStart) });
      router.push(path);
    } catch {
      setFailed(true);
      setBooking(false);
    }
  };

  const setCardField = (field: keyof typeof EMPTY_CARD, value: string) => {
    setCard((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, card: undefined }));
  };

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-8">
      <section ref={detailsSection} aria-labelledby="your-details" className="flex flex-col gap-4" onBlur={onDetailsBlur}>
        <h2 id="your-details" className="text-xl">
          {copy.checkout.yourDetails}
        </h2>
        <p>{copy.checkout.detailsIntro}</p>
        <TextField
          id="details-name"
          label={copy.checkout.name}
          value={details.name}
          onChange={(name) => update({ name })}
          error={errors.name ? copy.checkout.errors.name : undefined}
          autoComplete="name"
        />
        <TextField
          id="details-email"
          label={copy.checkout.email}
          type="email"
          value={details.email}
          onChange={(email) => update({ email })}
          error={errors.email ? copy.checkout.errors.email : undefined}
          autoComplete="email"
        />
        {saveState === "email_taken" && (
          <div role="alert" className="flex flex-col items-start gap-2 rounded-lg border border-line p-4">
            <p>{copy.checkout.emailTaken}</p>
            <Button variant="secondary" onClick={signIn}>
              {copy.checkout.signIn}
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setSaveState("idle");
                const field = document.getElementById("details-email") as HTMLInputElement | null;
                field?.focus();
                field?.select();
              }}
            >
              {copy.checkout.differentEmail}
            </Button>
            <Tag>{copy.checkout.signInLabel}</Tag>
          </div>
        )}
        <TextField
          id="details-phone"
          label={copy.checkout.phone}
          type="tel"
          value={details.phone}
          onChange={(phone) => update({ phone })}
          error={errors.phone ? copy.checkout.errors.phone : undefined}
          autoComplete="tel-national"
        />
        <p className="text-slate">{copy.checkout.notice}</p>
        <div id="consent" tabIndex={-1}>
          <Checkbox
            label={copy.checkout.consent}
            checked={details.consent}
            onChange={(consent) => update({ consent })}
            error={errors.consent ? copy.checkout.errors.consent : undefined}
          />
        </div>
      </section>

      <section ref={paymentSection} aria-labelledby="payment" className="flex flex-col gap-4">
        <h2 id="payment" className="text-xl">
          {copy.checkout.payment}
        </h2>
        <p>{copy.checkout.notCharged}</p>
        <TextField id="card-number" label={copy.checkout.cardNumber} value={card.number} onChange={(v) => setCardField("number", v)} inputMode="numeric" autoComplete="cc-number" />
        <TextField id="card-expiry" label={copy.checkout.expiry} value={card.expiry} onChange={(v) => setCardField("expiry", v)} inputMode="numeric" autoComplete="cc-exp" />
        <TextField id="card-code" label={copy.checkout.securityCode} value={card.securityCode} onChange={(v) => setCardField("securityCode", v)} inputMode="numeric" autoComplete="cc-csc" />
        <TextField id="card-zip" label={copy.checkout.zip} value={card.zip} onChange={(v) => setCardField("zip", v)} inputMode="numeric" autoComplete="postal-code" />
        {errors.card && <p className="text-error">{copy.checkout.errors.card}</p>}
        <div>
          <Tag>{copy.checkout.paymentLabel}</Tag>
        </div>
      </section>

      <div className="flex flex-col items-start gap-3">
        {(failed || saveState === "failed") && (
          <div role="alert" className="flex flex-col gap-1">
            <p className="text-error">{copy.common.somethingWentWrong}</p>
            <p>{copy.common.keepsHappening}</p>
          </div>
        )}
        <Button type="submit" disabled={booking}>
          {failed ? copy.common.tryAgain : copy.checkout.bookMyVisit}
        </Button>
      </div>
    </form>
  );
}
