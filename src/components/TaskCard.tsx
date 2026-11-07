"use client";

import styled from "styled-components";
import type { TaskWithMeta } from "@/lib/tasks";

const Card = styled.button<{ $done: boolean }>`
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
  min-height: 4.5rem;
  padding: 0.85rem 0.95rem;
  border-radius: ${({ theme }) => theme.sizes.radius};
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme, $done }) =>
    $done ? "rgba(63, 111, 91, 0.14)" : theme.colors.panelStrong};
  box-shadow: ${({ theme }) => theme.shadow.soft};
  text-align: left;
  color: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const LeadingIcon = styled.span<{ $color: string }>`
  width: 2.85rem;
  height: 2.85rem;
  border-radius: 0.9rem;
  background: ${({ $color }) => $color};
  display: grid;
  place-items: center;
  font-size: 1.35rem;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(255, 250, 242, 0.18);
`;

const Copy = styled.span`
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  min-width: 0;
`;

const Name = styled.span`
  font-size: 1.15rem;
  font-weight: 750;
  line-height: 1.15;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Sub = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.92rem;
  font-weight: 600;
`;

const Trailing = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
  flex-shrink: 0;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  min-height: 2rem;
  padding: 0 0.65rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  font-weight: 750;
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
`;

type TaskCardProps = {
  task: TaskWithMeta;
  onOpen: (task: TaskWithMeta) => void;
};

export function TaskCard({ task, onOpen }: TaskCardProps) {
  const done = Boolean(task.todayLog?.completed);

  return (
    <Card type="button" $done={done} onClick={() => onOpen(task)}>
      <LeadingIcon $color={task.person.color} aria-hidden="true">
        {task.icon}
      </LeadingIcon>
      <Copy>
        <Name>{task.title}</Name>
        <Sub>
          {task.person.name}
          {done ? " · Done today" : ""}
        </Sub>
      </Copy>
      <Trailing>
        <Chip aria-label={`${task.starReward} stars`}>
          <span aria-hidden="true">⭐</span>
          {task.starReward}
        </Chip>
        <Chip aria-label={`${task.streak} day streak`}>
          <span aria-hidden="true">🔥</span>
          {task.streak}
        </Chip>
      </Trailing>
    </Card>
  );
}
