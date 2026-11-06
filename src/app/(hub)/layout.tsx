import { TabBar } from "@/components/TabBar";
import { HubMain, HubShell } from "@/components/layout";

export default function HubLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HubShell>
      <HubMain>{children}</HubMain>
      <TabBar />
    </HubShell>
  );
}
