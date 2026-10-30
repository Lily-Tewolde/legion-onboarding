"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { List } from "@/components/List";
import { Tag } from "@/components/Tag";
import { copy } from "@/copy";
import { bookLabel, type ProviderOption } from "@/lib/provider/present";

// The recommended provider and their times, with "See more providers" for
// everyone else who treats one of their concerns. The earliest time starts
// chosen. "Book {day} at {time}" holds it in the session and opens the checkout

type Choice = { providerId: string; slotStart: string };

export function ProviderPicker({ recommended, others }: { recommended: ProviderOption; others: ProviderOption[] }) {
  const router = useRouter();
  const [choice, setChoice] = useState<Choice>({ providerId: recommended.id, slotStart: recommended.slots[0].start });
  const [earlier, setEarlier] = useState(false);
  const [showOthers, setShowOthers] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  // Next keeps this screen alive when people move on; clear what was in progress
  useLayoutEffect(
    () => () => {
      setPending(false);
      setFailed(false);
    },
    [],
  );

  const chosenProvider = [recommended, ...others].find((p) => p.id === choice.providerId) ?? recommended;
  const chosenSlot = chosenProvider.slots.find((s) => s.start === choice.slotStart) ?? chosenProvider.slots[0];

  const book = async () => {
    setPending(true);
    setFailed(false);
    try {
      const response = await fetch("/api/join/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: chosenProvider.id, slotStart: chosenSlot.start }),
      });
      if (!response.ok) throw new Error(`reserve failed: ${response.status}`);
      const { path } = await response.json();
      router.push(path);
    } catch {
      setFailed(true);
      setPending(false);
    }
  };

  const times = (provider: ProviderOption) => (
    <List
      legend={copy.provider.pickTime}
      name={`slot-${provider.id}`}
      items={provider.slots.map((slot) => ({ value: slot.start, label: slot.label }))}
      value={choice.providerId === provider.id ? choice.slotStart : undefined}
      onChange={(slotStart) => setChoice({ providerId: provider.id, slotStart })}
    />
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl">{recommended.name}</h2>
        <p>{recommended.reason}</p>
        <div>
          <Tag>{copy.provider.demoLabel}</Tag>
        </div>
        <p className="text-slate">{copy.provider.visitLength}</p>
        {times(recommended)}
      </section>

      {others.length > 0 && (
        <div className="flex flex-col gap-4">
          <Button variant="text" className="self-start" aria-expanded={showOthers} onClick={() => setShowOthers(!showOthers)}>
            {copy.provider.seeMore}
          </Button>
          {showOthers &&
            others.map((provider) => (
              <section key={provider.id} className="flex flex-col gap-3 border-t border-line pt-4">
                <h2 className="text-xl">{provider.name}</h2>
                {provider.treats && <p>{provider.treats}</p>}
                <div>
                  <Tag>{copy.provider.demoLabel}</Tag>
                </div>
                {times(provider)}
              </section>
            ))}
        </div>
      )}

      <div className="flex flex-col items-start gap-2">
        <Checkbox label={copy.provider.earlierTime} checked={earlier} onChange={setEarlier} />
        {earlier && (
          <div className="flex flex-col gap-1">
            <p>{copy.provider.earlierTimeOn}</p>
            <div>
              <Tag>{copy.provider.notificationLabel}</Tag>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-start gap-3">
        {failed && (
          <div role="alert" className="flex flex-col gap-1">
            <p className="text-error">{copy.common.somethingWentWrong}</p>
            <p>{copy.common.keepsHappening}</p>
          </div>
        )}
        <Button onClick={book} disabled={pending}>
          {failed ? copy.common.tryAgain : bookLabel(chosenSlot)}
        </Button>
      </div>
    </div>
  );
}
