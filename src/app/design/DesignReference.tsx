"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Chip } from "@/components/Chip";
import { List } from "@/components/List";
import { ConcernIcon } from "@/components/concernIcons";
import { Card, PageTitle, Screen } from "@/components/Screen";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Skeleton } from "@/components/Skeleton";
import { Tag } from "@/components/Tag";
import { TextField } from "@/components/TextField";
import { copy } from "@/copy";

// Section names here are for Lily, not patients, so they stay in this file
// rather than src/copy.ts. Sample strings are from docs/copy-draft.md

const colours = [
  { name: "ink", hex: "#000614", use: "Headings and main text" },
  { name: "navy", hex: "#061B4D", use: "Body text, Leave this page" },
  { name: "slate", hex: "#4F5D72", use: "Secondary text, demo lines" },
  { name: "action", hex: "#2F5FE0", use: "Buttons, links, selected" },
  { name: "action-hover", hex: "#234BB8", use: "Hover and pressed" },
  { name: "brand", hex: "#3E70F7", use: "Legion's blue, icons and decoration" },
  { name: "wash", hex: "#EEF2FC", use: "Selected fills, icon circles" },
  { name: "tag", hex: "#DCE6FA", use: "Tags" },
  { name: "card-line", hex: "#E3E9F5", use: "Card borders" },
  { name: "line", hex: "#E3E8F2", use: "Dividers" },
  { name: "line-control", hex: "#8590A2", use: "Borders of things you tap" },
  { name: "error", hex: "#C42B2B", use: "Error borders, the crisis icons" },
  { name: "error-text", hex: "#A32020", use: "Error messages" },
  { name: "error-tint", hex: "#FDECEC", use: "Crisis icon circles, safety flags" },
];

const concerns = ["ADHD", "Anxiety", "Depression", "Sleep"] as const;

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
  const [name, setName] = useState("Maria");
  const [plan, setPlan] = useState<string>("Cigna");

  return (
    <Screen width="wide" className="gap-12! pb-12">
      <div className="flex flex-col gap-2">
        <PageTitle>Design reference</PageTitle>
        <p className="text-body text-slate">
          Tokens and components for checking on the live link. Not part of the patient flow. The spec is Claude
          Design&apos;s Style &amp; Components board.
        </p>
      </div>

      <Section title="Type">
        <h1 className="display text-page-title-lg text-ink">Page title · Let&apos;s get you care</h1>
        <p className="display text-notice-title font-semibold text-ink">Notice title · Help is available right now</p>
        <p className="text-card-question-lg font-semibold text-ink">Card question · Will you be in Texas?</p>
        <p className="text-question font-semibold text-ink">Question · Do you have health insurance?</p>
        <p className="text-body-lg text-navy">
          Body large · Answer a few quick questions, and you&apos;ll see a provider who&apos;s right for you.
        </p>
        <p className="text-body text-navy">Body · It takes a few minutes.</p>
        <p className="text-label font-semibold text-slate">Label · What&apos;s going on</p>
      </Section>

      <Section title="Colour">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {colours.map((colour) => (
            <li key={colour.name} className="flex items-center gap-3">
              <span
                className="size-10 flex-none rounded-field border border-line"
                style={{ background: colour.hex }}
              />
              <span className="flex flex-col">
                <span className="text-body font-semibold text-ink">
                  {colour.name} · {colour.hex}
                </span>
                <span className="text-label text-slate">{colour.use}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Continue</Button>
          <Button variant="secondary">Continue as self-pay</Button>
          <Button variant="text">Start over</Button>
          <Button size="small">9</Button>
          <Button disabled>Book my visit</Button>
        </div>
      </Section>

      <Section title="Chip">
        <div className="flex flex-wrap gap-2">
          {concerns.map((concern) => (
            <Chip
              key={concern}
              label={concern}
              icon={<ConcernIcon label={concern} />}
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
          legend={copy.join.payMethod}
          name="pay"
          options={[
            { value: "insurance", label: copy.join.withInsurance },
            { value: "self_pay", label: copy.join.selfPay },
          ]}
          value={pay}
          onChange={setPay}
          error={pay ? undefined : copy.join.errors.payMethod}
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

      <Section title="Text field">
        <TextField id="design-name" label="First name" value={name} onChange={setName} valid={name.length > 1} />
        <TextField id="design-email" label="Email" value="" onChange={() => {}} error="Please enter your email." />
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

      <Section title="Card and loading">
        <Card>
          <p className="text-question font-semibold text-ink">A card behind anything people read</p>
          <p className="text-body text-navy">16px padding on phones, 24px on desktop.</p>
        </Card>
        <Skeleton rows={2} />
      </Section>

      <Section title="Tag">
        <div className="flex flex-wrap gap-2">
          <Tag>Demo: coverage check simulated</Tag>
          <Tag>From Legion&apos;s current flow</Tag>
        </div>
      </Section>
    </Screen>
  );
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="flex flex-col gap-4">
    <h2 className="border-b border-line pb-2 text-card-question font-semibold text-ink">{title}</h2>
    {children}
  </section>
);
