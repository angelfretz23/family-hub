"use client";

import styled from "styled-components";
import type { Person } from "@/db/schema";
import type { PersonJobStats } from "@/lib/jobs";
import type { PersonStarStats } from "@/lib/tasks";

const Row = styled.div<{ $portrait: boolean; $count: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $count }) => Math.max($count, 1)}, minmax(0, 1fr));
  width: 100%;
  gap: 0.85rem;

  // @media (max-width: 900px) {
  //   grid-template-columns: repeat(
  //     ${({ $portrait }) => ($portrait ? 2 : 2)},
  //     minmax(0, 1fr)
  //   );
  // }
`;

const cardChrome = `
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 4.5rem;
  padding: 0.65rem 0.9rem 0.65rem 0.65rem;
  border-radius: 1.15rem;
  width: 100%;
  min-width: 0;
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

const PortraitCard = styled.div<{ $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-width: 0;
  height: 16.5rem;
  padding: 0.85rem 0.75rem 0.9rem;
  border-radius: 1.35rem;
  border: 2px solid ${({ $color }) => $color}66;
  background: ${({ theme }) => theme.colors.panelStrong};
  box-shadow: ${({ theme }) => theme.shadow.soft};
  text-align: center;
  color: inherit;
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

const PortraitAvatar = styled.div<{ $color: string }>`
  width: min(100%, 10.5rem);
  aspect-ratio: 1;
  height: auto;
  flex: 0 0 auto;
  max-height: 75%;
  border-radius: 999px;
  background: ${({ $color }) => $color};
  color: #fffaf2;
  display: grid;
  place-items: center;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(1.75rem, 3.5vw, 2.75rem);
  font-weight: 700;
  overflow: hidden;
  margin-bottom: 0.65rem;

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

const PortraitCopy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  min-width: 0;
  width: 100%;
  margin-top: auto;
`;

const Name = styled.span`
  font-size: 1.15rem;
  font-weight: 750;
  line-height: 1.15;
`;

const PortraitName = styled.span`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(1.15rem, 1.8vw, 1.45rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
`;

const Stats = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.95rem;
  font-weight: 600;
`;

const PortraitStats = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.05rem;
  font-weight: 650;
`;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function CompactAvatar({ person }: { person: Person }) {
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

function PortraitAvatarView({ person }: { person: Person }) {
  return (
    <PortraitAvatar $color={person.color}>
      {person.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={person.avatarUrl} alt="" />
      ) : (
        initials(person.name)
      )}
    </PortraitAvatar>
  );
}

export type PersonCardsProps = {
  people: Person[];
  selectedIds?: number[];
  onChange?: (ids: number[]) => void;
  jobStats?: Map<number, PersonJobStats>;
  starStats?: Map<number, PersonStarStats>;
  showJobStats?: boolean;
  showStarStats?: boolean;
  /** Filter mode: tap to select people. Off = display-only cards. */
  selectable?: boolean;
  /** single = one kid at a time (Routines). multi = toggle many. */
  selectionMode?: "single" | "multi";
  /** Today uses portrait cards: large photo, name, then job tally. */
  variant?: "compact" | "portrait";
};

export function PersonCards({
  people,
  selectedIds = [],
  onChange,
  jobStats,
  starStats,
  showJobStats = false,
  showStarStats = false,
  selectable = false,
  selectionMode = "multi",
  variant = "compact",
}: PersonCardsProps) {
  const portrait = variant === "portrait";

  function toggle(id: number) {
    if (!onChange) return;
    if (selectionMode === "single") {
      onChange(selectedIds.includes(id) ? [] : [id]);
      return;
    }
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((value) => value !== id));
      return;
    }
    onChange([...selectedIds, id]);
  }

  function tallyFor(personId: number) {
    const stars = starStats?.get(personId);
    const jobs = jobStats?.get(personId);
    const parts: string[] = [];
    if (showStarStats) {
      parts.push(`⭐ ${stars?.starsToday ?? 0} today`);
    }
    if (showJobStats) {
      parts.push(
        jobs ? `${jobs.completed}/${jobs.total} jobs` : "0/0 jobs",
      );
    }
    return parts.join(" · ");
  }

  return (
    <Row
      role="group"
      aria-label="Family members"
      $portrait={portrait}
      $count={people.length}
    >
      {people.map((person) => {
        const selected =
          selectionMode === "single"
            ? selectedIds.includes(person.id)
            : selectedIds.length === 0
              ? true
              : selectedIds.includes(person.id);
        const tally = tallyFor(person.id);

        if (portrait) {
          return (
            <PortraitCard key={person.id} $color={person.color}>
              <PortraitAvatarView person={person} />
              <PortraitCopy>
                <PortraitName>{person.name}</PortraitName>
                {showJobStats || showStarStats ? (
                  <PortraitStats>{tally}</PortraitStats>
                ) : null}
              </PortraitCopy>
            </PortraitCard>
          );
        }

        const body = (
          <>
            <CompactAvatar person={person} />
            <Copy>
              <Name>{person.name}</Name>
              {showJobStats || showStarStats ? <Stats>{tally}</Stats> : null}
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
            aria-pressed={selected}
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
