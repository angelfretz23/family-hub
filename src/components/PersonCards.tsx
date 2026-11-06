"use client";

import styled from "styled-components";
import type { Person } from "@/db/schema";
import type { PersonJobStats } from "@/lib/jobs";

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const cardChrome = `
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 4.5rem;
  padding: 0.65rem 0.9rem 0.65rem 0.65rem;
  border-radius: 1.15rem;
  min-width: 11rem;
  text-align: left;
  color: inherit;
`;

const CardButton = styled.button<{ $selected: boolean; $color: string }>`
  ${cardChrome}
  border: 2px solid
    ${({ $selected, $color, theme }) =>
      $selected ? $color : theme.colors.stroke};
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.panelStrong : theme.colors.panel};
  box-shadow: ${({ theme }) => theme.shadow.soft};
  cursor: pointer;
`;

const CardStatic = styled.div<{ $color: string }>`
  ${cardChrome}
  border: 2px solid ${({ $color }) => $color}55;
  background: ${({ theme }) => theme.colors.panelStrong};
  box-shadow: ${({ theme }) => theme.shadow.soft};
`;

const Avatar = styled.div<{ $color: string }>`
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 999px;
  background: ${({ $color }) => $color};
  color: #fffaf2;
  display: grid;
  place-items: center;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.25rem;
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Copy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
`;

const Name = styled.span`
  font-size: 1.15rem;
  font-weight: 750;
  line-height: 1.15;
`;

const Stats = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.95rem;
  font-weight: 600;
`;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function AvatarView({ person }: { person: Person }) {
  return (
    <Avatar $color={person.color}>
      {person.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={person.avatarUrl} alt="" />
      ) : (
        initials(person.name)
      )}
    </Avatar>
  );
}

export type PersonCardsProps = {
  people: Person[];
  selectedIds?: number[];
  onChange?: (ids: number[]) => void;
  jobStats?: Map<number, PersonJobStats>;
  showJobStats?: boolean;
  /** Filter mode: tap to select people. Off = display-only cards. */
  selectable?: boolean;
};

export function PersonCards({
  people,
  selectedIds = [],
  onChange,
  jobStats,
  showJobStats = false,
  selectable = false,
}: PersonCardsProps) {
  function toggle(id: number) {
    if (!onChange) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((value) => value !== id));
      return;
    }
    onChange([...selectedIds, id]);
  }

  return (
    <Row role="group" aria-label="Family members">
      {people.map((person) => {
        const stats = jobStats?.get(person.id);
        const selected =
          selectedIds.length === 0 ? true : selectedIds.includes(person.id);
        const body = (
          <>
            <AvatarView person={person} />
            <Copy>
              <Name>{person.name}</Name>
              {showJobStats ? (
                <Stats>
                  {stats
                    ? `${stats.completed}/${stats.total} jobs`
                    : "0/0 jobs"}
                </Stats>
              ) : null}
            </Copy>
          </>
        );

        if (!selectable) {
          return (
            <CardStatic key={person.id} $color={person.color}>
              {body}
            </CardStatic>
          );
        }

        return (
          <CardButton
            key={person.id}
            type="button"
            $selected={selected}
            $color={person.color}
            onClick={() => toggle(person.id)}
            aria-pressed={selectedIds.length === 0 ? true : selected}
          >
            {body}
          </CardButton>
        );
      })}
    </Row>
  );
}

export function filterBySelectedPeople<T>(
  items: T[],
  selectedIds: number[],
  getPersonIds: (item: T) => number[],
) {
  if (selectedIds.length === 0) return items;
  return items.filter((item) =>
    getPersonIds(item).some((id) => selectedIds.includes(id)),
  );
}
