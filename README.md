# QuickCV_V3

A programmatic, fully customisable resume builder. No drag-and-drop. No templates. Code controls every pixel.

Built with Next.js 14 (App Router) + PDFKit + Tailwind CSS.

## Features

- **Live HTML preview** — instant feedback as you edit
- **PDF generation** — PDFKit renders pixel-perfect output server-side
- **Full style control** — accent color, font sizes, margins, page size (Letter / A4)
- **All resume sections** — Header, Summary, Skills, Experience, Projects, Education, Certifications, Open Source
- **Single deployment** — API route + frontend in one Next.js app

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Framework preset: **Next.js** (auto-detected)
4. No environment variables needed
5. Deploy

The Inter font files in `public/fonts/` are bundled with the deployment. PDFKit is marked as an external package in `next.config.mjs` so it resolves correctly in serverless functions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| PDF Engine | PDFKit |
| Styling | Tailwind CSS |
| Validation | Zod |
| Fonts | Inter (300/400/700) |
| Hosting | Vercel |
