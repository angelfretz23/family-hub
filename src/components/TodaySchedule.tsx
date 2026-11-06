"use client";

import { useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import type { Person } from "@/db/schema";
import type { EventWithPeople } from "@/lib/events";
import { EventCard } from "@/components/EventCard";
import { EventEditor } from "@/components/EventEditor";

const Panel = styled.section`
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  border-radius: ${({ theme }) => theme.sizes.radius};
  padding: 1.35rem 1.5rem;
  box-shadow: ${({ theme }) => theme.shadow.soft};
  backdrop-filter: blur(10px);
  min-height: 10rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const Heading = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.75rem;
  letter-spacing: -0.02em;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SmallButton = styled.button`
  min-height: 2.75rem;
  padding: 0 0.9rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panelStrong};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 1rem;
  font-weight: 650;
  cursor: pointer;
`;

const CalendarLink = styled(Link)`
  min-height: 2.75rem;
  display: inline-flex;
  align-items: center;
  padding: 0 0.9rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panelStrong};
  font-size: 1rem;
  font-weight: 650;
`;

const Empty = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.15rem;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

type TodayScheduleProps = {
  people: Person[];
  events: EventWithPeople[];
  dateKey: string;
};

export function TodaySchedule({ people, events, dateKey }: TodayScheduleProps) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EventWithPeople | null>(null);

  return (
    <Panel>
      <Header>
        <Heading>Schedule</Heading>
        <Actions>
          <SmallButton type="button" onClick={() => setCreating(true)}>
            Add
          </SmallButton>
          <CalendarLink href="/calendar?view=day">Open</CalendarLink>
        </Actions>
      </Header>

      {events.length === 0 ? (
        <Empty>Nothing on the calendar for today.</Empty>
      ) : (
        <Stack>
          {events.map((event) => (
            <EventCard key={event.id} event={event} onOpen={setEditing} />
          ))}
        </Stack>
      )}

      {creating || editing ? (
        <EventEditor
          people={people}
          initial={editing}
          defaultDateKey={dateKey}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      ) : null}
    </Panel>
  );
}
