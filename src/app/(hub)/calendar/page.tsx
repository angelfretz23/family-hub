import { HubChrome } from "@/components/HubChrome";
import { PlaceholderPanel } from "@/components/PlaceholderPanel";
import { Page, Segmented, SegmentedItem } from "@/components/layout";

const VIEWS = ["List", "Day", "Week", "Month"] as const;

export default function CalendarPage() {
  return (
    <Page>
      <HubChrome title="Calendar" subtitle="List · Day · Week · Month" />

      <Segmented role="tablist" aria-label="Calendar view">
        {VIEWS.map((view, index) => (
          <SegmentedItem
            key={view}
            type="button"
            $active={index === 0}
            role="tab"
            aria-selected={index === 0}
          >
            {view}
          </SegmentedItem>
        ))}
      </Segmented>

      <PlaceholderPanel
        heading="List"
        body="Agenda from now, grouped by day. Event create/edit comes next."
      />
    </Page>
  );
}
