"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import type { Person } from "@/db/schema";
import type { PersonJobStats } from "@/lib/jobs";
import type { TaskWithMeta } from "@/lib/tasks";
import { HubChrome } from "@/components/HubChrome";
import { PersonCards, filterBySelectedPeople } from "@/components/PersonCards";
import { TaskCard } from "@/components/TaskCard";
import { TaskEditorModal } from "@/components/TaskEditorModal";
import { TaskLogModal } from "@/components/TaskLogModal";
import { Page } from "@/components/layout";

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.7rem;
  letter-spacing: -0.02em;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Empty = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.1rem;
  grid-column: 1 / -1;
`;

const AddButton = styled.button`
  min-height: 3rem;
  padding: 0 1.1rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panelStrong};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
`;

const BANDS = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
  { id: "job", label: "Jobs" },
] as const;

type RoutinesBoardProps = {
  people: Person[];
  tasks: TaskWithMeta[];
  jobStats: Map<number, PersonJobStats>;
};

export function RoutinesBoard({ people, tasks, jobStats }: RoutinesBoardProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeTask, setActiveTask] = useState<TaskWithMeta | null>(null);
  const [adding, setAdding] = useState(false);

  const filteredTasks = useMemo(
    () =>
      filterBySelectedPeople(tasks, selectedIds, (task) => [task.personId]),
    [tasks, selectedIds],
  );

  const defaultPersonId =
    selectedIds.length === 1 ? selectedIds[0] : people[0]?.id ?? null;

  return (
    <Page>
      <HubChrome
        title="Routines"
        subtitle="Morning · Afternoon · Evening · Jobs"
        trailing={
          <AddButton type="button" onClick={() => setAdding(true)}>
            Add task
          </AddButton>
        }
      />

      <PersonCards
        people={people}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
        jobStats={jobStats}
        showJobStats
        selectable
      />

      {BANDS.map((band) => {
        const items = filteredTasks.filter((task) => task.band === band.id);
        return (
          <Section key={band.id}>
            <SectionHeader>
              <SectionTitle>{band.label}</SectionTitle>
            </SectionHeader>
            <Grid>
              {items.length === 0 ? (
                <Empty>No {band.label.toLowerCase()} tasks yet.</Empty>
              ) : (
                items.map((task) => (
                  <TaskCard key={task.id} task={task} onOpen={setActiveTask} />
                ))
              )}
            </Grid>
          </Section>
        );
      })}

      {activeTask ? (
        <TaskLogModal task={activeTask} onClose={() => setActiveTask(null)} />
      ) : null}

      {adding ? (
        <TaskEditorModal
          kids={people}
          defaultPersonId={defaultPersonId}
          onClose={() => setAdding(false)}
        />
      ) : null}
    </Page>
  );
}
