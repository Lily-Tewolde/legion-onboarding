import type { Metadata } from "next";
import { DesignReference } from "./DesignReference";

// A reference page for checking the tokens and components on the live link.
// Not part of the patient flow, and kept out of search engines
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DesignPage() {
  return <DesignReference />;
}
