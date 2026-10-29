"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Chip } from "@/components/Chip";
import { List } from "@/components/List";
import { ProgressBar } from "@/components/ProgressBar";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Switch } from "@/components/Switch";
import { Tag } from "@/components/Tag";

// Section names here are for Lily, not patients, so they stay in this file
// rather than src/copy.ts. Sample strings are from docs/copy-draft.md

const colours = [
  { name: "ink", hex: "#000614", use: "Main text" },
  { name: "navy", hex: "#061B4D", use: "Deep accents" },
  { name: "brand", hex: "#3E70F7", use: "Legion's blue, decoration only" },
  { name: "action", hex: "#2F5FE0", use: "Buttons, links, selected" },
  { name: "action-hover", hex: "#244CC0", use: "Hover" },
  { name: "slate", hex: "#607086", use: "Secondary text" },
  { name: "wash", hex: "#EEF2FC", use: "Soft panels" },
  { name: "pale", hex: "#B6D3EA", use: "Decoration only" },
  { name: "line", hex: "#DCE2EA", use: "Dividers" },
  { name: "line-control", hex: "#7D879A", use: "Borders of things you tap" },
  { name: "error", hex: "#DC2626", use: "Errors and the crisis path only" },
];

const concerns = ["ADHD", "Anxiety", "Depression", "Sleep", "Not sure"];

const plans = [
  "Aetna",
  "Blue Cross Blue Shield",
  "Cigna",
  "UnitedHealthcare",
  "Oscar",
  "I don't see my plan",
].map((plan) => ({ value: plan, label: plan }));

const yesNo = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export function DesignReference() {
  const [chips, setChips] = useState<Record<string, boolean>>({
    Anxiety: true,
  });
  const [texas, setTexas] = useState<string>("yes");
  const [hospital, setHospital] = useState<string>();
  const [pay, setPay] = useState<string>();
  const [earlier, setEarlier] = useState(false);
  const [consent, setConsent] = useState(false);
  const [setting, setSetting] = useState(true);
  const [plan, setPlan] = useState<string>("Cigna");

  return (
    <div className="flex flex-col gap-12 pt-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl">Design reference</h1>
        <p className="text-slate">
          Tokens and components for checking on the live link. Not part of the
          patient flow. Rules and contrast ratios are in docs/design.md.
        </p>
      </div>

      <Section title="Progress">
        <ProgressBar step={2} total={4} />
      </Section>

      <Section title="Type">
        <h1 className="text-3xl">Heading 1 · Let&apos;s get you care</h1>
        <h2 className="text-2xl">Heading 2 · Talk to a person</h2>
        <h3 className="text-xl">Heading 3 · Your visit</h3>
        <p className="text-lg font-medium">
          Question · Will you be in Texas for your visits?
        </p>
        <p>
          Body · Answer a few quick questions, and you&apos;ll see a provider
          who&apos;s right for you. It takes a few minutes.
        </p>
        <p className="text-slate">Hint · MM / DD / YYYY</p>
        <p className="text-sm">Fine print · Demo prototype</p>
      </Section>

      <Section title="Colour">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {colours.map((colour) => (
            <li key={colour.name} className="flex items-center gap-3">
              <span
                className="size-10 flex-none rounded-md border border-line"
                style={{ background: colour.hex }}
              />
              <span className="flex flex-col">
                <span className="font-medium">
                  {colour.name} · {colour.hex}
                </span>
                <span className="text-sm text-slate">{colour.use}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Continue</Button>
          <Button variant="secondary">Start over</Button>
          <Button size="small">Continue</Button>
          <Button size="small" variant="secondary">
            Talk to a person
          </Button>
          <Button disabled>Book my visit</Button>
        </div>
      </Section>

      <Section title="Chip">
        <div className="flex flex-wrap gap-2">
          {concerns.map((concern) => (
            <Chip
              key={concern}
              label={concern}
              selected={Boolean(chips[concern])}
              onToggle={(next) => setChips({ ...chips, [concern]: next })}
            />
          ))}
        </div>
      </Section>

      <Section title="Segmented control">
        <SegmentedControl
          legend="Will you be in Texas for your visits?"
          name="texas"
          options={yesNo}
          value={texas}
          onChange={setTexas}
        />
        <SegmentedControl
          legend="Have you been in the hospital for mental health or substance use in the past year?"
          name="hospital"
          options={[
            { value: "no", label: "No" },
            { value: "yes", label: "Yes" },
          ]}
          value={hospital}
          onChange={setHospital}
          hint="This helps us make sure we can offer the right level of care."
        />
        <SegmentedControl
          legend="How will you pay?"
          name="pay"
          options={[
            { value: "insurance", label: "With insurance" },
            { value: "self_pay", label: "Self-pay (no insurance)" },
          ]}
          value={pay}
          onChange={setPay}
          error={pay ? undefined : "Please choose how you'll pay."}
        />
      </Section>

      <Section title="Checkbox">
        <Checkbox
          label="Tell me if an earlier time opens"
          checked={earlier}
          onChange={setEarlier}
        />
        <Checkbox
          label="I consent to treatment by Legion Health providers."
          checked={consent}
          onChange={setConsent}
          error={consent ? undefined : "Please check the box to continue."}
        />
      </Section>

      <Section title="Switch (settings only)">
        <Switch
          label="Sample setting"
          checked={setting}
          onChange={setSetting}
        />
      </Section>

      <Section title="List">
        <List
          legend="Your insurance plan"
          name="plan"
          items={plans}
          value={plan}
          onChange={setPlan}
        />
      </Section>

      <Section title="Tag">
        <div className="flex flex-wrap gap-2">
          <Tag>Demo: coverage check simulated</Tag>
          <Tag>From Legion&apos;s current flow</Tag>
        </div>
      </Section>
    </div>
  );
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="flex flex-col gap-4">
    <h2 className="border-b border-line pb-2 text-xl">{title}</h2>
    {children}
  </section>
);
