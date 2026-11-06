import { HubChrome } from "@/components/HubChrome";
import { PlaceholderPanel } from "@/components/PlaceholderPanel";

export default function RulesPage() {
  return (
    <div className="page">
      <HubChrome title="Family Rules" subtitle="Household agreements" />
      <PlaceholderPanel
        heading="Rules board"
        body="Large readable rules will list here. Adults can edit later."
      />
    </div>
  );
}
