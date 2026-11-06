"use client";

import styled from "styled-components";
import type { EventWithPeople } from "@/lib/events";
import {
  formatCompactRange,
  formatTime,
  parseLocalIso,
} from "@/lib/dates";
import { PersonAvatarStack } from "@/components/PersonAvatarStack";

const Card = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.9rem;
  align-items: center;
  text-align: left;
  min-height: 4.25rem;
  padding: 0.9rem 1rem;
  border-radius: ${({ theme }) => theme.sizes.radius};
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panelStrong};
  cursor: pointer;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
`;

const Title = styled.span`
  font-size: 1.35rem;
  font-weight: 650;
  letter-spacing: -0.01em;
`;

const Meta = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.05rem;
`;

type EventCardProps = {
  event: EventWithPeople;
  onOpen: (event: EventWithPeople) => void;
  /** When set (List view), meta reflects where this day sits in a multi-day span. */
  dayKey?: string;
};

function metaForDay(event: EventWithPeople, dayKey?: string) {
  if (!dayKey) {
    return formatCompactRange(event.startsAt, event.endsAt, event.allDay);
  }

  const startKey = event.startsAt.slice(0, 10);
  const endKey = event.endsAt.slice(0, 10);
  const multiDay = startKey !== endKey;

  if (event.allDay) {
    if (!multiDay) return "All day";
    if (dayKey === startKey) return "All day · starts";
    if (dayKey === endKey) return "All day · ends";
    return "All day · continues";
  }

  if (!multiDay) {
    return formatCompactRange(event.startsAt, event.endsAt, false);
  }

  const start = parseLocalIso(event.startsAt);
  const end = parseLocalIso(event.endsAt);
  if (dayKey === startKey) return `From ${formatTime(start)}`;
  if (dayKey === endKey) return `Until ${formatTime(end)}`;
  return "Continues all day";
}

export function EventCard({ event, onOpen, dayKey }: EventCardProps) {
  return (
    <Card type="button" onClick={() => onOpen(event)}>
      <PersonAvatarStack people={event.people} size={2.55} />
      <Body>
        <Title>{event.title}</Title>
        <Meta>{metaForDay(event, dayKey)}</Meta>
      </Body>
    </Card>
  );
}
