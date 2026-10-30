import type { ReactNode } from "react";
import type { Phase } from "@/lib/progress";
import { cx } from "./cx";
import { BackLink, MobileProgress } from "./MobileProgress";
import { PathPanel, type PanelProvider } from "./PathPanel";
import { PHASE_LABEL } from "./phase";

// Every screen's layout, from the boards (Main, "Layout between mobile and
// desktop"):
// - Below 768px: the four-segment progress with the back arrow under the top
//   bar, one column with 16px gutters, and the primary button pinned to the
//   bottom with the safe area. On short phones (under 760px tall) the
//   spacing tightens, so content clears that button at 390 x 700
// - 768 to 1023px: one centred column, the button no longer pinned
// - 1024px and up: the path-to-care panel (320px) beside the content, 48px
//   apart, with Back above the phase label
// The phase name is a small label above the heading, in the same spot on
// every booking screen. One soft blue glow sits behind the content

export type Flow = {
  phase: Phase;
  part: number;
  parts: number;
  back?: string;
  provider?: PanelProvider;
  booked?: boolean;
};

const WIDTHS = { form: "max-w-form", picker: "max-w-picker", wide: "max-w-wide" } as const;

export function Screen({
  flow,
  departingFlow,
  width = "form",
  footer,
  children,
  className,
}: {
  flow?: Flow;
  // "You're booked": the panel slides away as the screen arrives
  departingFlow?: Flow;
  width?: keyof typeof WIDTHS;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="screen relative flex flex-1 flex-col overflow-x-clip">
      <Glow />
      {flow && <MobileProgress phase={flow.phase} part={flow.part} parts={flow.parts} back={flow.back} />}
      <div className="relative z-[1] mx-auto flex w-full max-w-shell flex-1 gap-12 md:px-8 md:py-6">
        {departingFlow && (
          <div aria-hidden="true" className="panel-away max-lg:hidden">
            <PathPanel {...departingFlow} />
          </div>
        )}
        {flow && (
          <div className="hidden w-panel flex-none lg:flex">
            <PathPanel phase={flow.phase} part={flow.part} parts={flow.parts} provider={flow.provider} booked={flow.booked} />
          </div>
        )}
        <div className={cx("flex min-w-0 flex-1 flex-col", flow ? "lg:items-start" : "items-center")}>
          <main
            className={cx(
              "screen-body flex w-full flex-1 flex-col gap-3 px-4 pt-1 pb-2 short:gap-2 short:pt-0 md:mx-auto md:flex-none md:gap-4 md:px-0 md:pt-0 lg:mx-0",
              !flow && "md:pt-6",
              WIDTHS[width],
              className,
            )}
          >
            {flow && (
              <>
                <div className="hidden min-h-control-sm items-center lg:flex">{flow.back && <BackLink href={flow.back} />}</div>
                <p className="-mb-2 text-label leading-[18px] font-semibold text-slate md:leading-5">{PHASE_LABEL[flow.phase]}</p>
              </>
            )}
            {children}
          </main>
          {footer && (
            <div
              className={cx(
                "sticky bottom-0 z-10 w-full bg-white px-4 pt-2 pb-[calc(12px+env(safe-area-inset-bottom))]",
                "short:pt-1.5 short:pb-[calc(8px+env(safe-area-inset-bottom))]",
                "md:static md:mx-auto md:bg-transparent md:px-0 md:pt-4 md:pb-0 lg:mx-0",
                WIDTHS[width],
              )}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// The one soft glow: blue only ever sits behind content
export const Glow = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute top-14 -right-[230px] z-0 size-[360px] rounded-full bg-[radial-gradient(closest-side,#e9effc,rgba(233,239,252,0))] md:top-[60px] md:-right-[220px] md:size-[720px] md:bg-[radial-gradient(closest-side,#e4ecfb,rgba(228,236,251,0))]"
  />
);

// The page title, set in Inter Display: 26/32 on phones, 32/40 on desktop
export function PageTitle({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h1 id={id} className="display text-page-title md:text-page-title-lg">
      {children}
    </h1>
  );
}

// A white card behind anything people read: 16px padding on phones (12px on
// short ones), 24px on desktop
export function Card({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("card flex flex-col gap-2 p-4 short:p-3 md:p-6", className)} {...rest}>
      {children}
    </div>
  );
}

// The small line at the bottom of a screen where something is simulated
export const DemoLine = ({ children }: { children: ReactNode }) => (
  <p className="text-center text-label text-slate md:text-left">{children}</p>
);
