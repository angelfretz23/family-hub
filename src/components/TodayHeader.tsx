"use client";

import Image from "next/image";
import { useState } from "react";
import styled from "styled-components";
import type { Rule } from "@/db/schema";
import { RulesModal } from "@/components/RulesModal";
import {
  WeatherChip,
  WeatherMeta,
  WeatherTemp,
} from "@/components/layout";

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Leading = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  min-width: 0;
`;

const CoatButton = styled.button`
  flex: 0 0 auto;
  width: 4.5rem;
  height: 4.5rem;
  padding: 0.35rem;
  border-radius: 1.15rem;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panelStrong};
  box-shadow: ${({ theme }) => theme.shadow.soft};
  cursor: pointer;
  display: grid;
  place-items: center;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const Copy = styled.div`
  min-width: 0;
`;

const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(2.4rem, 4vw, 3.4rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
`;

const Subtitle = styled.p`
  margin: 0.35rem 0 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.25rem;
`;

const Trailing = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

type TodayHeaderProps = {
  title?: string;
  dateLabel: string;
  rules: Rule[];
};

export function TodayHeader({
  title = "Today",
  dateLabel,
  rules,
}: TodayHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Header>
        <Leading>
          <CoatButton
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open family rules"
            title="Family rules"
          >
            <Image
              src="/coat-of-arms.svg"
              alt=""
              width={64}
              height={64}
              priority
            />
          </CoatButton>
          <Copy>
            <Title>{title}</Title>
            <Subtitle>{dateLabel}</Subtitle>
          </Copy>
        </Leading>

        <Trailing>
          <WeatherChip aria-label="Weather placeholder">
            <WeatherTemp>—°</WeatherTemp>
            <WeatherMeta>Weather soon</WeatherMeta>
          </WeatherChip>
        </Trailing>
      </Header>

      {open ? <RulesModal rules={rules} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
