"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import type { Person } from "@/db/schema";
import type { PersonStarStats, TaskWithMeta } from "@/lib/tasks";
import { HubChrome } from "@/components/HubChrome";
import { PersonCards } from "@/components/PersonCards";
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

const Prompt = styled.div`
  padding: 1.25rem 1.35rem;
  border-radius: ${({ theme }) => theme.sizes.radius};
  border: 1px dashed ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panel};
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.2rem;
  font-weight: 650;
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
  /** All kids' personalized task lists keyed by person id. */
  tasksByPerson: Record<number, TaskWithMeta[]>;
  starStats: Map<number, PersonStarStats>;
};

export function RoutinesBoard({
  people,
  tasksByPerson,
  starStats,
}: RoutinesBoardProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(
    people[0] ? [people[0].id] : [],
  );
  const [activeTask, setActiveTask] = useState<TaskWithMeta | null>(null);
  const [adding, setAdding] = useState(false);

  const selectedId = selectedIds[0] ?? null;
  const selectedPerson = people.find((person) => person.id === selectedId) ?? null;

  const tasks = useMemo(
    () => (selectedId ? tasksByPerson[selectedId] ?? [] : []),
    [selectedId, tasksByPerson],
  );

  return (
    <Page>
      <HubChrome
        title="Routines"
        subtitle="Select a kid, then tap a task to log it under them"
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
        starStats={starStats}
        showStarStats
        showJobStats
        jobStats={
          new Map(
            [...starStats.entries()].map(([id, stat]) => [
              id,
              {
                personId: id,
                completed: stat.jobsCompleted,
                total: stat.jobsTotal,
              },
            ]),
          )
        }
        selectable
        selectionMode="single"
      />

      {!selectedPerson ? (
        <Prompt>Select a kid above to view and log routines.</Prompt>
      ) : (
        BANDS.map((band) => {
          const items = tasks.filter((task) => task.band === band.id);
          return (
            <Section key={band.id}>
              <SectionHeader>
                <SectionTitle>
                  {band.label}
                  <span style={{ opacity: 0.55, fontSize: "1.1rem" }}>
                    {" "}
                    · {selectedPerson.name}
                  </span>
                </SectionTitle>
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
        })
      )}

      {activeTask ? (
        <TaskLogModal task={activeTask} onClose={() => setActiveTask(null)} />
      ) : null}

      {adding ? (
        <TaskEditorModal onClose={() => setAdding(false)} />
      ) : null}
    </Page>
  );
}
