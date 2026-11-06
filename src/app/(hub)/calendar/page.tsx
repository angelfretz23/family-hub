import { HubChrome } from "@/components/HubChrome";
import { PlaceholderPanel } from "@/components/PlaceholderPanel";

const VIEWS = ["List", "Day", "Week", "Month"] as const;

export default function CalendarPage() {
  return (
    <div className="page">
      <HubChrome title="Calendar" subtitle="List · Day · Week · Month" />

      <div className="segmented" role="tablist" aria-label="Calendar view">
        {VIEWS.map((view, index) => (
          <button
            key={view}
            type="button"
            className={
              index === 0 ? "segmented-item segmented-item-active" : "segmented-item"
            }
            role="tab"
            aria-selected={index === 0}
          >
            {view}
          </button>
        ))}
      </div>

      <PlaceholderPanel
        heading="List"
        body="Agenda from now, grouped by day. Event create/edit comes next."
      />
    </div>
  );
}
