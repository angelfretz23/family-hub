"use client";

import styled from "styled-components";
import type { Person } from "@/db/schema";

/** Fixed width so event titles line up across the list. */
export const AVATAR_STACK_SLOT = "5.25rem";

const Stack = styled.div<{ $size: number; $slot: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  height: ${({ $size }) => $size}rem;
  ${({ $slot }) =>
    $slot
      ? `
    width: ${AVATAR_STACK_SLOT};
    min-width: ${AVATAR_STACK_SLOT};
  `
      : ""}
`;

const Avatar = styled.div<{
  $color: string;
  $size: number;
  $index: number;
  $total: number;
}>`
  width: ${({ $size }) => $size}rem;
  height: ${({ $size }) => $size}rem;
  border-radius: 999px;
  background: ${({ $color }) => $color};
  color: #fffaf2;
  display: grid;
  place-items: center;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ $size }) => Math.max(0.7, $size * 0.38)}rem;
  font-weight: 700;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.colors.cream};
  box-shadow: 0 4px 12px rgba(28, 42, 36, 0.12);
  flex-shrink: 0;
  position: relative;
  z-index: ${({ $index, $total }) => $total - $index};
  /* tighter fan: pull each subsequent avatar farther over the previous */
  margin-left: ${({ $index, $size }) =>
    $index === 0 ? 0 : -($size * 0.58)}rem;
  transform: rotate(${({ $index, $total }) => {
    if ($total <= 1) return "0deg";
    const spread = Math.min(8, 3 + $total);
    const start = -spread / 2;
    const step = spread / ($total - 1);
    return `${start + $index * step}deg`;
  }});
  transform-origin: 50% 85%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type PersonAvatarStackProps = {
  people: Person[];
  /** Diameter in rem. */
  size?: number;
  /** Reserve fixed width so titles align in lists. */
  slot?: boolean;
  className?: string;
};

export function PersonAvatarStack({
  people,
  size = 2.35,
  slot = false,
  className,
}: PersonAvatarStackProps) {
  return (
    <Stack $size={size} $slot={slot} className={className} aria-hidden="true">
      {people.map((person, index) => (
        <Avatar
          key={person.id}
          $color={person.color}
          $size={size}
          $index={index}
          $total={people.length}
          title={person.name}
        >
          {person.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={person.avatarUrl} alt="" />
          ) : (
            initials(person.name)
          )}
        </Avatar>
      ))}
    </Stack>
  );
}
