"use client";

import Link from "next/link";
import styled from "styled-components";
import type { CompletedTaskEntry } from "@/lib/tasks";

const Panel = styled.section`
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  border-radius: ${({ theme }) => theme.sizes.radius};
  padding: 1.2rem 1.35rem;
  box-shadow: ${({ theme }) => theme.shadow.soft};
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 10rem;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
`;

const Heading = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.65rem;
  letter-spacing: -0.02em;
`;

const Count = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-weight: 700;
  font-size: 1rem;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

const Row = styled.div<{ $color: string }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.7rem;
  align-items: center;
  min-height: 3.35rem;
  padding: 0.55rem 0.7rem;
  border-radius: 0.9rem;
  border: 1px solid ${({ $color }) => `${$color}55`};
  background: ${({ $color }) => `${$color}22`};
`;

const Icon = styled.span<{ $color: string }>`
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 0.75rem;
  background: ${({ $color }) => $color};
  display: grid;
  place-items: center;
  font-size: 1.15rem;
  flex-shrink: 0;
`;

const Copy = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`;

const Title = styled.span`
  font-size: 1.05rem;
  font-weight: 750;
  line-height: 1.15;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Meta = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.9rem;
  font-weight: 600;
`;

const Stars = styled.span`
  font-weight: 750;
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
`;

const Empty = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.05rem;
`;

const OpenLink = styled(Link)`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.ink};
  }
`;

function detailLine(entry: CompletedTaskEntry) {
  const bits = [entry.person.name];
  if (entry.log.minutes != null) bits.push(`${entry.log.minutes} min`);
  if (entry.log.countValue != null) bits.push(`×${entry.log.countValue}`);
  if (entry.log.bookTitle) bits.push(entry.log.bookTitle);
  return bits.join(" · ");
}

type TodayCompletionsProps = {
  heading: string;
  items: CompletedTaskEntry[];
};

export function TodayCompletions({ heading, items }: TodayCompletionsProps) {
  return (
    <Panel>
      <Header>
        <Heading>{heading}</Heading>
        <Count>
          {items.length} done · <OpenLink href="/routines">Open</OpenLink>
        </Count>
      </Header>

      {items.length === 0 ? (
        <Empty>Nothing completed yet today.</Empty>
      ) : (
        <List>
          {items.map((entry) => (
            <Row
              key={`${entry.id}-${entry.person.id}`}
              $color={entry.person.color}
            >
              <Icon $color={entry.person.color} aria-hidden="true">
                {entry.icon}
              </Icon>
              <Copy>
                <Title>{entry.title}</Title>
                <Meta>{detailLine(entry)}</Meta>
              </Copy>
              <Stars aria-label={`${entry.log.starsEarned} stars`}>
                ⭐ {entry.log.starsEarned}
              </Stars>
            </Row>
          ))}
        </List>
      )}
    </Panel>
  );
}
