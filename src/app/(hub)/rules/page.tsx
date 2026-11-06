import { HubChrome } from "@/components/HubChrome";
import { PlaceholderPanel } from "@/components/PlaceholderPanel";
import { Page } from "@/components/layout";

export default function RulesPage() {
  return (
    <Page>
      <HubChrome title="Family Rules" subtitle="Household agreements" />
      <PlaceholderPanel
        heading="Rules board"
        body="Large readable rules will list here. Adults can edit later."
      />
    </Page>
  );
}
