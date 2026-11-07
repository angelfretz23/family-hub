"use client";

import styled from "styled-components";
import type { TaskWithMeta } from "@/lib/tasks";

const Card = styled.button<{ $done: boolean; $logged: boolean; $color: string }>`
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
  min-height: 4.5rem;
  padding: 0.85rem 0.95rem;
  border-radius: ${({ theme }) => theme.sizes.radius};
  border: 2px solid
    ${({ $logged, $color, theme }) =>
      $logged ? $color : theme.colors.stroke};
  background: ${({ $logged, $done, $color, theme }) => {
    if ($done) return `${$color}33`;
    if ($logged) return `${$color}18`;
    return theme.colors.panelStrong;
  }};
  box-shadow: ${({ theme }) => theme.shadow.soft};
  text-align: left;
  color: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const LeadingIcon = styled.span<{ $color: string; $logged: boolean }>`
  width: 3.75rem;
  height: 3.75rem;
  border-radius: 1.05rem;
  background: ${({ $logged, $color, theme }) =>
    $logged ? $color : theme.colors.panel};
  display: grid;
  place-items: center;
  font-size: 2rem;
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
  const logged = task.loggedForPerson;

  return (
    <Card
      type="button"
      $done={done}
      $logged={logged}
      $color={task.person.color}
      onClick={() => onOpen(task)}
    >
      <LeadingIcon
        $color={task.person.color}
        $logged={logged}
        aria-hidden="true"
      >
        {task.icon}
      </LeadingIcon>
      <Copy>
        <Name>{task.title}</Name>
        <Sub>
          {logged
            ? done
              ? `${task.person.name} · Done today`
              : `${task.person.name} · Logged`
            : `Tap to log for ${task.person.name}`}
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
