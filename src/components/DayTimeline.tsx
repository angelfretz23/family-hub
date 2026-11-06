"use client";

import { useMemo } from "react";
import styled from "styled-components";
import type { Person } from "@/db/schema";
import type { EventWithPeople } from "@/lib/events";
import {
  floorToQuarterHour,
  formatTime,
  householdMinutesSinceMidnight,
  minutesFromLocalIso,
  parseLocalIso,
} from "@/lib/dates";

const PIXELS_PER_MINUTE = 1.35;
const DEFAULT_DAY_START = 6 * 60; // 6:00 AM
const DEFAULT_DAY_END = 22 * 60; // 10:00 PM
const MIN_EVENT_HEIGHT = 2.4; // rem-ish via px floor

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-height: 0;
  width: 100%;
`;

const HeaderRow = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: 3.75rem repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  gap: 0.45rem;
  align-items: end;
`;

const HeaderSpacer = styled.div``;

const PersonHead = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
`;

const Avatar = styled.div<{ $color: string }>`
  width: 3.35rem;
  height: 3.35rem;
  border-radius: 999px;
  background: ${({ $color }) => $color};
  color: #fffaf2;
  display: grid;
  place-items: center;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.15rem;
  font-weight: 700;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.colors.stroke};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PersonName = styled.span`
  font-size: 0.92rem;
  font-weight: 700;
  text-align: center;
  line-height: 1.15;
  color: ${({ theme }) => theme.colors.ink};
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AllDayRow = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: 3.75rem repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  gap: 0.45rem;
  align-items: start;
`;

const AllDayLabel = styled.div`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.85rem;
  font-weight: 700;
  padding-top: 0.35rem;
`;

const AllDayStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
`;

const AllDayChip = styled.button<{ $color: string }>`
  border: 0;
  border-left: 0.28rem solid ${({ $color }) => $color};
  border-radius: 0.55rem;
  background: ${({ theme }) => theme.colors.panelStrong};
  padding: 0.4rem 0.5rem;
  text-align: left;
  font-size: 0.88rem;
  font-weight: 700;
  color: inherit;
  cursor: pointer;
  min-height: 2.2rem;
`;

const Body = styled.div<{ $nestedScroll: boolean }>`
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  border-radius: ${({ theme }) => theme.sizes.radius};
  background: ${({ theme }) => theme.colors.panel};
  ${({ $nestedScroll }) =>
    $nestedScroll
      ? `
    overflow: auto;
    overscroll-behavior: auto;
    max-height: min(70dvh, 48rem);
  `
      : `
    overflow: visible;
    max-height: none;
  `}
`;

const Grid = styled.div<{ $columns: number; $height: number }>`
  position: relative;
  display: grid;
  grid-template-columns: 3.75rem repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  min-height: ${({ $height }) => $height}px;
  height: ${({ $height }) => $height}px;
`;

const Gutter = styled.div`
  position: relative;
  border-right: 1px solid ${({ theme }) => theme.colors.stroke};
  background: rgba(255, 252, 247, 0.45);
`;

const TimeLabel = styled.div<{ $top: number }>`
  position: absolute;
  top: ${({ $top }) => $top}px;
  right: 0.35rem;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.78rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

const Column = styled.div`
  position: relative;
  border-right: 1px solid ${({ theme }) => theme.colors.stroke};

  &:last-child {
    border-right: 0;
  }
`;

const HourLine = styled.div<{ $top: number }>`
  position: absolute;
  left: 0;
  right: 0;
  top: ${({ $top }) => $top}px;
  border-top: 1px solid ${({ theme }) => theme.colors.stroke};
  pointer-events: none;
`;

const NowLine = styled.div<{ $top: number }>`
  position: absolute;
  left: 3.75rem;
  right: 0;
  top: ${({ $top }) => $top}px;
  border-top: 2px solid ${({ theme }) => theme.colors.accent};
  z-index: 3;
  pointer-events: none;

  &::before {
    content: "";
    position: absolute;
    left: -0.28rem;
    top: -0.28rem;
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.accent};
  }
`;

const EventBlock = styled.button<{
  $top: number;
  $height: number;
  $color: string;
}>`
  position: absolute;
  left: 0.28rem;
  right: 0.28rem;
  top: ${({ $top }) => $top}px;
  height: ${({ $height }) => $height}px;
  min-height: ${MIN_EVENT_HEIGHT}rem;
  z-index: 2;
  overflow: hidden;
  border: 0;
  border-radius: 0.7rem;
  border-left: 0.32rem solid ${({ $color }) => $color};
  background: ${({ theme }) => theme.colors.panelStrong};
  box-shadow: 0 8px 22px rgba(28, 42, 36, 0.08);
  padding: 0.35rem 0.45rem;
  text-align: left;
  color: inherit;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`;

const EventTitle = styled.span`
  font-size: 0.92rem;
  font-weight: 750;
  line-height: 1.15;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const EventMeta = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.78rem;
  font-weight: 650;
`;

const Empty = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.1rem;
`;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatHourLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const date = new Date(2000, 0, 1, hours, mins);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: mins === 0 ? undefined : "2-digit",
  }).format(date);
}

type ColumnPerson = Person | { id: "shared"; name: string; color: string; avatarUrl?: null };

type DayTimelineProps = {
  people: Person[];
  events: EventWithPeople[];
  /** When true, hide past time before the latest 15-min mark. */
  clipPastToNow?: boolean;
  /**
   * When false (Today), the timeline grows with the page so wheel/touch
   * scrolls the outer Today view. When true (Calendar Day), it scrolls inside.
   */
  nestedScroll?: boolean;
  onOpenEvent: (event: EventWithPeople) => void;
};

export function DayTimeline({
  people,
  events,
  clipPastToNow = false,
  nestedScroll = false,
  onOpenEvent,
}: DayTimelineProps) {
  const nowMinutes = householdMinutesSinceMidnight();
  const rangeStart = clipPastToNow
    ? floorToQuarterHour(nowMinutes)
    : DEFAULT_DAY_START;

  const timedEvents = useMemo(
    () => events.filter((event) => !event.allDay),
    [events],
  );
  const allDayEvents = useMemo(
    () => events.filter((event) => event.allDay),
    [events],
  );

  const hasUnassigned = events.some((event) => event.people.length === 0);
  const columns: ColumnPerson[] = useMemo(() => {
    const list: ColumnPerson[] = [...people];
    if (hasUnassigned) {
      list.unshift({
        id: "shared",
        name: "Family",
        color: "#3F6F5B",
        avatarUrl: null,
      });
    }
    return list;
  }, [people, hasUnassigned]);

  const rangeEnd = useMemo(() => {
    let end = DEFAULT_DAY_END;
    for (const event of timedEvents) {
      const endMinutes = minutesFromLocalIso(event.endsAt);
      if (endMinutes > end) end = Math.min(24 * 60, endMinutes + 30);
    }
    if (clipPastToNow) {
      end = Math.max(end, Math.min(24 * 60, nowMinutes + 60));
    }
    return Math.max(end, rangeStart + 60);
  }, [timedEvents, clipPastToNow, nowMinutes, rangeStart]);

  const height = Math.max(120, (rangeEnd - rangeStart) * PIXELS_PER_MINUTE);

  const hourMarks = useMemo(() => {
    const marks: number[] = [];
    const firstHour = Math.ceil(rangeStart / 60) * 60;
    for (let minute = firstHour; minute <= rangeEnd; minute += 60) {
      marks.push(minute);
    }
    if (marks[0] !== rangeStart) marks.unshift(rangeStart);
    return marks;
  }, [rangeStart, rangeEnd]);

  function eventsForColumn(column: ColumnPerson) {
    if (column.id === "shared") {
      return events.filter((event) => event.people.length === 0);
    }
    return events.filter((event) =>
      event.people.some((person) => person.id === column.id),
    );
  }

  function layoutTimed(event: EventWithPeople) {
    const start = Math.max(rangeStart, minutesFromLocalIso(event.startsAt));
    const end = Math.max(start + 15, minutesFromLocalIso(event.endsAt));
    if (end <= rangeStart || start >= rangeEnd) return null;
    const top = (start - rangeStart) * PIXELS_PER_MINUTE;
    const blockHeight = Math.max(
      MIN_EVENT_HEIGHT * 16,
      (Math.min(end, rangeEnd) - start) * PIXELS_PER_MINUTE,
    );
    return { top, height: blockHeight };
  }

  const showNow =
    clipPastToNow && nowMinutes >= rangeStart && nowMinutes <= rangeEnd;
  const nowTop = (nowMinutes - rangeStart) * PIXELS_PER_MINUTE;

  const hasVisibleTimed = timedEvents.some((event) => {
    const end = minutesFromLocalIso(event.endsAt);
    return end > rangeStart;
  });

  if (events.length === 0) {
    return <Empty>Nothing on the calendar for this day.</Empty>;
  }

  if (clipPastToNow && !hasVisibleTimed && allDayEvents.length === 0) {
    return <Empty>No upcoming events left today.</Empty>;
  }

  return (
    <Shell>
      <HeaderRow $columns={columns.length}>
        <HeaderSpacer />
        {columns.map((person) => (
          <PersonHead key={String(person.id)}>
            <Avatar $color={person.color}>
              {"avatarUrl" in person && person.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={person.avatarUrl} alt="" />
              ) : (
                initials(person.name)
              )}
            </Avatar>
            <PersonName>{person.name}</PersonName>
          </PersonHead>
        ))}
      </HeaderRow>

      {allDayEvents.length > 0 ? (
        <AllDayRow $columns={columns.length}>
          <AllDayLabel>All day</AllDayLabel>
          {columns.map((column) => {
            const items = eventsForColumn(column).filter((event) => event.allDay);
            return (
              <AllDayStack key={`allday-${String(column.id)}`}>
                {items.map((event) => (
                  <AllDayChip
                    key={event.id}
                    type="button"
                    $color={
                      event.people[0]?.color ??
                      (column.id === "shared" ? column.color : "#3F6F5B")
                    }
                    onClick={() => onOpenEvent(event)}
                  >
                    {event.title}
                  </AllDayChip>
                ))}
              </AllDayStack>
            );
          })}
        </AllDayRow>
      ) : null}

      {hasVisibleTimed || !clipPastToNow ? (
        <Body $nestedScroll={nestedScroll}>
          <Grid $columns={columns.length} $height={height}>
            <Gutter>
              {hourMarks.map((minute) => (
                <TimeLabel
                  key={minute}
                  $top={(minute - rangeStart) * PIXELS_PER_MINUTE}
                >
                  {formatHourLabel(minute)}
                </TimeLabel>
              ))}
            </Gutter>

            {columns.map((column) => (
              <Column key={`col-${String(column.id)}`}>
                {hourMarks.map((minute) => (
                  <HourLine
                    key={`${String(column.id)}-${minute}`}
                    $top={(minute - rangeStart) * PIXELS_PER_MINUTE}
                  />
                ))}

                {eventsForColumn(column)
                  .filter((event) => !event.allDay)
                  .map((event) => {
                    const layout = layoutTimed(event);
                    if (!layout) return null;
                    const color =
                      event.people[0]?.color ??
                      (typeof column.color === "string"
                        ? column.color
                        : "#3F6F5B");
                    return (
                      <EventBlock
                        key={event.id}
                        type="button"
                        $top={layout.top}
                        $height={layout.height}
                        $color={color}
                        onClick={() => onOpenEvent(event)}
                        title={event.title}
                      >
                        <EventTitle>{event.title}</EventTitle>
                        <EventMeta>
                          {formatTime(parseLocalIso(event.startsAt))} –{" "}
                          {formatTime(parseLocalIso(event.endsAt))}
                        </EventMeta>
                      </EventBlock>
                    );
                  })}
              </Column>
            ))}

            {showNow ? <NowLine $top={nowTop} /> : null}
          </Grid>
        </Body>
      ) : null}
    </Shell>
  );
}
