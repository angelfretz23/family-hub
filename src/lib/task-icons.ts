/** Simple task icons for Routine / Job cards (emoji for kiosk readability). */

const RULES: Array<{ match: RegExp; icon: string; label: string }> = [
  { match: /morning|wake|breakfast/i, icon: "🌅", label: "Morning" },
  { match: /afternoon|homework|snack|reset/i, icon: "☀️", label: "Afternoon" },
  { match: /evening|wind|pajama|prayer|device|bedtime/i, icon: "🌙", label: "Evening" },
  { match: /bed/i, icon: "🛏️", label: "Bed" },
  { match: /dog|pet|feed/i, icon: "🐕", label: "Pets" },
  { match: /dish|clear|kitchen/i, icon: "🍽️", label: "Dishes" },
  { match: /trash|recycl/i, icon: "🗑️", label: "Trash" },
  { match: /brush|teeth/i, icon: "🪥", label: "Teeth" },
  { match: /dress|clothes/i, icon: "👕", label: "Clothes" },
  { match: /read|book/i, icon: "📖", label: "Reading" },
  { match: /pack|bag/i, icon: "🎒", label: "Pack" },
  { match: /tidy|clean|chore/i, icon: "🧹", label: "Chores" },
];

export function taskIconForTitle(title: string) {
  for (const rule of RULES) {
    if (rule.match.test(title)) return rule.icon;
  }
  return "⭐";
}
