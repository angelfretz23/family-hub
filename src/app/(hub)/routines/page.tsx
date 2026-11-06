import { HubChrome } from "@/components/HubChrome";
import { PlaceholderPanel } from "@/components/PlaceholderPanel";
import { Page } from "@/components/layout";

export default function RoutinesPage() {
  return (
    <Page>
      <HubChrome title="Routines" subtitle="Recurring step sequences" />
      <PlaceholderPanel
        heading="Today’s runs"
        body="Routine runner and editor will live here."
      />
    </Page>
  );
}
