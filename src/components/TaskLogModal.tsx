"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import type { TaskCardModel } from "@/components/TaskCard";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(20, 36, 30, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(1rem, env(safe-area-inset-top))
    max(1rem, env(safe-area-inset-right))
    max(1rem, env(safe-area-inset-bottom))
    max(1rem, env(safe-area-inset-left));
  overflow: auto;
`;

const Dialog = styled.div`
  width: min(32rem, 100%);
  max-height: min(90dvh, 40rem);
  overflow: auto;
  margin: auto;
  background: ${({ theme }) => theme.colors.cream};
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadow.soft};
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
`;

const TitleBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
`;

const Icon = styled.span<{ $color: string }>`
  width: 3rem;
  height: 3rem;
  border-radius: 0.9rem;
  background: ${({ $color }) => $color};
  display: grid;
  place-items: center;
  font-size: 1.45rem;
  flex-shrink: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.7rem;
  letter-spacing: -0.02em;
  line-height: 1.1;
`;

const Subtitle = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.05rem;
`;

const Close = styled.button`
  min-height: 2.75rem;
  padding: 0 1rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panelStrong};
  font-weight: 700;
  cursor: pointer;
`;

const Body = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.15rem;
  line-height: 1.45;
`;

type TaskLogModalProps = {
  task: TaskCardModel;
  onClose: () => void;
};

export function TaskLogModal({ task, onClose }: TaskLogModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <Overlay role="presentation" onClick={onClose}>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-log-title"
        onClick={(event) => event.stopPropagation()}
      >
        <Header>
          <TitleBlock>
            <Icon $color={task.personColor} aria-hidden="true">
              {task.icon}
            </Icon>
            <div>
              <Title id="task-log-title">{task.title}</Title>
              <Subtitle>
                {task.personName} · 🔥 {task.streak} day streak
              </Subtitle>
            </div>
          </TitleBlock>
          <Close type="button" onClick={onClose}>
            Close
          </Close>
        </Header>
        <Body>
          Logging details for this {task.kind} will go here next — notes,
          completion, and any extra check-ins.
        </Body>
      </Dialog>
    </Overlay>,
    document.body,
  );
}
