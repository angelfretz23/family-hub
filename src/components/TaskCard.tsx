"use client";

import styled from "styled-components";

const Card = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
  min-height: 4.5rem;
  padding: 0.85rem 0.95rem;
  border-radius: ${({ theme }) => theme.sizes.radius};
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panelStrong};
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

const Streak = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  min-height: 2.35rem;
  padding: 0 0.7rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  font-weight: 750;
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
`;

const Fire = styled.span`
  font-size: 1.05rem;
  line-height: 1;
`;

export type TaskCardModel = {
  id: string;
  title: string;
  icon: string;
  streak: number;
  personName: string;
  personColor: string;
  kind: "routine" | "job";
};

type TaskCardProps = {
  task: TaskCardModel;
  onOpen: (task: TaskCardModel) => void;
};

export function TaskCard({ task, onOpen }: TaskCardProps) {
  return (
    <Card type="button" onClick={() => onOpen(task)}>
      <LeadingIcon $color={task.personColor} aria-hidden="true">
        {task.icon}
      </LeadingIcon>
      <Copy>
        <Name>{task.title}</Name>
        <Sub>{task.personName}</Sub>
      </Copy>
      <Streak aria-label={`${task.streak} day streak`}>
        <Fire aria-hidden="true">🔥</Fire>
        {task.streak}
      </Streak>
    </Card>
  );
}
