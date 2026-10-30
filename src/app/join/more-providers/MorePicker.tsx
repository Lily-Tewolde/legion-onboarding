"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { cx } from "@/components/cx";
import { ChevronDown } from "@/components/icons";
import { DemoLine, PageTitle, Screen } from "@/components/Screen";
import { FieldError } from "@/components/SegmentedControl";
import { Tag } from "@/components/Tag";
import { copy } from "@/copy";
import { bookLabel, type ProviderOption } from "@/lib/provider/present";
import { visitShortDate } from "@/lib/visit-time";
import { Availability, ProviderPhoto } from "../provider/Availability";
import { PROVIDER_FLOW } from "../provider/ProviderPicker";
import { useBook } from "../provider/useBook";

const PAGE = 3;

export function MorePicker({ title, summary, providers }: { title: string; summary: string; providers: ProviderOption[] }) {
  const [recommended] = providers;
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<string | null>(recommended.id);
  const [choice, setChoice] = useState({ providerId: recommended.id, slotStart: recommended.slots[0].start });
  const { book, pending, failed, taken } = useBook(recommended.id);

  const chosen = providers.find((p) => p.id === choice.providerId) ?? recommended;
  const slot = chosen.slots.find((s) => s.start === choice.slotStart) ?? chosen.slots[0];

  return (
    <Screen
      flow={{ ...PROVIDER_FLOW, back: "/join/provider" }}
      width="wide"
      footer={
        <div className="flex flex-col items-stretch gap-1">
          {taken && (
            <div role="alert">
              <FieldError>{copy.provider.timeTaken}</FieldError>
            </div>
          )}
          {failed && (
            <div role="alert">
              <FieldError>{copy.common.somethingWentWrong}</FieldError>
            </div>
          )}
          <Button onClick={() => book(chosen.id, slot.start)} disabled={pending} className="w-full md:w-auto md:self-start">
            {failed ? copy.common.tryAgain : bookLabel(slot)}
          </Button>
          {shown < providers.length && (
            <Button variant="text" className="md:self-start" onClick={() => setShown(shown + PAGE)}>
              {copy.provider.showMore}
            </Button>
          )}
          <DemoLine>{copy.provider.demoLabel}</DemoLine>
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <PageTitle>{title}</PageTitle>
        <p className="text-body text-slate md:text-body-lg">{summary}</p>
      </div>
      <div className="flex flex-col gap-3">
        {providers.slice(0, shown).map((provider, index) => {
          const expanded = open === provider.id;
          const selected = choice.providerId === provider.id;
          const next = provider.slots[0];
          return (
            <section
              key={provider.id}
              aria-label={provider.name}
              className={cx(
                "rise rounded-card bg-white shadow-card",
                selected ? "border-2 border-action" : "border border-card-line hover:border-card-hover hover:shadow-card-hover",
              )}
            >
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : provider.id)}
                className="focus-ring flex w-full cursor-pointer items-start gap-3 rounded-card p-4 text-left md:px-6"
              >
                <ProviderPhoto name={provider.name} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-question font-semibold text-ink">{provider.name}</span>
                    {index === 0 && <Tag>{copy.provider.recommended}</Tag>}
                  </span>
                  <span className="text-body text-navy">{provider.reason.split(": ").slice(1).join(": ")}</span>
                  <span className="text-body text-slate">
                    {copy.provider.next.replace("{date}", visitShortDate(next.start)).replace("{time}", next.time)}
                  </span>
                </span>
                <ChevronDown size={22} className={cx("mt-1 flex-none text-action transition-transform duration-300", expanded && "rotate-180")} />
              </button>
              {expanded && (
                <div className="expand">
                  <div className="px-4 pb-4 md:px-6">
                    <Availability
                      name={provider.name}
                      slots={provider.slots}
                      selected={selected ? slot.start : null}
                      onPick={(slotStart) => setChoice({ providerId: provider.id, slotStart })}
                    />
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </Screen>
  );
}
