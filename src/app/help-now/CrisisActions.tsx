import type { ReactNode } from "react";
import { ButtonLink } from "@/components/Button";
import { cx } from "@/components/cx";

// The crisis screens' actions (boards U06 and U08): one primary call button,
// then the other ways to reach someone as text-style buttons. On phones they
// sit two to a row; on desktop they share one centred row
export function CrisisActions({ call, others }: { call: { href: string; label: string }; others: ReactNode }) {
  return (
    <>
      <ButtonLink href={call.href} className="w-full">
        {call.label}
      </ButtonLink>
      <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:justify-center md:gap-x-6 md:gap-y-0">{others}</div>
    </>
  );
}

export const OtherAction = ({ href, children, wide }: { href: string; children: ReactNode; wide?: boolean }) => (
  <ButtonLink href={href} variant="text" className={cx("w-full md:w-auto", wide && "max-md:col-span-2")}>
    {children}
  </ButtonLink>
);
