"use client";

import Image from "next/image";
import styled from "styled-components";
import type { Rule } from "@/db/schema";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(20, 36, 30, 0.5);
  display: grid;
  place-items: center;
  padding: 1.25rem;
`;

const Dialog = styled.div`
  width: min(40rem, 100%);
  max-height: min(86dvh, 52rem);
  overflow: auto;
  background: ${({ theme }) => theme.colors.cream};
  border-radius: 1.5rem;
  padding: 1.5rem 1.5rem 1.35rem;
  box-shadow: ${({ theme }) => theme.shadow.soft};
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.9rem;
  align-items: center;
`;

const Crest = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.stroke};
`;

const Titles = styled.div`
  min-width: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 2rem;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  margin: 0.2rem 0 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.05rem;
`;

const CloseButton = styled.button`
  min-width: ${({ theme }) => theme.sizes.touch};
  min-height: ${({ theme }) => theme.sizes.touch};
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: white;
  color: ${({ theme }) => theme.colors.ink};
  font-size: 1.35rem;
  font-weight: 700;
  cursor: pointer;
`;

const List = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const Item = styled.li`
  border: 1px solid ${({ theme }) => theme.colors.stroke};
  background: ${({ theme }) => theme.colors.panelStrong};
  border-radius: ${({ theme }) => theme.sizes.radius};
  padding: 1rem 1.1rem;
`;

const ItemTitle = styled.h3`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
`;

const ItemBody = styled.p`
  margin: 0.4rem 0 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.15rem;
  line-height: 1.4;
`;

const Empty = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 1.15rem;
`;

type RulesModalProps = {
  rules: Rule[];
  onClose: () => void;
};

export function RulesModal({ rules, onClose }: RulesModalProps) {
  return (
    <Overlay
      role="dialog"
      aria-modal="true"
      aria-label="Family rules"
      onClick={onClose}
    >
      <Dialog
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Header>
          <Crest>
            <Image
              src="/coat-of-arms.svg"
              alt=""
              width={64}
              height={64}
              priority
            />
          </Crest>
          <Titles>
            <Title>Family Rules</Title>
            <Subtitle>Our household agreements</Subtitle>
          </Titles>
          <CloseButton type="button" onClick={onClose} aria-label="Close">
            ×
          </CloseButton>
        </Header>

        {rules.length === 0 ? (
          <Empty>No rules yet.</Empty>
        ) : (
          <List>
            {rules.map((rule, index) => (
              <Item key={rule.id}>
                <ItemTitle>
                  {index + 1}. {rule.title}
                </ItemTitle>
                {rule.body ? <ItemBody>{rule.body}</ItemBody> : null}
              </Item>
            ))}
          </List>
        )}
      </Dialog>
    </Overlay>
  );
}
