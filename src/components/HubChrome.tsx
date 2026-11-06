"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Copy = styled.div``;

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

type HubChromeProps = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export function HubChrome({ title, subtitle, trailing }: HubChromeProps) {
  return (
    <Header>
      <Copy>
        <Title>{title}</Title>
        {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
      </Copy>
      {trailing ? <Trailing>{trailing}</Trailing> : null}
    </Header>
  );
}
