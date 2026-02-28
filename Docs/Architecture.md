# QuickCV_V3 — Architecture & AI-Assisted Development Guide

> A programmatic, fully customisable resume builder hosted on Vercel.
> Built with Next.js 14 (App Router) + PDFKit + Tailwind CSS.
> No drag-and-drop. No templates. Code controls every pixel.

---

## 1. Project Overview

QuickCV_V3 is a personal resume builder where:

- Resume data lives in a single JSON config file
- A Next.js API route generates the PDF programmatically using PDFKit
- The frontend is a live preview + editor UI
- Deployment is a single `git push` to Vercel — no separate backend

**Why PDFKit over HTML-to-PDF (Puppeteer)?**
Puppeteer requires a headless Chromium binary (~170MB), which exceeds Vercel's 50MB serverless function size limit. PDFKit is a pure Node.js library (~2MB) with no browser dependency — it draws text, lines, and shapes directly onto a PDF canvas. Full pixel control, Vercel-compatible.

---

## 2. Recursive Resume Field Breakdown (Complete — Nothing Can Be Missed)

This is the canonical field map. Every section, every sub-field, every edge case a resume can have. The schema in Section 4, the PDF generator in Section 5, and all AI prompts are derived from this. If a field exists here, it must exist in the TypeScript type, the Zod schema, the PDF renderer, and the editor UI.

Read this recursively — each section breaks into fields, each field breaks into its data type and rendering rules.

---

### SECTION 1 — Header (Always Present)

```
header
├── name                    string         Full legal name. Largest font. Bold.
├── title                   string         Role identity. e.g. "Backend Engineer · Go · Distributed Systems"
│                                          Rendered in accent color below name.
└── contact[]               string[]       Flat array, rendered as single line separated by " · "
    ├── email               string         Required
    ├── phone               string         Required. Format: +91 XXXXXXXXXX
    ├── city                string         Required. City, Country only. No full address (ATS + privacy)
    ├── linkedin            string         URL or handle. e.g. "linkedin.com/in/therealshek"
    ├── github              string         URL or handle. e.g. "github.com/TheRealShek"
    └── portfolio           string?        Optional. Personal website URL
```

**Rendering rules:**

- Name: largest element on page. Font Bold, size 22pt minimum.
- Title: accent color, size 10.5pt, directly below name.
- Contact: single line, size 8.5pt, mid-gray. All on one line. If too long — wrap gracefully.
- In PDF: all contact info must be in the body, NOT in a header/footer element — ATS cannot parse headers/footers.

---

### SECTION 2 — Professional Summary (Always Present)

```
summary
└── text                    string         2-4 sentences. Who you are, what you specialise in,
                                           what you're currently building. No bullet points.
```

**Rendering rules:**

- Plain paragraph. No bold, no bullets.
- Size 8.5pt, mid-gray.
- Placed immediately after the header divider line.

---

### SECTION 3 — Skills (Always Present for Tech Resumes)

```
skills[]                    array of skill groups
└── skill
    ├── label               string         Category name. e.g. "Backend", "Databases", "DevOps"
    └── value               string         Comma-separated values. e.g. "Go, gRPC, REST APIs, Worker Pools"
```

**Edge cases:**

- Label column is fixed-width (left). Value column fills remaining width (right).
- If value is very long, it must wrap within its column — not overflow.
- Order matters: most relevant skills first (Languages → Backend → Databases → Messaging → Observability → DevOps → Cloud → Tools)
- Maximum 8-10 skill rows before it becomes noise.

**Rendering rules:**

- Two-column table layout in PDF. Label bold dark, value regular mid-gray.
- No borders on the table — whitespace separates rows.
- Size 8.5pt throughout.

---

### SECTION 4 — Work Experience (Optional for Student/Project-heavy Resumes)

```
experience[]                array
└── job
    ├── title               string         Job title. e.g. "Backend Engineer"
    ├── company             string         Company name
    ├── location            string?        Optional. "Remote" or "City, Country"
    ├── startDate           string         Format: "Jan 2023" or "2023"
    ├── endDate             string         Format: "Jul 2025" or "Present"
    ├── employmentType      string?        Optional. "Full-time" | "Internship" | "Contract" | "Freelance"
    └── bullets[]           string[]       Achievement bullets. 3-6 per role.
        └── bullet          string         Format: Action verb + what + tool + metric
                                           e.g. "Reduced query latency by 40% by adding composite index on (queue, status)"
```

**Edge cases:**

- `endDate` = "Present" must render literally, not as a date.
- Multiple roles at same company: group under company, list roles separately.
- Remote work: show location as "Remote" — increasingly important for 2025 job market.
- Internship vs full-time: employment type shown in meta line, smaller font, italic.

**Rendering rules:**

- Job title: bold, dark, 9.5pt.
- Company + dates + type: single meta line, italic, light-gray, 8.5pt.
- Bullets: "• " prefix, 8.5pt, mid-gray, left indent 12pt.
- 4pt gap between bullets. 8pt gap between jobs.

---

### SECTION 5 — Projects (Primary Section for Student/Early-Career)

```
projects[]                  array
└── project
    ├── name                string         Project name. Bold. e.g. "VanguardQ"
    ├── subtitle            string?        Optional short descriptor. e.g. "Production Task Queue System"
    ├── status              string?        Optional. "In Progress" | "Completed" | "Archived"
    │                                      Rendered in parentheses, italic, light-gray.
    ├── tech                string         Comma-separated tech stack. e.g. "Go · Redis · PostgreSQL · Docker"
    ├── link                string?        Optional. GitHub URL or live URL
    ├── startDate           string?        Optional.
    ├── endDate             string?        Optional.
    └── bullets[]           string[]       3-6 achievement bullets per project.
        └── bullet          string         Same format as experience bullets.
                                           Must include: what you built + how + measurable outcome.
```

**Edge cases:**

- `status: "In Progress"` must be visually distinct but not distracting — italic parenthetical.
- `link` is optional — some projects are internal or private.
- Tech stack should use " · " separator (not commas) for visual clarity in the meta line.
- Bullets must not start with "I" — use action verbs (Built, Designed, Reduced, Implemented).

**Rendering rules:**

- Project name + status: bold 9.5pt dark + italic 8.5pt light-gray in parentheses.
- Tech + link: 8.5pt light-gray. Link in accent color if present.
- 8pt vertical gap between projects.

---

### SECTION 6 — Education (Always Present)

```
education[]                 array (most resumes have 1-2 entries)
└── entry
    ├── degree              string         e.g. "Integrated M.Tech in Software Engineering"
    ├── institution         string         e.g. "Vellore Institute of Technology"
    ├── location            string?        Optional. City, Country
    ├── startYear           string         e.g. "2022"
    ├── endYear             string         e.g. "2027" or "Expected 2027"
    ├── gpa                 string?        Optional. e.g. "8.1 / 10"
    ├── coursework          string?        Optional. Comma-separated relevant courses.
    └── achievements[]      string[]?      Optional. Scholarships, awards, honours.
```

**Edge cases:**

- `endYear` = future year must show "Expected YYYY" for clarity.
- GPA: only include if ≥ 3.5/4.0 or ≥ 8.0/10. If below threshold — omit field, don't show it.
- Coursework: only show if directly relevant to target role. Max 6 courses.

---

### SECTION 7 — Certifications (Optional)

```
certifications[]            array
└── cert
    ├── name                string         e.g. "AWS Certified Developer – Associate"
    ├── issuer              string         e.g. "Amazon Web Services"
    ├── date                string?        Optional. e.g. "Mar 2024"
    └── credentialUrl       string?        Optional. Verification link.
```

**Rendering rules:**

- One line per cert: Name — Issuer (Date)
- Only include if cert is directly relevant to target role.
- Do not include expired certifications.

---

### SECTION 8 — Open Source Contributions (Optional, High Signal for Developers)

```
openSource[]                array
└── contribution
    ├── project             string         e.g. "kubernetes/kubernetes"
    ├── description         string         One line: what you contributed.
    ├── prLink              string?        Optional. PR URL.
    └── impact              string?        Optional. e.g. "Merged. Affects 10k+ users."
```

---

### SECTION 9 — Meta / Style Config (QuickCV_V3 Specific)

```
meta
├── accentColor             string         Hex. e.g. "#1A56DB". Controls: section headers, divider lines, links.
├── fontFamily              string         e.g. "Inter". Must have .ttf file in public/fonts/
├── baseFontSize            number         Points. Range: 8-12. Body text base size.
├── nameSize                number         Points. Range: 18-28. Name font size.
├── titleSize               number         Points. Range: 9-13. Role title font size.
├── pageMargin              number         Points. Range: 30-60. All four margins.
├── sectionSpacing          number         Points. Gap before each new section.
└── bulletSpacing           number         Points. Gap between bullet points.
```

**Why this exists:** The entire visual appearance of the resume is controlled here. Changing `accentColor` from `#1A56DB` to `#059669` changes every accent element in the PDF with one edit. No hunting through the renderer.

---

### Field Completeness Checklist (Give This to AI Before Each Module)

Before generating any module, paste this checklist into your AI prompt:

```
FIELD COMPLETENESS RULES — enforce these across all code you generate:

1. Every field in ResumeData must appear in:
   - TypeScript type (types/resume.ts)
   - Zod schema (lib/schema.ts)
   - PDF renderer (lib/pdf-generator.ts)
   - Editor UI (app/page.tsx or child components)
   - HTML preview (components/Preview/ResumePreview.tsx)

2. Optional fields (marked with ?) must:
   - Be typed as `field?: type` in TypeScript
   - Use .optional() in Zod schema
   - Have null/undefined guards before rendering in PDF
   - Be hidden in UI when empty, not shown as blank

3. Arrays must:
   - Support add / remove / reorder in the editor
   - Render in order in the PDF
   - Handle empty array gracefully (skip section header if array is empty)

4. String fields that are long must:
   - Wrap in PDF (never overflow page width)
   - Have a character hint in the editor UI

5. Date fields must:
   - Accept freeform string (not a date picker) — user controls format
   - Render exactly as typed

6. No field may be hardcoded in the PDF renderer — all values come from ResumeData.
```

---

## 2b. Tech Stack

| Layer         | Technology                        | Why                                            |
| ------------- | --------------------------------- | ---------------------------------------------- |
| Framework     | Next.js 14 (App Router)           | API routes + React frontend, single deployment |
| PDF Engine    | PDFKit (`pdfkit`)                 | Pure Node.js, no headless browser, Vercel-safe |
| Styling       | Tailwind CSS                      | Rapid UI, no custom CSS overhead               |
| Language      | TypeScript                        | Type-safe resume schema, fewer runtime bugs    |
| Hosting       | Vercel (free tier)                | Zero-config deploy, edge network               |
| Font Handling | Google Fonts (downloaded as .ttf) | PDFKit embeds custom fonts at build time       |
| State         | React `useState` + `useReducer`   | No external state library needed               |
| Schema        | JSON + Zod validation             | Single source of truth for resume data         |

**Key constraints to keep in mind:**

- Vercel serverless function max size: 50MB unzipped (PDFKit is safe, Puppeteer is not)
- Vercel response payload limit: 4.5MB (a PDF resume is ~50–200KB, well within limit)
- No persistent storage needed — this is a personal tool, data lives in code

---

## 3. Project Structure

```
quickcv-v3/
├── app/
│   ├── page.tsx                  # Main editor UI
│   ├── layout.tsx                # Root layout
│   └── api/
│       └── generate-pdf/
│           └── route.ts          # POST → returns PDF binary
│
├── lib/
│   ├── resume-data.ts            # Default resume JSON (your data)
│   ├── pdf-generator.ts          # PDFKit rendering logic (core engine)
│   ├── schema.ts                 # Zod schema for resume data
│   └── styles.ts                 # Design tokens (colors, fonts, sizes)
│
├── components/
│   ├── Editor/
│   │   ├── SectionEditor.tsx     # Edit a single resume section
│   │   ├── BulletEditor.tsx      # Edit bullet points inline
│   │   └── StyleControls.tsx     # Font size, color, spacing sliders
│   ├── Preview/
│   │   ├── ResumePreview.tsx     # HTML preview of resume (mirrors PDF)
│   │   └── PreviewSection.tsx    # Individual section renderer
│   └── ui/
│       ├── Button.tsx
│       └── Input.tsx
│
├── public/
│   └── fonts/
│       ├── Inter-Regular.ttf     # Downloaded at setup
│       ├── Inter-Bold.ttf
│       └── Inter-Light.ttf
│
├── types/
│   └── resume.ts                 # TypeScript types for resume schema
│
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 4. Data Schema (Single Source of Truth)

Everything in QuickCV_V3 flows from one JSON object. The PDF generator reads this. The editor writes to this.

```typescript
// types/resume.ts — complete, matches Section 2 field breakdown exactly
export interface ResumeData {
  meta: {
    accentColor: string; // e.g. "#1A56DB"
    fontFamily: string; // e.g. "Inter"
    baseFontSize: number; // body text, points, range 8-12
    nameSize: number; // name font size, range 18-28
    titleSize: number; // role title size, range 9-13
    pageMargin: number; // all four margins, points, range 30-60
    sectionSpacing: number; // gap before each section
    bulletSpacing: number; // gap between bullets
  };

  header: {
    name: string;
    title: string;
    contact: {
      email: string;
      phone: string;
      city: string;
      linkedin?: string;
      github?: string;
      portfolio?: string;
    };
  };

  summary: string;

  skills: {
    label: string; // e.g. "Backend"
    value: string; // e.g. "Go, gRPC, REST APIs, Worker Pools"
  }[];

  experience?: {
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string; // "Present" is valid
    employmentType?: string; // "Full-time" | "Internship" | "Contract" | "Freelance"
    bullets: string[];
  }[];

  projects: {
    name: string;
    subtitle?: string;
    status?: string; // "In Progress" | "Completed" | "Archived"
    tech: string;
    link?: string;
    startDate?: string;
    endDate?: string;
    bullets: string[];
  }[];

  education: {
    degree: string;
    institution: string;
    location?: string;
    startYear: string;
    endYear: string; // "Expected 2027" is valid
    gpa?: string; // omit if below threshold — never show a bad GPA
    coursework?: string;
    achievements?: string[];
  }[];

  certifications?: {
    name: string;
    issuer: string;
    date?: string;
    credentialUrl?: string;
  }[];

  openSource?: {
    project: string; // e.g. "kubernetes/kubernetes"
    description: string;
    prLink?: string;
    impact?: string;
  }[];
}
```

---

## 5. Core Engine — PDF Generator

`lib/pdf-generator.ts` is the heart of the project. It takes `ResumeData` and returns a `Buffer` (binary PDF). This is what you customise when you want to change fonts, colors, spacing, or layout.

```typescript
// lib/pdf-generator.ts (structure)
import PDFDocument from 'pdfkit'

export async function generateResumePDF(data: ResumeData): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: data.meta.pageMargin, ... },
    compress: true,
  })

  // Register custom fonts
  doc.registerFont('Regular', 'public/fonts/Inter-Regular.ttf')
  doc.registerFont('Bold', 'public/fonts/Inter-Bold.ttf')

  // Render sections in order
  renderHeader(doc, data.header, data.meta)
  renderDivider(doc, data.meta.accentColor)
  renderSummary(doc, data.summary, data.meta)
  renderSkills(doc, data.skills, data.meta)
  renderProjects(doc, data.projects, data.meta)
  renderEducation(doc, data.education, data.meta)

  doc.end()

  // Convert stream to Buffer (required for API response)
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })
}
```

**Key PDFKit concepts you need to know:**

- `doc.text(str, x, y, options)` — places text at absolute or current position
- `doc.moveTo(x1,y1).lineTo(x2,y2).stroke()` — draws the accent divider lines
- `doc.fillColor('#hex').fontSize(n).font('Bold')` — style chaining
- `doc.y` — current cursor Y position (auto-advances after text)
- `doc.moveDown(n)` — add vertical spacing
- `doc.page.margins` — page boundary awareness

---

## 6. API Route — PDF Generation Endpoint

```typescript
// app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateResumePDF } from "@/lib/pdf-generator";
import { resumeSchema } from "@/lib/schema";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate schema
  const parsed = resumeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const pdfBuffer = await generateResumePDF(parsed.data);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="resume.pdf"',
    },
  });
}
```

**Vercel limits that matter here:**

- Function size: PDFKit + Inter fonts ≈ 5MB total. Safe.
- Response size: Resume PDF ≈ 100–200KB. Safe (limit is 4.5MB).
- Execution time: PDF generation takes ~50–200ms. Safe (limit is 10s on free tier).

---

## 7. Frontend — Editor + Preview

The UI has two panels:

- **Left:** Form editor — edit name, bullets, colors, font sizes
- **Right:** HTML preview — mirrors the PDF layout using Tailwind

The HTML preview is NOT the PDF. It's an approximation that gives instant visual feedback. The real PDF is generated when you click "Download."

```
User edits field
      ↓
React state updates (useReducer)
      ↓
HTML preview re-renders instantly (no API call)
      ↓
User clicks "Download PDF"
      ↓
POST /api/generate-pdf with current state
      ↓
Browser receives PDF binary → triggers download
```

**Why no live PDF preview?** PDFKit runs server-side. Regenerating a PDF on every keystroke would be slow and wasteful. HTML preview is instant. The PDF is the final artifact.

---

## 8. Style System — Design Tokens

All visual decisions live in one file. Change here, changes everywhere.

```typescript
// lib/styles.ts
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
  },
  margins: {
    page: { top: 32, bottom: 32, left: 40, right: 40 },
  },
};
```

---

## 9. Module-wise AI Development Cycle

This is the exact order to build with AI (Cursor / Claude / v0). Each module is self-contained and can be handed to AI with a specific prompt. Build in this order — each module depends on the previous.

---

### Module 1 — Project Scaffold & Schema

**What to build:** Next.js project, TypeScript, Tailwind, PDFKit installed, font files downloaded, Zod schema defined.

**AI Prompt:**

```
Create a Next.js 14 app router project with TypeScript and Tailwind CSS.
Install pdfkit and zod.
Create a types/resume.ts file with this exact TypeScript interface: [paste ResumeData interface]
Create a lib/schema.ts file with a Zod schema matching the TypeScript interface.
Create lib/resume-data.ts with this sample data: [paste your resume JSON]
Download Inter-Regular.ttf, Inter-Bold.ttf, Inter-Light.ttf from Google Fonts
and place them in public/fonts/.
Do not create any UI yet.
```

**Done when:** `npm run dev` starts with no errors. Schema validates sample data.

---

### Module 2 — PDF Generator Core

**What to build:** `lib/pdf-generator.ts` — the full PDFKit rendering engine.

**AI Prompt:**

```
Create lib/pdf-generator.ts in a Next.js 14 TypeScript project.
Import PDFDocument from 'pdfkit'.
Import ResumeData from '@/types/resume'.
Import DESIGN from '@/lib/styles'.

Create and export an async function generateResumePDF(data: ResumeData): Promise<Buffer>.

The function must:
1. Create a PDFDocument with LETTER size and margins from DESIGN
2. Register Inter-Regular.ttf and Inter-Bold.ttf from public/fonts/
3. Render in this order: header, horizontal accent line, summary, skills table, projects, education
4. Use exact hex colors from DESIGN.colors
5. Draw section divider lines using doc.moveTo().lineTo().strokeColor().lineWidth().stroke()
6. Return a Buffer by collecting doc stream chunks

For the header section:
- Name: font Bold, size 22, color DESIGN.colors.dark
- Title: font Regular, size 10.5, color DESIGN.colors.accent
- Contact: font Regular, size 8.5, color DESIGN.colors.mid, all on one line separated by " · "

For each project:
- Name bold, status italic in parentheses if present
- Tech + link on second line, color DESIGN.colors.light, size 8.5
- Bullets: "• " prefix, size 8.5, leftIndent 12

All spacing must come from DESIGN.spacing constants.
Do not use any external libraries other than pdfkit.
```

**Done when:** Running the generator standalone produces a valid PDF file matching the resume layout.

---

### Module 3 — API Route

**What to build:** `app/api/generate-pdf/route.ts`

**AI Prompt:**

```
Create app/api/generate-pdf/route.ts in Next.js 14 App Router.
Export an async POST handler.
Parse the request body as JSON.
Validate with resumeSchema from '@/lib/schema' using safeParse.
If invalid, return 400 with error details.
If valid, call generateResumePDF from '@/lib/pdf-generator'.
Return the Buffer as a NextResponse with:
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="resume.pdf"
Do not add authentication. Do not add rate limiting. Keep it minimal.
```

**Done when:** `curl -X POST /api/generate-pdf -d '{...valid resume JSON...}'` returns a downloadable PDF.

---

### Module 4 — HTML Preview Component

**What to build:** `components/Preview/ResumePreview.tsx` — a pixel-approximate HTML version of the PDF.

**AI Prompt:**

```
Create components/Preview/ResumePreview.tsx in Next.js 14 with TypeScript and Tailwind CSS.
Accept a prop: data: ResumeData from '@/types/resume'.
Render an HTML approximation of the PDF layout inside a fixed-size white div (8.5in x 11in scaled).
Use inline styles where needed to match the PDF design exactly:
  - Accent color: data.meta.accentColor
  - Font sizes matching the PDF (use rem equivalents)
  - Section headers with a bottom border in accent color
  - Project bullets with "•" prefix
  - Skills as a two-column layout (label bold left, value right)
This is read-only. No edit functionality in this component.
Scale the preview to fit the viewport using CSS transform: scale().
```

**Done when:** The HTML preview visually mirrors the generated PDF at 90%+ accuracy.

---

### Module 5 — Editor UI

**What to build:** `app/page.tsx` + editor components — the form that edits resume data.

**AI Prompt:**

```
Create app/page.tsx as the main page for QuickCV_V3.
Import ResumeData from '@/types/resume'.
Import defaultResumeData from '@/lib/resume-data'.
Import ResumePreview from '@/components/Preview/ResumePreview'.

Use useReducer to manage ResumeData state, initialised with defaultResumeData.

Layout: two-column flex. Left column = editor. Right column = ResumePreview (live updates on every state change).

Left column must have these editors:
1. Header editor: text inputs for name, title. Textarea for contact line.
2. Summary editor: textarea.
3. Skills editor: list of label/value pairs with add/remove buttons.
4. Projects editor: list of projects, each with name, status, tech, link inputs,
   and a list of bullet textareas with add/remove.
5. Style controls: color picker for accentColor, number input for baseFontSize (range 8-12).

At the top: a "Download PDF" button that POSTs current state to /api/generate-pdf
and triggers browser file download on response.

Use Tailwind for all styling. Keep the editor minimal and functional, not beautiful.
```

**Done when:** Editing any field updates the live preview. Download button produces a correct PDF with loading state, error toast, and disabled state during generation.

**Download button must implement this exact pattern — no exceptions:**

```tsx
// In app/page.tsx

const [isGenerating, setIsGenerating] = useState(false);
const [error, setError] = useState<string | null>(null);

async function handleDownload() {
  setIsGenerating(true);
  setError(null);

  try {
    const res = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resumeState),
    });

    if (!res.ok) {
      // Surface the actual error from the API, not a generic message
      const body = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(body.error ?? `Server error ${res.status}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    setError(err instanceof Error ? err.message : "PDF generation failed");
  } finally {
    setIsGenerating(false);
  }
}

// Button render:
<button
  onClick={handleDownload}
  disabled={isGenerating}
  className={`px-4 py-2 rounded text-white font-medium transition-opacity
    ${isGenerating ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
  style={{ backgroundColor: resumeState.meta.accentColor }}
>
  {isGenerating ? "Generating..." : "Download PDF"}
</button>;

// Error toast — shown below button, auto-clears after 5s:
{
  error && (
    <div
      className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700"
      role="alert"
    >
      {error}
    </div>
  );
}
```

**Error messages that must be surfaced (not swallowed):**

- Schema validation failure → show which field failed
- Font file not found (Vercel path issue) → "Font file missing — check public/fonts/"
- Cold start timeout → "Generation timed out — try again"
- Generic 500 → show raw error from API response body, not a hardcoded string

**The API route must also return structured errors:**

```typescript
// In app/api/generate-pdf/route.ts — error responses
if (!parsed.success) {
  return NextResponse.json(
    {
      error: `Schema error: ${parsed.error.issues[0].message} at ${parsed.error.issues[0].path.join(".")}`,
    },
    { status: 400 },
  );
}

try {
  const pdfBuffer = await generateResumePDF(parsed.data);
  // ...return PDF
} catch (err) {
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "PDF generation failed" },
    { status: 500 },
  );
}
```

---

### Module 6 — Style Controls & Polish

**What to build:** `components/Editor/StyleControls.tsx` — font, color, spacing customisation.

**AI Prompt:**

```
Create components/Editor/StyleControls.tsx.
Accept: meta from ResumeData and an onChange callback.
Render these controls:
  - Color picker input for accentColor (label: "Accent Color")
  - Number slider (range 8-12, step 0.5) for baseFontSize (label: "Font Size")
  - Number slider (range 30-60) for pageMargin (label: "Page Margin")
All controls call onChange immediately on change, updating the parent state.
Use Tailwind, minimal styling.
```

**Done when:** Changing accent color immediately updates both the HTML preview and the generated PDF.

---

## 10. Pagination & Layout Control

This is the hardest part of programmatic PDF generation. PDFKit does not have a layout engine — it has a cursor. You are responsible for knowing where you are on the page and what to do when you run out of space.

---

### The Core Problem

PDFKit's `doc.y` tells you the current Y position. The page height for LETTER is 792pt. Your bottom margin is ~40pt. So your usable height is `792 - topMargin - bottomMargin = ~720pt`.

When `doc.y` exceeds the usable height, PDFKit automatically adds a new page — but it does so mid-element. A bullet point can be split across pages. A section header can appear at the bottom of page 1 with its content on page 2. This is the widows/orphans problem.

---

### Strategy: Measure Before You Draw Using `heightOfString`

The naive approach — dividing `widthOfString` by available width — is inaccurate. PDFKit wraps by word boundaries, not character width. A bullet with long words will miscalculate.

**The correct approach:** use PDFKit's built-in `heightOfString(text, options)` which accounts for word wrapping, line height, and the exact font metrics at render time.

```typescript
// lib/layout.ts

// Page dimensions come from meta, not hardcoded constants
export type PageSize = "LETTER" | "A4";

export const PAGE_DIMENSIONS: Record<
  PageSize,
  { width: number; height: number }
> = {
  LETTER: { width: 612, height: 792 },
  A4: { width: 595, height: 842 },
};

export function getUsableHeight(
  pageSize: PageSize,
  topMargin: number,
  bottomMargin: number,
): number {
  return PAGE_DIMENSIONS[pageSize].height - topMargin - bottomMargin;
}

export function remainingSpace(
  doc: PDFKit.PDFDocument,
  pageSize: PageSize,
  bottomMargin: number,
): number {
  return PAGE_DIMENSIONS[pageSize].height - doc.y - bottomMargin;
}

export function willFit(
  doc: PDFKit.PDFDocument,
  neededHeight: number,
  pageSize: PageSize,
  bottomMargin: number,
): boolean {
  return remainingSpace(doc, pageSize, bottomMargin) >= neededHeight;
}

export function addPageIfNeeded(
  doc: PDFKit.PDFDocument,
  neededHeight: number,
  pageSize: PageSize,
  bottomMargin: number,
): void {
  if (!willFit(doc, neededHeight, pageSize, bottomMargin)) {
    doc.addPage();
  }
}

// CORRECT height measurement — uses PDFKit word-wrap engine, not naive division
export function measureTextHeight(
  doc: PDFKit.PDFDocument,
  text: string,
  options: { width: number; lineGap?: number },
): number {
  return doc.heightOfString(text, {
    width: options.width,
    lineGap: options.lineGap ?? 2,
  });
}
```

**Why `heightOfString` beats the naive approach:**

- It uses the exact same font metrics PDFKit will use when rendering
- It respects word boundaries — "Reduced p99 latency by 40% through composite index on (queue, status)" wraps differently than pure character math predicts
- It accounts for `lineGap` you set on the document
- No calibration table needed — it's accurate on first run

---

### Page Break Rules (Enforce These in the Renderer)

Pass `meta.pageSize` and `meta.pageMargin` everywhere — no hardcoded 792.

**Rule 1 — Never orphan a section header.**

```typescript
const headerHeight =
  measureTextHeight(doc, "PROJECTS", { width: availableWidth }) + 22;
addPageIfNeeded(doc, headerHeight + 28, meta.pageSize, meta.pageMargin); // header + 2 bullets
renderSectionHeader(doc, "PROJECTS", meta);
```

**Rule 2 — Never split a project header from its first bullet.**

```typescript
const headerBlockHeight =
  measureTextHeight(doc, project.name, { width: availableWidth }) +
  measureTextHeight(doc, project.tech, { width: availableWidth }) +
  (project.bullets[0]
    ? measureTextHeight(doc, project.bullets[0], { width: availableWidth - 12 })
    : 0);

addPageIfNeeded(doc, headerBlockHeight, meta.pageSize, meta.pageMargin);
renderProjectHeader(doc, project, meta);
```

**Rule 3 — Each bullet measured with `heightOfString`, not estimated.**

```typescript
for (const bullet of project.bullets) {
  const h = measureTextHeight(doc, "• " + bullet, {
    width: availableWidth - 12,
  });
  addPageIfNeeded(doc, h, meta.pageSize, meta.pageMargin);
  renderBullet(doc, bullet, meta);
}
```

---

### Add `pageSize` to Meta Schema

```typescript
meta: {
  // ...existing fields
  pageSize: "LETTER" | "A4"; // default: 'LETTER'. Controls all dimension constants.
}
```

All layout utilities read from `meta.pageSize`. No constants are hardcoded in the renderer. Switching from LETTER to A4 requires changing one field in `resume-data.ts`.

---

### HTML Preview Drift — Controlling It

The HTML preview will diverge from the PDF over time. This is unavoidable but manageable:

**Rule:** The HTML preview is a fast-feedback tool, not a pixel-perfect replica. Communicate this clearly in the UI — add a small label: _"Preview is approximate. Download PDF for exact output."_

**To minimise drift:**

- Use the same font (Inter) in the HTML preview via Google Fonts import
- Mirror font sizes exactly using inline styles, not Tailwind classes (Tailwind's `text-sm` is 14px, your PDF body is 8.5pt ≈ 11.3px — they are not the same)
- Set the preview container to fixed 612px width (LETTER) or 595px (A4) — not a fluid container
- Use `transform: scale()` on the outer wrapper to fit the viewport

```tsx
// components/Preview/ResumePreview.tsx
const PREVIEW_WIDTH = meta.pageSize === 'A4' ? 595 : 612

<div
  style={{
    width: `${PREVIEW_WIDTH}px`,
    fontFamily: 'Inter, sans-serif',
    transform: `scale(${containerWidth / PREVIEW_WIDTH})`,
    transformOrigin: 'top left',
  }}
>
  {/* sections */}
</div>
```

**Do not use Tailwind utility classes for font sizes in the preview** — use inline `style={{ fontSize: '8.5pt' }}` to match PDF values exactly.

---

### Dynamic Section Reordering

For V1 — sections render in hardcoded order. This is fine.

For V2 — add `sectionOrder` to `meta`:

```typescript
meta: {
  sectionOrder?: Array<
    'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'certifications' | 'openSource'
  >
}
```

Default order: `[summary, skills, experience, projects, education, certifications, openSource]`

Renderer iterates `sectionOrder`, calls matching render function, skips sections with no data. Do not build this in V1.

---

### Layout Abstraction (V2 Consideration)

```
lib/
├── pdf-generator.ts          // orchestrator
├── templates/
│   ├── single-column.ts      // current layout (V1)
│   └── two-column.ts         // future layout (V2)
└── layout.ts                 // shared: willFit, addPageIfNeeded, estimateBulletHeight
```

`pdf-generator.ts` reads `meta.template` (default: `single-column`) and delegates. Do not build this now — document it so V1 structure does not block V2.

---

## 11. Layout Measurement Rules — Non-Negotiable

Four rules that must be enforced every time `heightOfString` or `measureTextHeight` is called. Violating any one of these causes layout drift that is hard to debug.

---

**Rule 1 — Set font state before measuring.**

`heightOfString` uses the document's current font and font size to calculate metrics. If you measure before setting the font, you get the wrong height.

```typescript
// WRONG — measures with whatever font was last set
const h = doc.heightOfString(bullet, { width });

// CORRECT — set font state first, then measure
doc.font("Regular").fontSize(meta.baseFontSize);
const h = doc.heightOfString(bullet, { width, lineGap: meta.bulletSpacing });
```

This means `measureTextHeight` must always receive the font name and size, not just the text:

```typescript
// Updated signature
export function measureTextHeight(
  doc: PDFKit.PDFDocument,
  text: string,
  options: {
    width: number;
    font: string; // e.g. 'Regular' | 'Bold'
    fontSize: number; // points
    lineGap?: number;
  },
): number {
  doc.font(options.font).fontSize(options.fontSize);
  return doc.heightOfString(text, {
    width: options.width,
    lineGap: options.lineGap ?? 0,
  });
}
```

After measuring, restore the font state if the next draw call expects a different font. Or — better — always set font state explicitly before every draw call, never assume it carried over.

---

**Rule 2 — lineGap must match between measurement and render.**

If you render bullets with `lineGap: 2` but measure with `lineGap: 0`, every bullet will be slightly shorter than measured. Over many bullets this compounds into a visible layout shift — bullets appear higher than expected, or a section header ends up orphaned despite the check passing.

**Solution:** Store `lineGap` per element type in `DESIGN.spacing` and use it consistently:

```typescript
// lib/styles.ts
export const DESIGN = {
  spacing: {
    bulletLineGap: 2,
    bodyLineGap: 2,
    metaLineGap: 1,
  },
};

// Both measurement and render use the same constant:
const h = measureTextHeight(doc, text, {
  width,
  font: "Regular",
  fontSize: meta.baseFontSize,
  lineGap: DESIGN.spacing.bulletLineGap, // same value used when drawing
});

// ...then when drawing:
doc.font("Regular").fontSize(meta.baseFontSize);
doc.text(text, x, doc.y, { width, lineGap: DESIGN.spacing.bulletLineGap });
```

Never hardcode `lineGap` inline in renderer calls — always reference `DESIGN.spacing`.

---

**Rule 3 — Performance is not a concern for resumes, but measure once per render pass.**

A resume has ~30-80 text blocks. `heightOfString` on each is negligible — under 5ms total. Do not cache measurements between renders or pre-compute a layout pass. The font state dependency in Rule 1 makes caching dangerous — cached values become stale if font changes.

Measure immediately before drawing. Keep the measure-then-draw pattern tight:

```typescript
// CORRECT pattern — measure and draw stay together
const h = measureTextHeight(doc, bullet, {
  width,
  font: "Regular",
  fontSize: 8.5,
  lineGap: 2,
});
addPageIfNeeded(doc, h, meta.pageSize, meta.pageMargin);
doc.font("Regular").fontSize(8.5);
doc.text("• " + bullet, x, doc.y, { width: width - 12, lineGap: 2 });
```

Do not split measurement into a separate pre-pass loop. The font state at measurement time must match the font state at draw time — keeping them adjacent enforces this.

---

**Rule 4 — HTML preview must never use Tailwind text utilities.**

Tailwind's text scale does not map to PDF point sizes:

| Tailwind class | CSS px | PDF pt equivalent | Match?              |
| -------------- | ------ | ----------------- | ------------------- |
| `text-xs`      | 12px   | 9pt               | Close but not exact |
| `text-sm`      | 14px   | 10.5pt            | Off                 |
| `text-base`    | 16px   | 12pt              | Wrong for body      |

Use inline styles for every font size in the preview, referencing the same values from `DESIGN`:

```tsx
// WRONG
<p className="text-sm text-gray-500">{bullet}</p>

// CORRECT
<p style={{ fontSize: `${DESIGN.fonts.body}pt`, color: DESIGN.colors.mid, lineHeight: 1.4 }}>
  {bullet}
</p>
```

Tailwind is acceptable for layout (flex, grid, padding, margin) but must never control font sizes or colors in the preview. Colors must also use exact hex values from `DESIGN.colors`, not Tailwind's gray scale.

---

## 12. Known Gotchas

**PDFKit font registration path in Next.js:**
PDFKit reads fonts from the filesystem. In Vercel production, `public/` is accessible at `process.cwd() + '/public/fonts/filename.ttf'`. Use `path.join(process.cwd(), 'public', 'fonts', 'Inter-Regular.ttf')` — never a relative path.

**PDF generation is synchronous inside an async wrapper:**
PDFKit uses streams internally. You must collect chunks and resolve a Promise manually (shown in Module 2 prompt). Do not `await doc.end()` — it doesn't return a Promise.

**HTML preview ≠ PDF pixel-perfect:**
HTML/CSS and PDFKit calculate text wrapping differently. Accept ~5% visual difference. The PDF is the source of truth.

**Vercel cold starts:**
First request after inactivity may take 500–1500ms due to serverless cold start. For a personal tool this is fine. Do not over-engineer caching.

**Font subsetting:**
PDFKit embeds the entire font file into the PDF. Inter-Regular.ttf is ~300KB. If PDF size matters, use a subsetting tool or switch to PDFKit's built-in Helvetica (no file needed, but less control).

---

## 11. Deployment

```bash
# One-time setup
npm install
# Place Inter .ttf files in public/fonts/

# Local dev
npm run dev

# Deploy
git push origin main
# Vercel auto-deploys on push if connected to GitHub
```

No environment variables needed. No database. No auth. This is a personal tool — keep it that way.

---

## 12. Future Extensions (Do Not Build Now)

- Multiple resume templates (different `pdf-generator` functions)
- Auto-save to localStorage
- Share resume via URL (base64 encoded JSON in query param)
- ATS score checker (POST resume text to an AI API)

Build these only after the core 6 modules are complete and working.

---

_QuickCV_V3 — built to be owned, not subscribed to._
