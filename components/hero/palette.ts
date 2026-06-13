// Per-cell decorative highlight palette for the CupCal animated hero.
// Section 6 of docs/cupcal-hero-spec.md.

export const PALETTE = [
  "#E0A82E",
  "#10B981",
  "#38A8E0",
  "#F2683C",
  "#7C6BE8",
  "#14B8A6",
  "#EC5B86",
];

// Neighbors always differ (rotate by 3 each row).
export const cellColor = (col: number, row: number) =>
  PALETTE[(col + row * 3) % PALETTE.length];
