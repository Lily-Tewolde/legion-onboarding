"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { TalkToPersonButton } from "@/components/HelpPanel";
import { Tag } from "@/components/Tag";
import { copy } from "@/copy";

// No provider has times for their plan and concerns (in the demo, Oscar +
// Sleep). "Tell me when times open" is simulated, like the earlier-time box
export function NoTimes() {
  const [notify, setNotify] = useState(false);
  return (
    <div className="flex flex-col items-start gap-4">
      <p>{copy.provider.noTimes}</p>
      <TalkToPersonButton label={copy.provider.talkToPerson} variant="primary" />
      <Button variant="text" aria-pressed={notify} onClick={() => setNotify(!notify)}>
        {copy.provider.tellMeWhenTimesOpen}
      </Button>
      {notify && <Tag>{copy.provider.notificationLabel}</Tag>}
    </div>
  );
}
