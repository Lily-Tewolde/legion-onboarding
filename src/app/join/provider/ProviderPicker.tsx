"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Card, DemoLine, PageTitle, Screen } from "@/components/Screen";
import { FieldError } from "@/components/SegmentedControl";
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
}: {
  recommended: ProviderOption;
  summary: string;
  hasOthers: boolean;
  rescheduling?: boolean;
}) {
  const [slotStart, setSlotStart] = useState(recommended.slots[0].start);
  const [earlier, setEarlier] = useState(false);
  const { book, pending, failed } = useBook(recommended.id);
  const slot = recommended.slots.find((s) => s.start === slotStart) ?? recommended.slots[0];
  const [lead, ...rest] = recommended.reason.split(": ");

  return (
    <Screen
      flow={PROVIDER_FLOW}
      width="wide"
      footer={
        <div className="flex flex-col items-stretch gap-1">
          {failed && (
            <div role="alert" className="flex flex-col gap-1">
              <FieldError>{copy.common.somethingWentWrong}</FieldError>
              <p className="text-body text-slate">{copy.common.keepsHappening}</p>
            </div>
          )}
          {rescheduling && <p className="text-body text-navy">{copy.checkout.cancelPolicy}</p>}
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
    </Screen>
  );
}
