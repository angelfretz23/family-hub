"use client";

import Link from "next/link";
import styled from "styled-components";

export const HubShell = styled.div`
  min-height: 100dvh;
  display: grid;
  grid-template-rows: 1fr auto;
`;

export const HubMain = styled.main`
  min-height: 0;
  overflow: auto;
  padding: 1.5rem 1.75rem 1rem;

  @media (max-width: 900px) {
    padding: 1.1rem 1rem 0.75rem;
  }
`;

export const Page = styled.div`
  max-width: 88rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const TodayGrid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const TodaySide = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const WeatherChip = styled.div`
  min-height: ${({ theme }) => theme.sizes.touch};
  padding: 0.65rem 1rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.panelStrong};
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.1rem;
  min-width: 8.5rem;
`;

export const WeatherTemp = styled.span`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.5rem;
  line-height: 1;
`;

export const WeatherMeta = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 0.95rem;
`;

export const RulesTeaser = styled(Link)`
  display: flex;
  align-items: center;
  min-height: ${({ theme }) => theme.sizes.touch};
  padding: 0 1.25rem;
  border-radius: ${({ theme }) => theme.sizes.radius};
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panelStrong};
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.15rem;
  text-align: left;
  width: 100%;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.ink};
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

export const Segmented = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
`;

export const SegmentedItem = styled.button<{ $active?: boolean }>`
  min-height: ${({ theme }) => theme.sizes.touch};
  border-radius: 999px;
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.ink : theme.colors.stroke};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.ink : theme.colors.panel};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.cream : theme.colors.inkMuted};
  font-size: 1.15rem;
  font-weight: 600;
  cursor: pointer;
`;
