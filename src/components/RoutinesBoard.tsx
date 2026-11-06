"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import type { Person } from "@/db/schema";
import type { JobWithAssignee, PersonJobStats } from "@/lib/jobs";
import type { RoutineWithProgress } from "@/lib/routines";
import { HubChrome } from "@/components/HubChrome";
import { PersonCards, filterBySelectedPeople } from "@/components/PersonCards";
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

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

const Item = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.85rem;
  align-items: center;
  min-height: 4rem;
  padding: 0.85rem 1rem;
  border-radius: ${({ theme }) => theme.sizes.radius};
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panelStrong};
`;

const Swatch = styled.span<{ $color: string }>`
  width: 0.7rem;
  align-self: stretch;
  border-radius: 999px;
  background: ${({ $color }) => $color};
`;

const Title = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
`;

const Meta = styled.div`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1rem;
  margin-top: 0.15rem;
`;

const Badge = styled.span`
  min-height: 2.5rem;
  display: inline-flex;
  align-items: center;
  padding: 0 0.85rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  font-weight: 700;
  font-size: 0.95rem;
`;

const Empty = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.1rem;
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

export function RoutinesBoard({
  people,
  routines,
  jobs,
  jobStats,
}: RoutinesBoardProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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

  return (
    <Page>
      <HubChrome
        title="Routines"
        subtitle="Morning · Afternoon · Evening · Jobs (all day)"
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
        const items = filteredRoutines.filter(
          (routine) => routine.band === band.id,
        );
        return (
          <Section key={band.id}>
            <SectionTitle>{band.label}</SectionTitle>
            <Stack>
              {items.length === 0 ? (
                <Empty>No {band.label.toLowerCase()} routines.</Empty>
              ) : (
                items.map((routine) => (
                  <Item key={routine.id}>
                    <Swatch $color={routine.person.color} />
                    <div>
                      <Title>{routine.title}</Title>
                      <Meta>
                        {routine.person.name} · {routine.checkedStepIds.length}/
                        {routine.steps.length} steps
                      </Meta>
                    </div>
                    <Badge>
                      {routine.completed ? "Done" : "In progress"}
                    </Badge>
                  </Item>
                ))
              )}
            </Stack>
          </Section>
        );
      })}

      <Section>
        <SectionTitle>Jobs · All day</SectionTitle>
        <Stack>
          {filteredJobs.length === 0 ? (
            <Empty>No jobs for the selected people.</Empty>
          ) : (
            filteredJobs.map((job) => (
              <Item key={job.id}>
                <Swatch $color={job.assignee?.color ?? "#3F6F5B"} />
                <div>
                  <Title>{job.title}</Title>
                  <Meta>
                    {job.assignee?.name ?? "Unassigned"} ·{" "}
                    {job.status === "done" ? "Done" : "Open"}
                  </Meta>
                </div>
                <Badge>{job.status === "done" ? "✓" : "○"}</Badge>
              </Item>
            ))
          )}
        </Stack>
      </Section>
    </Page>
  );
}
