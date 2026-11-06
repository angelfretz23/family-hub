import type { ReactNode } from "react";

type HubChromeProps = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export function HubChrome({ title, subtitle, trailing }: HubChromeProps) {
  return (
    <header className="hub-chrome">
      <div className="hub-chrome-copy">
        <h1 className="hub-title">{title}</h1>
        {subtitle ? <p className="hub-subtitle">{subtitle}</p> : null}
      </div>
      {trailing ? <div className="hub-chrome-trailing">{trailing}</div> : null}
    </header>
  );
}
