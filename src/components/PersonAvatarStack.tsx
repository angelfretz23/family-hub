"use client";

import styled from "styled-components";
import type { Person } from "@/db/schema";

const Stack = styled.div<{ $size: number }>`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: ${({ $size }) => $size}rem;
  /* keep fan within layout; later avatars overlap leftward */
  padding-right: ${({ $size }) => $size * 0.15}rem;
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
  margin-left: ${({ $index, $size }) => ($index === 0 ? 0 : -($size * 0.38))}rem;
  transform: rotate(${({ $index, $total }) => {
    if ($total <= 1) return "0deg";
    const spread = Math.min(14, 6 + $total * 2);
    const start = -spread / 2;
    const step = $total === 1 ? 0 : spread / ($total - 1);
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
  className?: string;
};

export function PersonAvatarStack({
  people,
  size = 2.35,
  className,
}: PersonAvatarStackProps) {
  if (people.length === 0) return null;

  return (
    <Stack $size={size} className={className} aria-hidden="true">
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
