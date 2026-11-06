"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import type { Person } from "@/db/schema";
import type { EventWithPeople } from "@/lib/events";
import {
  addDays,
  addMonths,
  eachDayKey,
  formatDayHeading,
  formatMonthHeading,
  formatWeekRange,
  parseDateKey,
  toDateKey,
} from "@/lib/dates";
import { CalendarMonthView } from "@/components/CalendarMonthView";
import { CalendarWeekView } from "@/components/CalendarWeekView";
import { EventCard } from "@/components/EventCard";
import { EventEditor } from "@/components/EventEditor";
import { HubChrome } from "@/components/HubChrome";
import { PersonCards, filterBySelectedPeople } from "@/components/PersonCards";
import { Page, Segmented, SegmentedItem } from "@/components/layout";

const VIEWS = [
  { id: "list", label: "List" },
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
`;

const NavRow = styled.div`
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
`;

const NavButton = styled.button`
  min-height: ${({ theme }) => theme.sizes.touch};
  padding: 0 1.1rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panelStrong};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 1.1rem;
  font-weight: 650;
  cursor: pointer;
`;

const PrimaryButton = styled(NavButton)`
  background: ${({ theme }) => theme.colors.ink};
  border-color: ${({ theme }) => theme.colors.ink};
  color: ${({ theme }) => theme.colors.cream};
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const DayGroup = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const DayLabel = styled.h2`
  margin: 0.4rem 0 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.55rem;
`;

const Empty = styled.p`
  margin: 0;
  padding: 1.25rem 0.25rem;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.2rem;
`;

type CalendarClientProps = {
  people: Person[];
  events: EventWithPeople[];
  initialView?: ViewId;
  initialDateKey?: string;
};

function subtitleFor(view: ViewId, selectedDate: Date) {
  if (view === "day") return formatDayHeading(selectedDate);
  if (view === "week") return formatWeekRange(selectedDate);
  if (view === "month") return formatMonthHeading(selectedDate);
  return "Family schedule";
}

export function CalendarClient({
  people,
  events,
  initialView = "list",
  initialDateKey,
}: CalendarClientProps) {
  const [view, setView] = useState<ViewId>(initialView);
  const [dateKey, setDateKey] = useState(
    initialDateKey ?? toDateKey(new Date()),
  );
  const [editing, setEditing] = useState<EventWithPeople | null>(null);
  const [creating, setCreating] = useState(false);
  const [createDateKey, setCreateDateKey] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const selectedDate = useMemo(() => parseDateKey(dateKey), [dateKey]);
  const todayKey = toDateKey(new Date());

  const visibleEvents = useMemo(
    () =>
      filterBySelectedPeople(events, selectedIds, (event) =>
        event.people.map((person) => person.id),
      ),
    [events, selectedIds],
  );

  const listGroups = useMemo(() => {
    const groups = new Map<string, EventWithPeople[]>();
    for (const event of visibleEvents) {
      const startKey = event.startsAt.slice(0, 10);
      const endKey = event.endsAt.slice(0, 10);
      const rangeStart = startKey < todayKey ? todayKey : startKey;
      if (endKey < todayKey) continue;

      for (const key of eachDayKey(rangeStart, endKey)) {
        const list = groups.get(key) ?? [];
        list.push(event);
        groups.set(key, list);
      }
    }
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, dayEvents]) => ({
        dateKey: key,
        label: formatDayHeading(parseDateKey(key)),
        events: dayEvents,
      }));
  }, [visibleEvents, todayKey]);

  const dayEvents = useMemo(
    () =>
      visibleEvents.filter((event) => {
        const startKey = event.startsAt.slice(0, 10);
        const endKey = event.endsAt.slice(0, 10);
        return startKey <= dateKey && endKey >= dateKey;
      }),
    [visibleEvents, dateKey],
  );

  function goPrev() {
    if (view === "day") setDateKey(toDateKey(addDays(selectedDate, -1)));
    if (view === "week") setDateKey(toDateKey(addDays(selectedDate, -7)));
    if (view === "month") setDateKey(toDateKey(addMonths(selectedDate, -1)));
  }

  function goNext() {
    if (view === "day") setDateKey(toDateKey(addDays(selectedDate, 1)));
    if (view === "week") setDateKey(toDateKey(addDays(selectedDate, 7)));
    if (view === "month") setDateKey(toDateKey(addMonths(selectedDate, 1)));
  }

  function openCreate(forDay?: string) {
    setCreateDateKey(forDay ?? dateKey);
    setCreating(true);
  }

  function selectDay(nextKey: string) {
    setDateKey(nextKey);
    setView("day");
  }

  const showPeriodNav = view === "day" || view === "week" || view === "month";

  return (
    <Page>
      <HubChrome title="Calendar" subtitle={subtitleFor(view, selectedDate)} />

      <PersonCards
        people={people}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
        selectable
      />

      <Segmented role="tablist" aria-label="Calendar view">
        {VIEWS.map((item) => (
          <SegmentedItem
            key={item.id}
            type="button"
            $active={view === item.id}
            role="tab"
            aria-selected={view === item.id}
            onClick={() => setView(item.id)}
          >
            {item.label}
          </SegmentedItem>
        ))}
      </Segmented>

      <Toolbar>
        <NavRow>
          {showPeriodNav ? (
            <>
              <NavButton type="button" onClick={goPrev}>
                Prev
              </NavButton>
              <NavButton
                type="button"
                onClick={() => setDateKey(toDateKey(new Date()))}
              >
                Today
              </NavButton>
              <NavButton type="button" onClick={goNext}>
                Next
              </NavButton>
            </>
          ) : null}
        </NavRow>
        <PrimaryButton type="button" onClick={() => openCreate()}>
          Add event
        </PrimaryButton>
      </Toolbar>

      {view === "list" ? (
        <Stack>
          {listGroups.length === 0 ? (
            <Empty>No upcoming events for this filter.</Empty>
          ) : (
            listGroups.map((group) => (
              <DayGroup key={group.dateKey}>
                <DayLabel>{group.label}</DayLabel>
                {group.events.map((event) => (
                  <EventCard
                    key={`${group.dateKey}-${event.id}`}
                    event={event}
                    dayKey={group.dateKey}
                    onOpen={setEditing}
                  />
                ))}
              </DayGroup>
            ))
          )}
        </Stack>
      ) : null}

      {view === "day" ? (
        <Stack>
          {dayEvents.length === 0 ? (
            <Empty>Nothing on this day for this filter.</Empty>
          ) : (
            dayEvents.map((event) => (
              <EventCard key={event.id} event={event} onOpen={setEditing} />
            ))
          )}
        </Stack>
      ) : null}

      {view === "week" ? (
        <CalendarWeekView
          anchorDate={selectedDate}
          todayKey={todayKey}
          events={visibleEvents}
          onOpenEvent={setEditing}
          onCreateForDay={(key) => openCreate(key)}
          onSelectDay={selectDay}
        />
      ) : null}

      {view === "month" ? (
        <CalendarMonthView
          anchorDate={selectedDate}
          todayKey={todayKey}
          events={visibleEvents}
          onOpenEvent={setEditing}
          onSelectDay={selectDay}
        />
      ) : null}

      {creating || editing ? (
        <EventEditor
          people={people}
          initial={editing}
          defaultDateKey={createDateKey ?? dateKey}
          onClose={() => {
            setCreating(false);
            setEditing(null);
            setCreateDateKey(null);
          }}
        />
      ) : null}
    </Page>
  );
}
