import { HubChrome } from "@/components/HubChrome";
import { PlaceholderPanel } from "@/components/PlaceholderPanel";

export default function JobsPage() {
  return (
    <div className="page">
      <HubChrome title="Jobs" subtitle="Assignable chores" />
      <PlaceholderPanel
        heading="Open"
        body="Jobs board with large checkboxes and assignees will live here."
      />
    </div>
  );
}
