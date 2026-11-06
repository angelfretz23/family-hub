"use client";

import styled from "styled-components";
import type { EventWithPeople } from "@/lib/events";
import { formatCompactRange } from "@/lib/dates";

const Card = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: 0.7rem 1fr;
  gap: 0.9rem;
  align-items: start;
  text-align: left;
  min-height: 4.25rem;
  padding: 0.9rem 1rem;
  border-radius: ${({ theme }) => theme.sizes.radius};
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panelStrong};
  cursor: pointer;
`;

const ColorBar = styled.span<{ $color: string }>`
  display: block;
  width: 0.7rem;
  min-height: 2.75rem;
  border-radius: 999px;
  background: ${({ $color }) => $color};
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

const PeopleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.2rem;
`;

const PersonChip = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  min-height: 1.75rem;
  padding: 0 0.65rem;
  border-radius: 999px;
  background: ${({ $color }) => $color}22;
  color: ${({ theme }) => theme.colors.ink};
  font-size: 0.95rem;
  font-weight: 600;
`;

type EventCardProps = {
  event: EventWithPeople;
  onOpen: (event: EventWithPeople) => void;
};

export function EventCard({ event, onOpen }: EventCardProps) {
  const color = event.people[0]?.color ?? "#3F6F5B";

  return (
    <Card type="button" onClick={() => onOpen(event)}>
      <ColorBar $color={color} />
      <Body>
        <Title>{event.title}</Title>
        <Meta>{formatCompactRange(event.startsAt, event.endsAt, event.allDay)}</Meta>
        {event.people.length > 0 ? (
          <PeopleRow>
            {event.people.map((person) => (
              <PersonChip key={person.id} $color={person.color}>
                {person.name}
              </PersonChip>
            ))}
          </PeopleRow>
        ) : null}
      </Body>
    </Card>
  );
}
