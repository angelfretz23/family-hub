"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import type { TaskBand, TaskVariant } from "@/db/schema";

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
  width: min(36rem, 100%);
  max-height: min(90dvh, 52rem);
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

const Title = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.9rem;
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

const Select = styled.select`
  min-height: ${({ theme }) => theme.sizes.touch};
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  padding: 0 1rem;
  font-size: 1.15rem;
  color: ${({ theme }) => theme.colors.ink};
  background: white;
`;

const VariantGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
`;

const VariantChip = styled.button<{ $on: boolean }>`
  min-height: 3rem;
  border-radius: 1rem;
  border: 1px solid
    ${({ theme, $on }) => ($on ? theme.colors.ink : theme.colors.stroke)};
  background: ${({ theme, $on }) =>
    $on ? theme.colors.ink : theme.colors.panelStrong};
  color: ${({ theme, $on }) => ($on ? theme.colors.cream : theme.colors.ink)};
  font-weight: 700;
  cursor: pointer;
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
  cursor: pointer;
`;

const ErrorText = styled.p`
  margin: 0;
  color: #8b3a3a;
  font-weight: 650;
`;

const Hint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.95rem;
`;

const VARIANT_OPTIONS: Array<{ id: TaskVariant; label: string }> = [
  { id: "boolean", label: "Done / not done" },
  { id: "time", label: "Time (minutes)" },
  { id: "count", label: "Count" },
  { id: "reading", label: "Reading (book)" },
];

const BAND_OPTIONS: Array<{ id: TaskBand; label: string }> = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
  { id: "job", label: "Jobs" },
];

type TaskEditorModalProps = {
  onClose: () => void;
};

export function TaskEditorModal({ onClose }: TaskEditorModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("⭐");
  const [band, setBand] = useState<TaskBand>("morning");
  const [variants, setVariants] = useState<TaskVariant[]>(["boolean"]);
  const [starReward, setStarReward] = useState("2");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function toggleVariant(variant: TaskVariant) {
    setVariants((current) => {
      if (current.includes(variant)) {
        const next = current.filter((value) => value !== variant);
        return next.length ? next : ["boolean"];
      }
      return [...current, variant];
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          icon,
          band,
          variants,
          starReward: Number(starReward) || 1,
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Could not create task");
      }
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create task");
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
        aria-labelledby="task-editor-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
      >
        <Title id="task-editor-title">Add shared routine / job</Title>
        <Hint>
          New tasks are shared templates. Select a kid on the Routines page,
          then tap the card to log it under them.
        </Hint>

        <Field>
          Task name
          <Input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Latin practice"
          />
        </Field>

        <Field>
          Icon (emoji)
          <Input
            value={icon}
            onChange={(event) => setIcon(event.target.value)}
            maxLength={4}
          />
        </Field>

        <Field>
          Section
          <Select
            value={band}
            onChange={(event) => setBand(event.target.value as TaskBand)}
          >
            {BAND_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <div>
          <Field as="div">
            Log types
            <Hint>Pick one or more — the log modal will ask for each.</Hint>
          </Field>
          <VariantGrid>
            {VARIANT_OPTIONS.map((option) => (
              <VariantChip
                key={option.id}
                type="button"
                $on={variants.includes(option.id)}
                onClick={() => toggleVariant(option.id)}
              >
                {option.label}
              </VariantChip>
            ))}
          </VariantGrid>
        </div>

        <Field>
          Star reward
          <Input
            type="number"
            min={1}
            max={20}
            value={starReward}
            onChange={(event) => setStarReward(event.target.value)}
          />
        </Field>

        {error ? <ErrorText>{error}</ErrorText> : null}

        <Actions>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" $primary disabled={saving}>
            {saving ? "Saving…" : "Add task"}
          </Button>
        </Actions>
      </Dialog>
    </Overlay>,
    document.body,
  );
}
