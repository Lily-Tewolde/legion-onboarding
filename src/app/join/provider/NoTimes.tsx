"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { TalkToPersonButton } from "@/components/HelpPanel";
import { CalendarCheck } from "@/components/icons";
import { DemoLine, PageTitle, Screen } from "@/components/Screen";
import { copy } from "@/copy";
import { PROVIDER_FLOW } from "./flow";

// No provider has times for their plan and concerns (in the demo, Oscar +
// Sleep). "Tell me when times open" is simulated, like the earlier-time box
export function NoTimes({ summary }: { summary: string }) {
  const [notify, setNotify] = useState(false);
  return (
    <Screen
      flow={PROVIDER_FLOW}
      footer={
        <div className="flex flex-col items-stretch gap-1">
          <TalkToPersonButton label={copy.provider.talkToPerson} variant="primary" />
          <Button variant="text" aria-pressed={notify} onClick={() => setNotify(true)}>
            {copy.provider.tellMeWhenTimesOpen}
          </Button>
          {notify && <DemoLine>{copy.provider.notificationLabel}</DemoLine>}
        </div>
      }
    >
      <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-wash text-action">
        <CalendarCheck size={24} />
      </span>
      <div className="flex flex-col gap-2">
        <PageTitle>{copy.provider.noTimes}</PageTitle>
        <p className="text-body text-slate md:text-body-lg">{summary}</p>
      </div>
      {notify && (
        <p role="status" className="rise text-body">
          {copy.provider.timesOpenOn}
        </p>
      )}
    </Screen>
  );
}
