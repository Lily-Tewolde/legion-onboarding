import type { Metadata } from "next";
import { Card, PageTitle, Screen } from "@/components/Screen";
import { copy } from "@/copy";

// Where "Read the consent" on details opens, in a new tab. Legion's consent
// to treatment isn't published, so this says where the full text would go
// and holds no consent language (Lily, Oct 30)
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ConsentPage() {
  return (
    <Screen>
      <PageTitle>{copy.consentPage.title}</PageTitle>
      <Card>
        <p className="text-body-lg">{copy.consentPage.body}</p>
      </Card>
    </Screen>
  );
}
