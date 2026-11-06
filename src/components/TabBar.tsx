"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";

const TABS = [
  { href: "/today", label: "Today" },
  { href: "/calendar", label: "Calendar" },
  { href: "/jobs", label: "Jobs" },
  { href: "/routines", label: "Routines" },
  { href: "/rules", label: "Rules" },
] as const;

const Nav = styled.nav`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.4rem;
  padding: 0.65rem 0.75rem calc(0.65rem + env(safe-area-inset-bottom));
  background: ${({ theme }) => theme.colors.tabBg};
  border-top: 1px solid rgba(255, 250, 242, 0.08);
`;

const TabLink = styled(Link)<{ $active: boolean }>`
  min-height: 4.25rem;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.tabActive : theme.colors.tabText};
  background: ${({ $active }) =>
    $active ? "rgba(255, 250, 242, 0.12)" : "transparent"};
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition:
    background 120ms ease,
    color 120ms ease;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.tabActive};
    outline: none;
  }

  @media (max-width: 900px) {
    font-size: 1rem;
    min-height: 3.75rem;
  }
`;

export function TabBar() {
  const pathname = usePathname();

  return (
    <Nav aria-label="Main">
      {TABS.map((tab) => {
        const active =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <TabLink
            key={tab.href}
            href={tab.href}
            $active={active}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </TabLink>
        );
      })}
    </Nav>
  );
}
