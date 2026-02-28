// lib/styles.ts — Design tokens. All visual decisions live here.
// Change here, changes everywhere. Referenced by PDF renderer and HTML preview.

export const DESIGN = {
  colors: {
    accent: "#1A56DB",
    dark: "#111827",
    mid: "#374151",
    light: "#6B7280",
  },
  fonts: {
    name: 22,
    sectionHeader: 9.5,
    jobTitle: 9.5,
    body: 8.5,
    meta: 8.5,
  },
  spacing: {
    sectionGap: 10, // points before each section
    bulletGap: 2, // points between bullets
    lineThickness: 0.8, // accent divider line weight

    // lineGap values — must match between measurement and render (Section 11, Rule 2)
    bulletLineGap: 2,
    bodyLineGap: 2,
    metaLineGap: 1,
  },
  margins: {
    page: { top: 32, bottom: 32, left: 40, right: 40 },
  },
} as const;
