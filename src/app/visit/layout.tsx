import { PortalTabs } from "./PortalTabs";

// The patient portal after booking: the visit, the inbox and the profile
export default function PortalLayout({ children }: LayoutProps<"/visit">) {
  return (
    <>
      <PortalTabs />
      {children}
    </>
  );
}
