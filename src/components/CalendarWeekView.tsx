"use client";

import styled from "styled-components";
import type { EventWithPeople } from "@/lib/events";
import {
  eventsOnDayKey,
  formatDayHeading,
  formatTime,
  parseDateKey,
  parseLocalIso,
  weekDayKeys,
} from "@/lib/dates";
import {
  AVATAR_STACK_SLOT,
  PersonAvatarStack,
} from "@/components/PersonAvatarStack";

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const DayRow = styled.section<{ $isToday?: boolean }>`
  display: grid;
  grid-template-columns: minmax(9.5rem, 12rem) 1fr auto;
  gap: 0.85rem;
  align-items: start;
  border-radius: ${({ theme }) => theme.sizes.radius};
  border: 1px solid
    ${({ theme, $isToday }) =>
      $isToday ? theme.colors.accent : theme.colors.stroke};
  background: ${({ theme, $isToday }) =>
    $isToday ? "rgba(201, 133, 45, 0.08)" : theme.colors.panel};
  padding: 0.85rem 1rem;
  box-shadow: ${({ theme }) => theme.shadow.soft};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const DayHead = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  border: 0;
  background: transparent;
  padding: 0.15rem 0;
  cursor: pointer;
  text-align: left;
  color: inherit;
  min-height: ${({ theme }) => theme.sizes.touch};
`;

const Weekday = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const DayTitle = styled.span`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.45rem;
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.1;
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 0;
`;

const EventChip = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: ${AVATAR_STACK_SLOT} 1fr;
  gap: 0.75rem;
  align-items: center;
  text-align: left;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  border-radius: 0.9rem;
  background: ${({ theme }) => theme.colors.panelStrong};
  padding: 0.7rem 0.85rem;
  cursor: pointer;
  min-height: 3.4rem;
  color: inherit;
`;

const EventBody = styled.span`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
`;

const EventTitle = styled.span`
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.2;
`;

const EventMeta = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.98rem;
`;

const Empty = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.05rem;
  padding: 0.45rem 0;
`;

const AddDay = styled.button`
  min-height: ${({ theme }) => theme.sizes.touch};
  min-width: 5.5rem;
  border-radius: 999px;
  border: 1px dashed ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panelStrong};
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  justify-self: end;

  @media (max-width: 900px) {
    justify-self: stretch;
  }
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
  const keys = weekDayKeys(anchorDate);

  return (
    <Shell>
      {keys.map((dayKey) => {
        const dayEvents = eventsOnDayKey(events, dayKey);
        const heading = formatDayHeading(parseDateKey(dayKey));

        return (
          <DayRow key={dayKey} $isToday={dayKey === todayKey}>
            <DayHead type="button" onClick={() => onSelectDay(dayKey)}>
              <Weekday>{heading.split(",")[0]}</Weekday>
              <DayTitle>{heading.split(", ")[1] ?? heading}</DayTitle>
            </DayHead>

            <EventList>
              {dayEvents.length === 0 ? (
                <Empty>No events</Empty>
              ) : (
                dayEvents.map((event) => (
                  <EventChip
                    key={event.id}
                    type="button"
                    onClick={() => onOpenEvent(event)}
                  >
                    <PersonAvatarStack people={event.people} size={2.15} slot />
                    <EventBody>
                      <EventTitle>{event.title}</EventTitle>
                      <EventMeta>{chipLabel(event)}</EventMeta>
                    </EventBody>
                  </EventChip>
                ))
              )}
            </EventList>

            <AddDay type="button" onClick={() => onCreateForDay(dayKey)}>
              + Add
            </AddDay>
          </DayRow>
        );
      })}
    </Shell>
  );
}
