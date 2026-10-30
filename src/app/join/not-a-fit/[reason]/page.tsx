import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { TalkToPersonButton } from "@/components/HelpPanel";
import { Heart, Phone } from "@/components/icons";
import { InlineLink } from "@/components/InlineLink";
import { Notice, NoticeText, ResourceTile } from "@/components/Notice";
import { copy } from "@/copy";
import { goBackPath, isScreenOutReason, SCREEN_OUT_REASONS } from "@/lib/fit/flow";
import type { ScreenOutReason } from "@/server/sessions";

// The screen-outs (boards U01 to U04): one calm layout, with the right
// resources for each reason on their own tile, "Talk to a person", and
// "Answered by mistake? Go back", which returns to the step with that answer,
// with the answers kept

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
    <Notice
      icon={<Heart size={24} />}
      title={copy.screenOut.title}
      actions={
        <>
          <TalkToPersonButton label={copy.crisis.talkToPerson} variant="primary" className="w-full" />
          <ButtonLink href={goBackPath[reason]} variant="text" className="w-full">
            {copy.screenOut.goBack}
          </ButtonLink>
        </>
      }
    >
      {lines.map((line) => (
        <NoticeText key={line}>{line}</NoticeText>
      ))}
      <ResourceTile icon={<Phone size={16} />}>
        <InlineLink text={resource.text} label={resource.label} href={resource.href} />
      </ResourceTile>
    </Notice>
  );
}
