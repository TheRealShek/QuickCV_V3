# AGENTS.md

> **Project:** A programmatic, fully customisable resume builder with live HTML preview and server-side PDF generation.
> **Stack:** TypeScript · Next.js 14 (App Router) · PDFKit · Tailwind CSS

---

## Commands

<!-- Add only non-standard or non-obvious commands. Standard ones (npm install, go test) → skip. -->
*(No non-standard commands required)*

---

## Gotchas

<!-- Each line = a real mistake that happened. Delete once fixed in code. -->

- PDFKit must be marked as external in `next.config.mjs` (`experimental.serverComponentsExternalPackages: ["pdfkit"]`) because its dynamic `require()` for font data files breaks Next.js Webpack bundling.
- The Inter font files in `public/fonts/` are bundled with the deployment. Ensure PDFKit correctly resolves these paths in serverless functions.

---

## Rules

<!-- Project-specific only. If it applies to every project everywhere, delete it. -->

- Use Tailwind CSS for styling, preserving the core design aesthetics requested.

---

## Verified

Last verified: `2026-06-07`
