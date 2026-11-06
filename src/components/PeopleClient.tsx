"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styled from "styled-components";
import type { Person } from "@/db/schema";
import { PERSON_COLORS } from "@/lib/person-colors";
import { HubChrome } from "@/components/HubChrome";
import { Page } from "@/components/layout";

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Card = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.9rem;
  align-items: center;
  min-height: 4.5rem;
  padding: 0.85rem 1rem;
  border-radius: ${({ theme }) => theme.sizes.radius};
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panelStrong};
`;

const Swatch = styled.span<{ $color: string }>`
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 999px;
  background: ${({ $color }) => $color};
`;

const Name = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
`;

const Meta = styled.div`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1rem;
  text-transform: capitalize;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1.4fr auto auto auto;
  gap: 0.65rem;
  align-items: end;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-weight: 600;
`;

const Input = styled.input`
  min-height: ${({ theme }) => theme.sizes.touch};
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  padding: 0 1rem;
  font-size: 1.15rem;
`;

const Select = styled.select`
  min-height: ${({ theme }) => theme.sizes.touch};
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  padding: 0 0.9rem;
  font-size: 1.15rem;
  background: white;
`;

const Button = styled.button<{ $variant?: "primary" | "ghost" }>`
  min-height: ${({ theme }) => theme.sizes.touch};
  padding: 0 1.1rem;
  border-radius: 999px;
  border: 1px solid
    ${({ theme, $variant }) =>
      $variant === "primary" ? theme.colors.ink : theme.colors.stroke};
  background: ${({ theme, $variant }) =>
    $variant === "primary" ? theme.colors.ink : theme.colors.panelStrong};
  color: ${({ theme, $variant }) =>
    $variant === "primary" ? theme.colors.cream : theme.colors.ink};
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
`;

const BackLink = styled(Link)`
  min-height: ${({ theme }) => theme.sizes.touch};
  display: inline-flex;
  align-items: center;
  padding: 0 1rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panel};
  font-weight: 600;
`;

type PeopleClientProps = {
  people: Person[];
};

export function PeopleClient({ people }: PeopleClientProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState<"adult" | "child">("child");
  const [color, setColor] = useState<string>(PERSON_COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, color }),
      });
      if (!response.ok) throw new Error("Could not add person");
      setName("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(person: Person) {
    await fetch(`/api/people/${person.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !person.active }),
    });
    router.refresh();
  }

  return (
    <Page>
      <HubChrome
        title="People"
        subtitle="Colors show up on the calendar"
        trailing={<BackLink href="/calendar">Back</BackLink>}
      />

      <Form onSubmit={onCreate}>
        <Field>
          Name
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add someone"
            required
          />
        </Field>
        <Field>
          Role
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as "adult" | "child")}
          >
            <option value="adult">Adult</option>
            <option value="child">Child</option>
          </Select>
        </Field>
        <Field>
          Color
          <Select value={color} onChange={(e) => setColor(e.target.value)}>
            {PERSON_COLORS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" $variant="primary" disabled={saving}>
          {saving ? "Adding…" : "Add"}
        </Button>
      </Form>

      <Stack>
        {people.map((person) => (
          <Card key={person.id}>
            <Swatch $color={person.color} />
            <div>
              <Name>{person.name}</Name>
              <Meta>
                {person.role}
                {person.active ? "" : " · hidden"}
              </Meta>
            </div>
            <Button type="button" $variant="ghost" onClick={() => toggleActive(person)}>
              {person.active ? "Hide" : "Show"}
            </Button>
          </Card>
        ))}
      </Stack>
    </Page>
  );
}
