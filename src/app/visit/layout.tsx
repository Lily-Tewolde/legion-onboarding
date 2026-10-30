// The patient portal after booking. Each screen lays itself out with
// <PortalScreen>; the check-in has its own layout, without the tabs
export default function PortalLayout({ children }: LayoutProps<"/visit">) {
  return children;
}
