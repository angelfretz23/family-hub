"use client";

import styled from "styled-components";
import type { EventWithPeople } from "@/lib/events";
import {
  eventsOnDayKey,
  monthGridDayKeys,
  parseDateKey,
  weekdayShortLabels,
} from "@/lib/dates";

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

const WeekdayRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.4rem;
`;

const Weekday = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.35rem 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.4rem;
`;

const Cell = styled.div<{
  $inMonth: boolean;
  $isToday: boolean;
}>`
  min-height: 7.5rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.3rem;
  border-radius: ${({ theme }) => theme.sizes.radius};
  border: 1px solid
    ${({ theme, $isToday }) =>
      $isToday ? theme.colors.accent : theme.colors.stroke};
  background: ${({ theme, $inMonth, $isToday }) =>
    $isToday
      ? "rgba(201, 133, 45, 0.1)"
      : $inMonth
        ? theme.colors.panel
        : "rgba(255, 252, 247, 0.35)"};
  padding: 0.45rem 0.5rem 0.55rem;
  color: ${({ theme, $inMonth }) =>
    $inMonth ? theme.colors.ink : theme.colors.inkMuted};
`;

const DayButton = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  text-align: left;
  color: inherit;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.25rem;
  font-weight: 650;
  line-height: 1;
  min-height: 1.75rem;
`;

const EventStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  min-height: 0;
`;

const EventLine = styled.button<{ $color: string }>`
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  border-radius: 0.45rem;
  border-left: 0.28rem solid ${({ $color }) => $color};
  background: ${({ theme }) => theme.colors.panelStrong};
  padding: 0.28rem 0.35rem;
  font-size: 0.82rem;
  font-weight: 650;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: inherit;
  min-height: 1.7rem;
`;

const More = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.8rem;
  font-weight: 650;
  padding: 0.1rem 0.15rem;
  text-align: left;
  cursor: pointer;
`;

const MAX_VISIBLE = 3;

type CalendarMonthViewProps = {
  anchorDate: Date;
  todayKey: string;
  events: EventWithPeople[];
  onSelectDay: (dateKey: string) => void;
  onOpenEvent: (event: EventWithPeople) => void;
};

export function CalendarMonthView({
  anchorDate,
  todayKey,
  events,
  onSelectDay,
  onOpenEvent,
}: CalendarMonthViewProps) {
  const labels = weekdayShortLabels();
  const keys = monthGridDayKeys(anchorDate);
  const month = anchorDate.getMonth();

  return (
    <Shell>
      <WeekdayRow>
        {labels.map((label) => (
          <Weekday key={label}>{label}</Weekday>
        ))}
      </WeekdayRow>
      <Grid>
        {keys.map((dayKey) => {
          const day = parseDateKey(dayKey);
          const inMonth = day.getMonth() === month;
          const dayEvents = eventsOnDayKey(events, dayKey);
          const visible = dayEvents.slice(0, MAX_VISIBLE);
          const remaining = dayEvents.length - visible.length;

          return (
            <Cell
              key={dayKey}
              $inMonth={inMonth}
              $isToday={dayKey === todayKey}
            >
              <DayButton type="button" onClick={() => onSelectDay(dayKey)}>
                {day.getDate()}
              </DayButton>
              <EventStack>
                {visible.map((event) => (
                  <EventLine
                    key={event.id}
                    type="button"
                    $color={event.people[0]?.color ?? "#3F6F5B"}
                    onClick={() => onOpenEvent(event)}
                  >
                    {event.title}
                  </EventLine>
                ))}
                {remaining > 0 ? (
                  <More type="button" onClick={() => onSelectDay(dayKey)}>
                    +{remaining} more
                  </More>
                ) : null}
              </EventStack>
            </Cell>
          );
        })}
      </Grid>
    </Shell>
  );
}
