"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import type { Person } from "@/db/schema";
import type { EventWithPeople } from "@/lib/events";
import { parseLocalIso, toDateKey, toLocalIso } from "@/lib/dates";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(20, 36, 30, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(1rem, env(safe-area-inset-top))
    max(1rem, env(safe-area-inset-right))
    max(1rem, env(safe-area-inset-bottom))
    max(1rem, env(safe-area-inset-left));
  overflow: auto;
`;

const Sheet = styled.form`
  width: min(42rem, 100%);
  max-width: 100%;
  max-height: min(90dvh, 56rem);
  overflow: auto;
  margin: auto;
  background: ${({ theme }) => theme.colors.cream};
  border-radius: 1.5rem;
  padding: 1.25rem 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: ${({ theme }) => theme.shadow.soft};
  flex-shrink: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 2rem;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkMuted};
`;

const Input = styled.input`
  min-height: ${({ theme }) => theme.sizes.touch};
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  padding: 0 1rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.ink};
  background: white;
`;

const TextArea = styled.textarea`
  min-height: 6rem;
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  padding: 0.9rem 1rem;
  font-size: 1.15rem;
  color: ${({ theme }) => theme.colors.ink};
  background: white;
  resize: vertical;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const PersonGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

const PersonToggle = styled.button<{ $active: boolean; $color: string }>`
  min-height: ${({ theme }) => theme.sizes.touch};
  padding: 0 1rem;
  border-radius: 999px;
  border: 2px solid
    ${({ $active, $color, theme }) => ($active ? $color : theme.colors.stroke)};
  background: ${({ $active, $color }) => ($active ? `${$color}22` : "white")};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 1.1rem;
  font-weight: 650;
  cursor: pointer;
`;

const CheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: ${({ theme }) => theme.sizes.touch};
  font-size: 1.15rem;
  color: ${({ theme }) => theme.colors.ink};
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 0.25rem;
`;

const Button = styled.button<{ $variant?: "primary" | "ghost" | "danger" }>`
  min-height: ${({ theme }) => theme.sizes.touch};
  border-radius: 999px;
  border: 1px solid
    ${({ theme, $variant }) =>
      $variant === "danger" ? "#8b3a3a" : theme.colors.stroke};
  background: ${({ theme, $variant }) =>
    $variant === "primary"
      ? theme.colors.ink
      : $variant === "danger"
        ? "#f7e8e8"
        : "white"};
  color: ${({ theme, $variant }) =>
    $variant === "primary" ? theme.colors.cream : theme.colors.ink};
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
`;

const ErrorText = styled.p`
  margin: 0;
  color: #8b3a3a;
  font-size: 1.05rem;
`;

type EventEditorProps = {
  people: Person[];
  initial?: EventWithPeople | null;
  defaultDateKey?: string;
  onClose: () => void;
};

function toInputDate(value: string) {
  return value.slice(0, 10);
}

function toInputTime(value: string) {
  const date = parseLocalIso(value);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function EventEditor({
  people,
  initial,
  defaultDateKey,
  onClose,
}: EventEditorProps) {
  const router = useRouter();
  const defaults = useMemo(() => {
    if (initial) {
      return {
        title: initial.title,
        notes: initial.notes,
        location: initial.location,
        allDay: initial.allDay,
        date: toInputDate(initial.startsAt),
        endDate: toInputDate(initial.endsAt),
        startTime: toInputTime(initial.startsAt),
        endTime: toInputTime(initial.endsAt),
        personIds: initial.people.map((p) => p.id),
      };
    }
    const date = defaultDateKey ?? toDateKey(new Date());
    return {
      title: "",
      notes: "",
      location: "",
      allDay: false,
      date,
      endDate: date,
      startTime: "09:00",
      endTime: "10:00",
      personIds: [] as number[],
    };
  }, [initial, defaultDateKey]);

  const [title, setTitle] = useState(defaults.title);
  const [notes, setNotes] = useState(defaults.notes);
  const [location, setLocation] = useState(defaults.location);
  const [allDay, setAllDay] = useState(defaults.allDay);
  const [date, setDate] = useState(defaults.date);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [startTime, setStartTime] = useState(defaults.startTime);
  const [endTime, setEndTime] = useState(defaults.endTime);
  const [personIds, setPersonIds] = useState<number[]>(defaults.personIds);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function togglePerson(id: number) {
    setPersonIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const startsAt = allDay
      ? date
      : toLocalIso(parseLocalIso(`${date}T${startTime}:00`));
    const endsAt = allDay
      ? endDate || date
      : toLocalIso(parseLocalIso(`${endDate || date}T${endTime}:00`));

    const payload = {
      title,
      notes,
      location,
      allDay,
      startsAt,
      endsAt,
      personIds,
    };

    try {
      const response = await fetch(
        initial ? `/api/events/${initial.id}` : "/api/events",
        {
          method: initial ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Could not save event");
      }
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save event");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!initial) return;
    if (!window.confirm("Delete this event?")) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/events/${initial.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Could not delete");
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
      setSaving(false);
    }
  }

  return (
    <Overlay role="dialog" aria-modal="true" aria-label="Event editor">
      <Sheet onSubmit={onSubmit}>
        <Title>{initial ? "Edit event" : "New event"}</Title>

        <Field>
          Title
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="What’s happening?"
            autoFocus
          />
        </Field>

        <CheckRow>
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            style={{ width: 24, height: 24 }}
          />
          All day
        </CheckRow>

        <Row>
          <Field>
            Start date
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (!endDate || endDate < e.target.value) setEndDate(e.target.value);
              }}
              required
            />
          </Field>
          <Field>
            End date
            <Input
              type="date"
              value={endDate}
              min={date}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </Field>
        </Row>

        {!allDay ? (
          <Row>
            <Field>
              Start time
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </Field>
            <Field>
              End time
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </Field>
          </Row>
        ) : null}

        <Field>
          Who
          <PersonGrid>
            {people.map((person) => (
              <PersonToggle
                key={person.id}
                type="button"
                $active={personIds.includes(person.id)}
                $color={person.color}
                onClick={() => togglePerson(person.id)}
              >
                {person.name}
              </PersonToggle>
            ))}
          </PersonGrid>
        </Field>

        <Field>
          Location
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Optional"
          />
        </Field>

        <Field>
          Notes
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional details"
          />
        </Field>

        {error ? <ErrorText>{error}</ErrorText> : null}

        <Actions>
          <Button type="button" $variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" $variant="primary" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </Actions>

        {initial ? (
          <Button type="button" $variant="danger" onClick={onDelete} disabled={saving}>
            Delete event
          </Button>
        ) : null}
      </Sheet>
    </Overlay>
  );
}
