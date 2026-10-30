"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Card, DemoLine, PageTitle, Screen } from "@/components/Screen";
import { FieldError } from "@/components/SegmentedControl";
import { Info } from "@/components/icons";
import { copy } from "@/copy";
import { track } from "@/lib/analytics/track";
import { bookLabel, type ProviderOption } from "@/lib/provider/present";
import { Availability, ProviderPhoto } from "./Availability";
import { useBook } from "./useBook";

// Screen 4: the recommended provider with the reason, built from the made-up
// data, and their own day strip of times. The earliest time starts chosen.
// "See more providers" is its own screen. When rescheduling, the new time
// books straight away, so Legion's 48-hour policy shows above the button
// first, the same as "Cancel visit" (Lily, PR 16)

export const PROVIDER_FLOW = { phase: "your_provider" as const, part: 1, parts: 1, back: "/join/confirm" };

export function ProviderHeading({ summary }: { summary: string }) {
  return (
    <div className="flex flex-col gap-2">
      <PageTitle>{copy.provider.title}</PageTitle>
      <p className="text-body text-slate md:text-body-lg">{summary}</p>
    </div>
  );
}

export function ProviderPicker({
  recommended,
  summary,
  hasOthers,
  rescheduling = false,
  late = false,
}: {
  recommended: ProviderOption;
  summary: string;
  hasOthers: boolean;
  rescheduling?: boolean;
  // Rescheduling less than 48 hours before the visit has a fee
  late?: boolean;
}) {
  const [slotStart, setSlotStart] = useState(recommended.slots[0].start);
  const [earlier, setEarlier] = useState(false);
  const { book, pending, failed, taken } = useBook(recommended.id);
  const slot = recommended.slots.find((s) => s.start === slotStart) ?? recommended.slots[0];
  const [lead, ...rest] = recommended.reason.split(": ");

  return (
    <Screen
      flow={PROVIDER_FLOW}
      width="wide"
      footer={
        <div className="flex flex-col items-stretch gap-1">
          {taken && (
            <div role="alert">
              <FieldError>{copy.provider.timeTaken}</FieldError>
            </div>
          )}
          {failed && (
            <div role="alert" className="flex flex-col gap-1">
              <FieldError>{copy.common.somethingWentWrong}</FieldError>
              <p className="text-body text-slate">{copy.common.keepsHappening}</p>
            </div>
          )}
          {/* The short fee line stays by the button; the full policy is above it on the page */}
          {rescheduling && late && <p className="text-body font-semibold text-ink">{copy.visit.lateReschedule}</p>}
          <Button onClick={() => book(recommended.id, slot.start)} disabled={pending} className="w-full md:w-auto md:self-start">
            {failed ? copy.common.tryAgain : bookLabel(slot)}
          </Button>
          {hasOthers && (
            <ButtonLink href="/join/more-providers" variant="text" className="md:self-start">
              {copy.provider.seeMore}
            </ButtonLink>
          )}
          <DemoLine>{copy.provider.demoLabel}</DemoLine>
          {earlier && <DemoLine>{copy.provider.notificationLabel}</DemoLine>}
        </div>
      }
    >
      <ProviderHeading summary={summary} />
      <Card className="gap-3" aria-label={recommended.name} role="region">
        <div className="flex items-center gap-3">
          <ProviderPhoto name={recommended.name} large />
          <div className="flex flex-col">
            <p className="text-question font-semibold text-ink">{recommended.name}</p>
            <p className="text-body text-slate">{copy.provider.visitLength}</p>
          </div>
        </div>
        <p className="text-body">
          <strong className="font-semibold text-ink">{lead}:</strong> {rest.join(": ")}
        </p>
        <Availability name={recommended.name} slots={recommended.slots} selected={slot.start} onPick={setSlotStart} />
        <div className="border-t border-line pt-1">
          <Checkbox
            label={copy.provider.earlierTime}
            checked={earlier}
            onChange={(checked) => {
              if (checked) track("portal.earlier_time.requested");
              setEarlier(checked);
            }}
          />
          {earlier && (
            <p role="status" className="rise text-body text-slate">
              {copy.provider.earlierTimeOn}
            </p>
          )}
        </div>
      </Card>
      {rescheduling && (
        <p className="flex items-start gap-2 text-body text-navy">
          <Info size={18} className="mt-[3px] flex-none text-action" />
          {copy.checkout.cancelPolicy}
        </p>
      )}
    </Screen>
  );
}
