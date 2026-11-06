"use client";

import styled from "styled-components";
import type { EventWithPeople } from "@/lib/events";
import {
  eventsOnDayKey,
  formatTime,
  parseDateKey,
  parseLocalIso,
  weekdayShortLabels,
  weekDayKeys,
} from "@/lib/dates";

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-height: 28rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.45rem;
  min-height: 26rem;
`;

const Column = styled.div<{ $isToday?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-height: 26rem;
  border-radius: ${({ theme }) => theme.sizes.radius};
  border: 1px solid
    ${({ theme, $isToday }) =>
      $isToday ? theme.colors.accent : theme.colors.stroke};
  background: ${({ theme, $isToday }) =>
    $isToday ? "rgba(201, 133, 45, 0.08)" : theme.colors.panel};
  padding: 0.55rem;
`;

const DayHead = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0.2rem 0.25rem 0.45rem;
  cursor: pointer;
  text-align: left;
  color: inherit;
`;

const Weekday = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.95rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const DayNumber = styled.span`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.55rem;
  font-weight: 650;
  line-height: 1;
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  min-height: 0;
`;

const EventChip = styled.button<{ $color: string }>`
  width: 100%;
  text-align: left;
  border: 0;
  border-left: 0.35rem solid ${({ $color }) => $color};
  border-radius: 0.7rem;
  background: ${({ theme }) => theme.colors.panelStrong};
  padding: 0.45rem 0.5rem;
  cursor: pointer;
  min-height: 3.1rem;
`;

const EventTitle = styled.span`
  display: block;
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.2;
`;

const EventMeta = styled.span`
  display: block;
  margin-top: 0.15rem;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.85rem;
`;

const AddDay = styled.button`
  margin-top: auto;
  min-height: 2.75rem;
  border-radius: 0.8rem;
  border: 1px dashed ${({ theme }) => theme.colors.stroke};
  background: transparent;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1rem;
  font-weight: 650;
  cursor: pointer;
`;

type CalendarWeekViewProps = {
  anchorDate: Date;
  todayKey: string;
  events: EventWithPeople[];
  onOpenEvent: (event: EventWithPeople) => void;
  onCreateForDay: (dateKey: string) => void;
  onSelectDay: (dateKey: string) => void;
};

function chipLabel(event: EventWithPeople) {
  if (event.allDay) return "All day";
  return formatTime(parseLocalIso(event.startsAt));
}

export function CalendarWeekView({
  anchorDate,
  todayKey,
  events,
  onOpenEvent,
  onCreateForDay,
  onSelectDay,
}: CalendarWeekViewProps) {
  const labels = weekdayShortLabels();
  const keys = weekDayKeys(anchorDate);

  return (
    <Shell>
      <Grid>
        {keys.map((dayKey, index) => {
          const dayEvents = eventsOnDayKey(events, dayKey);
          const day = parseDateKey(dayKey);
          return (
            <Column key={dayKey} $isToday={dayKey === todayKey}>
              <DayHead type="button" onClick={() => onSelectDay(dayKey)}>
                <Weekday>{labels[index]}</Weekday>
                <DayNumber>{day.getDate()}</DayNumber>
              </DayHead>
              <EventList>
                {dayEvents.map((event) => (
                  <EventChip
                    key={event.id}
                    type="button"
                    $color={event.people[0]?.color ?? "#3F6F5B"}
                    onClick={() => onOpenEvent(event)}
                  >
                    <EventTitle>{event.title}</EventTitle>
                    <EventMeta>{chipLabel(event)}</EventMeta>
                  </EventChip>
                ))}
              </EventList>
              <AddDay type="button" onClick={() => onCreateForDay(dayKey)}>
                + Add
              </AddDay>
            </Column>
          );
        })}
      </Grid>
    </Shell>
  );
}
