"use client";

import styled from "styled-components";

const Panel = styled.section`
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  border-radius: ${({ theme }) => theme.sizes.radius};
  padding: 1.35rem 1.5rem;
  box-shadow: ${({ theme }) => theme.shadow.soft};
  backdrop-filter: blur(10px);
  min-height: 10rem;
`;

const Heading = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.75rem;
  letter-spacing: -0.02em;
`;

const Body = styled.p`
  margin: 0.75rem 0 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.2rem;
  line-height: 1.45;
  max-width: 36rem;
`;

type PlaceholderPanelProps = {
  heading: string;
  body: string;
};

export function PlaceholderPanel({ heading, body }: PlaceholderPanelProps) {
  return (
    <Panel>
      <Heading>{heading}</Heading>
      <Body>{body}</Body>
    </Panel>
  );
}
