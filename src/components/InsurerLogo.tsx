import Image from "next/image";

// A small insurer logo beside the plan name (Lily, Oct 29), as in Legion's
// current flow. From each insurer's own site, credited in
// public/photos/CREDITS.md. The plan name is always written beside it, so
// screen readers skip the logo. Plans without one keep the same space, so
// the names line up

const LOGOS: Record<string, string> = {
  aetna: "/insurers/aetna.svg",
  bcbs: "/insurers/bcbs.svg",
  cigna: "/insurers/cigna.svg",
  unitedhealthcare: "/insurers/unitedhealthcare.svg",
  oscar: "/insurers/oscar.svg",
};

export function InsurerLogo({ planId }: { planId?: string | null }) {
  const src = planId ? LOGOS[planId] : undefined;
  return (
    <span aria-hidden="true" className="relative h-6 w-20 flex-none md:w-16">
      {src && <Image src={src} alt="" fill unoptimized sizes="80px" className="object-contain object-left" />}
    </span>
  );
}
