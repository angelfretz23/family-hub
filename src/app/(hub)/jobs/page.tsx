import { HubChrome } from "@/components/HubChrome";
import { PlaceholderPanel } from "@/components/PlaceholderPanel";
import { Page } from "@/components/layout";

export default function JobsPage() {
  return (
    <Page>
      <HubChrome title="Jobs" subtitle="Assignable chores" />
      <PlaceholderPanel
        heading="Open"
        body="Jobs board with large checkboxes and assignees will live here."
      />
    </Page>
  );
}
