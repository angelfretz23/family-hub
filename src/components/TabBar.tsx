"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/today", label: "Today" },
  { href: "/calendar", label: "Calendar" },
  { href: "/jobs", label: "Jobs" },
  { href: "/routines", label: "Routines" },
  { href: "/rules", label: "Rules" },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="tab-bar" aria-label="Main">
      {TABS.map((tab) => {
        const active =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={active ? "tab-item tab-item-active" : "tab-item"}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
