import { TabBar } from "@/components/TabBar";

export default function HubLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="hub-shell">
      <main className="hub-main">{children}</main>
      <TabBar />
    </div>
  );
}
