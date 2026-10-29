import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { InlineLink } from "@/components/InlineLink";
import { copy } from "@/copy";
import { goBackPath, isScreenOutReason, SCREEN_OUT_REASONS } from "@/lib/fit/flow";
import type { ScreenOutReason } from "@/server/sessions";

// The screen-outs: one calm layout, with the right resources for each reason
// and "Answered by mistake? Go back", which returns to the step with that
// answer, with the answers kept. Layout only for now; the visual design comes later

const SAMHSA = "tel:+18006624357";

const content: Record<ScreenOutReason, { lines: readonly string[]; resource: { text: string; label: string; href: string } }> = {
  under_18: {
    lines: copy.screenOut.under18,
    resource: { text: copy.screenOut.under18Crisis, label: copy.screenOut.crisisNumber, href: "tel:988" },
  },
  not_in_texas: {
    lines: copy.screenOut.notInTexas,
    resource: { text: copy.screenOut.samhsa, label: copy.screenOut.samhsaNumber, href: SAMHSA },
  },
  medicaid_medicare: {
    lines: copy.screenOut.medicaidMedicare,
    resource: { text: copy.screenOut.samhsa, label: copy.screenOut.samhsaNumber, href: SAMHSA },
  },
  hospital_stay: {
    lines: copy.screenOut.hospitalStay,
    resource: { text: copy.screenOut.hospitalSamhsa, label: copy.screenOut.samhsaNumber, href: SAMHSA },
  },
};

export function generateStaticParams() {
  return SCREEN_OUT_REASONS.map((reason) => ({ reason }));
}

export default async function NotAFitPage({ params }: PageProps<"/join/not-a-fit/[reason]">) {
  const { reason } = await params;
  if (!isScreenOutReason(reason)) notFound();
  const { lines, resource } = content[reason];

  return (
    <div className="flex flex-col gap-6 pt-6">
      <h1 className="text-3xl">{copy.screenOut.title}</h1>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p>
        <InlineLink text={resource.text} label={resource.label} href={resource.href} />
      </p>
      <ButtonLink href={goBackPath[reason]} variant="text" className="self-start">
        {copy.screenOut.goBack}
      </ButtonLink>
    </div>
  );
}
