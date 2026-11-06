export const theme = {
  colors: {
    ink: "#1c2a24",
    inkMuted: "#4d5f56",
    panel: "rgba(255, 252, 247, 0.78)",
    panelStrong: "rgba(255, 252, 247, 0.92)",
    stroke: "rgba(28, 42, 36, 0.12)",
    accent: "#c9852d",
    accentInk: "#3a2408",
    tabBg: "rgba(20, 36, 30, 0.92)",
    tabText: "rgba(255, 252, 247, 0.72)",
    tabActive: "#fffaf2",
    cream: "#fffaf2",
  },
  shadow: {
    soft: "0 18px 50px rgba(28, 42, 36, 0.08)",
  },
  sizes: {
    touch: "3.5rem",
    radius: "1.25rem",
  },
  fonts: {
    display: "var(--font-display), Fraunces, serif",
    body: "var(--font-body), Figtree, sans-serif",
  },
  background: `
    radial-gradient(1200px 700px at 12% -10%, rgba(201, 133, 45, 0.18), transparent 55%),
    radial-gradient(900px 600px at 100% 0%, rgba(63, 111, 91, 0.28), transparent 50%),
    linear-gradient(160deg, #d7e4dc 0%, #e7efe8 42%, #f3efe6 100%)
  `,
} as const;

export type AppTheme = typeof theme;
