"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import type { TaskWithMeta } from "@/lib/tasks";

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

const Dialog = styled.form`
  width: min(34rem, 100%);
  max-height: min(90dvh, 48rem);
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

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 1rem;
  font-weight: 650;
  color: ${({ theme }) => theme.colors.inkMuted};
`;

const Input = styled.input`
  min-height: ${({ theme }) => theme.sizes.touch};
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  padding: 0 1rem;
  font-size: 1.15rem;
  color: ${({ theme }) => theme.colors.ink};
  background: white;
`;

const CheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.25rem;
  padding: 0.65rem 0.9rem;
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panelStrong};
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;

  input {
    width: 1.35rem;
    height: 1.35rem;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $primary?: boolean }>`
  min-height: 3rem;
  padding: 0 1.15rem;
  border-radius: 999px;
  border: 1px solid
    ${({ theme, $primary }) =>
      $primary ? theme.colors.ink : theme.colors.stroke};
  background: ${({ theme, $primary }) =>
    $primary ? theme.colors.ink : theme.colors.panelStrong};
  color: ${({ theme, $primary }) =>
    $primary ? theme.colors.cream : theme.colors.ink};
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
`;

const ErrorText = styled.p`
  margin: 0;
  color: #8b3a3a;
  font-weight: 650;
`;

const Reward = styled.p`
  margin: 0;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accentInk};
`;

type TaskLogModalProps = {
  task: TaskWithMeta;
  onClose: () => void;
};

export function TaskLogModal({ task, onClose }: TaskLogModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [completed, setCompleted] = useState(
    task.todayLog?.completed ?? true,
  );
  const [minutes, setMinutes] = useState(
    task.todayLog?.minutes != null ? String(task.todayLog.minutes) : "",
  );
  const [countValue, setCountValue] = useState(
    task.todayLog?.countValue != null ? String(task.todayLog.countValue) : "",
  );
  const [bookTitle, setBookTitle] = useState(task.todayLog?.bookTitle ?? "");
  const [notes, setNotes] = useState(task.todayLog?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasBoolean = task.variantsList.includes("boolean");
  const hasTime = task.variantsList.includes("time");
  const hasCount = task.variantsList.includes("count");
  const hasReading = task.variantsList.includes("reading");

  useEffect(() => {
    setMounted(true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          personId: task.person.id,
          completed: hasBoolean ? completed : true,
          minutes: hasTime && minutes !== "" ? Number(minutes) : null,
          countValue: hasCount && countValue !== "" ? Number(countValue) : null,
          bookTitle: hasReading ? bookTitle : null,
          notes,
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Could not save log");
      }
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save log");
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <Overlay role="presentation" onClick={onClose}>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-log-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
      >
        <Header>
          <TitleBlock>
            <Icon $color={task.person.color} aria-hidden="true">
              {task.icon}
            </Icon>
            <div>
              <Title id="task-log-title">{task.title}</Title>
              <Subtitle>
                {task.person.name} · 🔥 {task.streak} streak
              </Subtitle>
            </div>
          </TitleBlock>
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </Header>

        <Reward>Reward: ⭐ {task.starReward} stars when logged</Reward>

        {hasBoolean ? (
          <CheckRow>
            <input
              type="checkbox"
              checked={completed}
              onChange={(event) => setCompleted(event.target.checked)}
            />
            Mark completed
          </CheckRow>
        ) : null}

        {hasTime ? (
          <Field>
            Minutes spent
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
              placeholder="e.g. 20"
            />
          </Field>
        ) : null}

        {hasCount ? (
          <Field>
            Count
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={countValue}
              onChange={(event) => setCountValue(event.target.value)}
              placeholder="e.g. 10 push-ups"
            />
          </Field>
        ) : null}

        {hasReading ? (
          <Field>
            Book
            <Input
              value={bookTitle}
              onChange={(event) => setBookTitle(event.target.value)}
              placeholder="What are you reading?"
            />
          </Field>
        ) : null}

        <Field>
          Notes (optional)
          <Input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anything to remember"
          />
        </Field>

        {error ? <ErrorText>{error}</ErrorText> : null}

        <Actions>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" $primary disabled={saving}>
            {saving ? "Saving…" : "Save log"}
          </Button>
        </Actions>
      </Dialog>
    </Overlay>,
    document.body,
  );
}
