"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import type { Person } from "@/db/schema";
import type { JobWithAssignee, PersonJobStats } from "@/lib/jobs";
import type { RoutineWithProgress } from "@/lib/routines";
import { taskIconForTitle } from "@/lib/task-icons";
import { HubChrome } from "@/components/HubChrome";
import { PersonCards, filterBySelectedPeople } from "@/components/PersonCards";
import { TaskCard, type TaskCardModel } from "@/components/TaskCard";
import { TaskLogModal } from "@/components/TaskLogModal";
import { Page } from "@/components/layout";

const Section = styled.section`
  display: flex;
  flex-direction: column;
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

const BANDS = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
] as const;

type RoutinesBoardProps = {
  people: Person[];
  routines: RoutineWithProgress[];
  jobs: JobWithAssignee[];
  jobStats: Map<number, PersonJobStats>;
};

function demoStreak(seed: number) {
  return (seed % 7) + 1;
}

export function RoutinesBoard({
  people,
  routines,
  jobs,
  jobStats,
}: RoutinesBoardProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeTask, setActiveTask] = useState<TaskCardModel | null>(null);

  const filteredRoutines = useMemo(
    () =>
      filterBySelectedPeople(routines, selectedIds, (routine) => [
        routine.personId,
      ]),
    [routines, selectedIds],
  );

  const filteredJobs = useMemo(
    () =>
      filterBySelectedPeople(jobs, selectedIds, (job) =>
        job.assigneeId ? [job.assigneeId] : [],
      ),
    [jobs, selectedIds],
  );

  const routineTasksByBand = useMemo(() => {
    const map: Record<string, TaskCardModel[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    for (const routine of filteredRoutines) {
      map[routine.band]?.push({
        id: `routine-${routine.id}`,
        title: routine.title,
        icon: taskIconForTitle(routine.title),
        streak: demoStreak(routine.id + routine.personId),
        personName: routine.person.name,
        personColor: routine.person.color,
        kind: "routine",
      });
    }
    return map;
  }, [filteredRoutines]);

  const jobTasks = useMemo<TaskCardModel[]>(
    () =>
      filteredJobs.map((job) => ({
        id: `job-${job.id}`,
        title: job.title,
        icon: taskIconForTitle(job.title),
        streak: demoStreak(job.id * 3 + (job.assigneeId ?? 0)),
        personName: job.assignee?.name ?? "Unassigned",
        personColor: job.assignee?.color ?? "#3F6F5B",
        kind: "job" as const,
      })),
    [filteredJobs],
  );

  return (
    <Page>
      <HubChrome
        title="Routines"
        subtitle="Morning · Afternoon · Evening · Jobs"
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
        const items = routineTasksByBand[band.id] ?? [];
        return (
          <Section key={band.id}>
            <SectionTitle>{band.label}</SectionTitle>
            <Grid>
              {items.length === 0 ? (
                <Empty>No {band.label.toLowerCase()} routines.</Empty>
              ) : (
                items.map((task) => (
                  <TaskCard key={task.id} task={task} onOpen={setActiveTask} />
                ))
              )}
            </Grid>
          </Section>
        );
      })}

      <Section>
        <SectionTitle>Jobs</SectionTitle>
        <Grid>
          {jobTasks.length === 0 ? (
            <Empty>No jobs for the selected kids.</Empty>
          ) : (
            jobTasks.map((task) => (
              <TaskCard key={task.id} task={task} onOpen={setActiveTask} />
            ))
          )}
        </Grid>
      </Section>

      {activeTask ? (
        <TaskLogModal task={activeTask} onClose={() => setActiveTask(null)} />
      ) : null}
    </Page>
  );
}
