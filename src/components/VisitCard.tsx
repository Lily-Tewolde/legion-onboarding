import { copy } from "@/copy";
import { visitShortDate, visitTime } from "@/lib/visit-time";
import { cx } from "./cx";
import { Calendar, User, VideoCall } from "./icons";

// The visit card (Claude Design's VisitCard): two or three labelled rows,
// with the short date ("Mon, Nov 2") so nothing wraps. With two rows, "Video"
// joins the When row. Extras below it come from the screen
export function VisitCard({
  slotStart,
  provider,
  rows = 3,
  icons = false,
  bare = false,
  children,
  className,
}: {
  slotStart: string;
  provider: string;
  rows?: 2 | 3;
  icons?: boolean;
  bare?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  const when = copy.visitCard.whenValue.replace("{date}", visitShortDate(slotStart)).replace("{time}", visitTime(slotStart));
  const items = [
    { label: copy.visitCard.when, value: rows === 3 ? when : `${when} · ${copy.visitCard.videoShort}`, Icon: Calendar },
    { label: copy.visitCard.with, value: provider, Icon: User },
    ...(rows === 3 ? [{ label: copy.visitCard.how, value: copy.visitCard.video, Icon: VideoCall }] : []),
  ];

  return (
    <div className={cx("flex flex-col gap-3", !bare && "rounded-tile border border-card-line bg-white px-4 py-3", className)}>
      <dl className={cx("grid gap-x-4 gap-y-1.5", icons ? "grid-cols-1" : "grid-cols-[auto_1fr]")}>
        {items.map(({ label, value, Icon }) =>
          icons ? (
            <div key={label} className="flex items-start gap-3">
              <span aria-hidden="true" className="mt-0.5 flex size-8 flex-none items-center justify-center rounded-full bg-wash text-brand">
                <Icon size={16} />
              </span>
              <div className="flex flex-col">
                <dt className="text-label text-slate">{label}</dt>
                <dd className="text-body font-semibold text-ink">{value}</dd>
              </div>
            </div>
          ) : (
            <div key={label} className="contents">
              <dt className="text-body text-slate">{label}</dt>
              <dd className="text-body font-semibold whitespace-nowrap text-ink">{value}</dd>
            </div>
          ),
        )}
      </dl>
      {children && <div className="flex flex-col items-start gap-1 border-t border-line pt-3">{children}</div>}
    </div>
  );
}
