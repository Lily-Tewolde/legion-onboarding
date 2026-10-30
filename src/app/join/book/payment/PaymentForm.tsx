"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { cx } from "@/components/cx";
import { Calendar, ChevronDown, Lock } from "@/components/icons";
import { Card, DemoLine, type Flow, Screen } from "@/components/Screen";
import { FieldError } from "@/components/SegmentedControl";
import { TextField } from "@/components/TextField";
import { copy } from "@/copy";
import { daysToVisit } from "@/lib/analytics/events";
import { track, trackPageview, useTrackInView } from "@/lib/analytics/track";
import { todayInCentral } from "@/lib/central-time";
import { cardLooksValid } from "@/lib/checkout/validate";

// The checkout's second step, "Payment" (Claude Design's 08-Payment). The
// visit summary sits collapsed above it and opens inside the same card. The
// card is checked in the browser only and never sent anywhere: payment is
// simulated. It's cleared as soon as the screen is hidden

const EMPTY_CARD = { number: "", expiry: "", securityCode: "", zip: "" };

export function PaymentForm({ flow, whenShort, summary }: { flow: Flow; whenShort: string; summary: ReactNode }) {
  const router = useRouter();
  const [card, setCard] = useState(EMPTY_CARD);
  const [cardError, setCardError] = useState(false);
  const [open, setOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [failed, setFailed] = useState(false);
  const section = useRef<HTMLElement>(null);
  useTrackInView(section, () => trackPageview("/portal/join/payment"));

  useLayoutEffect(
    () => () => {
      setCard(EMPTY_CARD);
      setCardError(false);
      setBooking(false);
      setFailed(false);
    },
    [],
  );

  const set = (field: keyof typeof EMPTY_CARD, value: string) => {
    setCard((current) => ({ ...current, [field]: value }));
    setCardError(false);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!cardLooksValid(card, todayInCentral())) {
      setCardError(true);
      document.getElementById("card-number")?.focus();
      return;
    }
    track("portal.payment.method_added", { simulated: true });
    setBooking(true);
    setFailed(false);
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

  return (
    <Screen
      flow={flow}
      footer={
        <div className="flex flex-col items-stretch gap-2">
          {failed && (
            <div role="alert" className="flex flex-col gap-1">
              <FieldError>{copy.common.somethingWentWrong}</FieldError>
              <p className="text-body text-slate">{copy.common.keepsHappening}</p>
            </div>
          )}
          <Button type="submit" form="payment-form" disabled={booking} className="w-full">
            {failed ? copy.common.tryAgain : copy.checkout.bookMyVisit}
          </Button>
          <DemoLine>{copy.checkout.paymentLabel}</DemoLine>
        </div>
      }
    >
      <section aria-label={copy.checkout.yourVisit} className="card overflow-hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="visit-summary"
          onClick={() => setOpen(!open)}
          className="focus-ring flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left md:px-6"
        >
          <Calendar size={20} className="flex-none text-brand" />
          <span className="flex flex-1 flex-col">
            <span className="text-label font-semibold text-slate">{copy.checkout.yourVisit}</span>
            <span className="text-body font-semibold text-ink">{whenShort}</span>
          </span>
          <ChevronDown size={22} className={cx("flex-none text-action transition-transform duration-300", open && "rotate-180")} />
        </button>
        {open && (
          <div id="visit-summary" className="expand">
            <div className="px-4 pb-4 md:px-6">{summary}</div>
          </div>
        )}
      </section>

      {/* On phones the fields sit on the page, with the lock line beside the
          heading (board 08-Payment-M); a card from 768px up */}
      <Card className="gap-3 max-md:border-0 max-md:bg-transparent max-md:p-0 max-md:shadow-none">
        <section ref={section} aria-labelledby="payment-title" className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 max-md:flex-row max-md:flex-wrap max-md:items-center max-md:justify-between max-md:gap-x-3">
            <h1 id="payment-title" className="display text-page-title md:text-card-question-lg">
              {copy.checkout.payment}
            </h1>
            <p className="flex items-center gap-2 text-body text-slate max-md:font-semibold max-md:text-ink">
              <Lock size={16} className="flex-none text-brand" />
              {copy.checkout.notCharged}
            </p>
          </div>
          <form id="payment-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-2">
            <TextField
              id="card-number"
              label={copy.checkout.cardNumber}
              value={card.number}
              onChange={(v) => set("number", v)}
              inputMode="numeric"
              autoComplete="cc-number"
              error={cardError ? copy.checkout.errors.card : undefined}
            />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              <TextField id="card-expiry" label={copy.checkout.expiry} value={card.expiry} onChange={(v) => set("expiry", v)} inputMode="numeric" autoComplete="cc-exp" inputClassName="pr-2" />
              <TextField id="card-code" label={copy.checkout.securityCode} value={card.securityCode} onChange={(v) => set("securityCode", v)} inputMode="numeric" autoComplete="cc-csc" inputClassName="pr-2" />
              <TextField id="card-zip" label={copy.checkout.zip} value={card.zip} onChange={(v) => set("zip", v)} inputMode="numeric" autoComplete="postal-code" inputClassName="pr-2" />
            </div>
          </form>
        </section>
      </Card>
    </Screen>
  );
}
