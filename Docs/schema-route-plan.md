# `/schema` Route — Implementation Plan

> **Goal:** User visits `/schema` → sees expected JSON structure + copy-ready AI prompt → pastes into AI → gets importable resume JSON. Zero changes to existing PDF/preview logic.

---

## Codebase Analysis Summary

| Asset | Path | Key Detail |
|-------|------|------------|
| TS types | `types/resume.ts` | `ResumeData` interface — the canonical shape |
| Zod schema | `lib/schema.ts` | `resumeSchema` — already validates on import |
| Import logic | `components/Editor/DataControls.tsx` | `resumeSchema.safeParse()` + merge with defaults |
| Default data | `lib/resume-data.ts` | `defaultResumeData` — sample empty shape |
| Top bar | `app/page.tsx` (L239–255) | Header with DataControls + Download PDF |
| Dependencies | `package.json` | **Zod `^4.3.6` already installed** |

---

## Design Decisions

### 1. Zod vs Manual Mirror — **Use Zod (already there)**

The project already has `zod@^4.3.6` as a dependency and `lib/schema.ts` is a complete Zod mirror of the TS types. The sync burden already exists and is already being maintained — `DataControls.tsx` calls `resumeSchema.safeParse()` on every import. So:

- Zero new sync burden — schema already tracks types
- Use Zod 4's native `z.toJSONSchema()` to auto-generate JSON Schema from the existing `resumeSchema`
- If `z.toJSONSchema()` isn't available in the installed version, fall back to `zod-to-json-schema` (one small dep)

### 2. Annotation Format — **Inline `.describe()` on Zod fields**

Rather than a separate annotation map or comment-based approach, enrich the existing Zod schema with `.describe()`:

```typescript
// Before
const metaSchema = z.object({
  accentColor: z.string(),
  baseFontSize: z.number().min(8).max(12),
});

// After
const metaSchema = z.object({
  accentColor: z.string().describe("Hex color for headings and links, e.g. '#1A56DB'"),
  baseFontSize: z.number().min(8).max(12).describe("Body text size in points (8–12)"),
});
```

- Annotations co-located with validation rules — single source of truth
- `z.toJSONSchema()` automatically emits `description` fields in output
- No separate file to maintain, no comments to parse

### 3. AI Prompt Output — **Plain JSON, no fences**

Instruct the AI to return raw JSON (no markdown code fences):

- The existing import path in `DataControls` does `JSON.parse(text)` directly — markdown fences would break it
- Adding a strip step means maintaining regex to handle variations (`` ```json ``, `` ``` ``, etc.) — fragile
- The prompt explicitly says: *"Return ONLY the JSON object. No markdown, no explanation, no code fences."*
- This is the industry standard for structured AI output

### 4. Import Validation — **Existing import logic handles it**

No validation on the `/schema` page itself. The import flow is already solid:

```
DataControls.handleFileChange()
  → JSON.parse(text)
  → resumeSchema.safeParse(parsedJSON)  ← Zod validation
  → merge with defaultResumeData        ← backfill optionals
  → onImport(merged)
```

The `/schema` page is read-only documentation. Validation stays in `DataControls.tsx`. No duplication needed.

### 5. Entry Point — **Both: DataControls area + standalone route**

- Add a small "📋 AI Import" link next to the existing Import/Export buttons in `DataControls`
- The `/schema` route works standalone (bookmarkable, shareable)
- No nav bar exists — just a minimal top bar. Adding a nav item would be over-engineering for a single-page app

---

## Implementation Phases

### Phase 1: Enrich Zod Schema with Descriptions

**File:** `lib/schema.ts`

Add `.describe()` calls to every field in the existing Zod schema. This changes zero runtime behavior — `.describe()` is metadata-only. Existing `safeParse()` calls are unaffected.

Fields to annotate:

| Section | Fields |
|---------|--------|
| `meta` | accentColor, baseFontSize, nameSize, titleSize, pageMargin, sectionSpacing, bulletSpacing, pageSize, hiddenSections, sectionOrder |
| `contact` | email, phone, city, linkedin, github, portfolio |
| `header` | name, title |
| `skills[]` | label, value |
| `experience[]` | title, company, location, startDate, endDate, employmentType, bullets |
| `projects[]` | name, subtitle, status, tech, link, startDate, endDate, bullets |
| `education[]` | degree, institution, location, startYear, endYear, gpa, coursework, achievements |
| `certifications[]` | name, issuer, date, credentialUrl |
| `openSource[]` | project, description, prLink, impact |

### Phase 2: Create Schema Utility

**New file:** `lib/schema-doc.ts`

Responsibilities:
1. Convert `resumeSchema` → JSON Schema (via Zod 4's `z.toJSONSchema()`)
2. Export a realistic filled-in example resume (not the empty `defaultResumeData`)
3. Build the copy-ready AI prompt string

```typescript
// lib/schema-doc.ts
import { z } from "zod";
import { resumeSchema } from "./schema";

/** Machine-readable JSON Schema derived from the Zod source of truth */
export function getJSONSchema() {
  return z.toJSONSchema(resumeSchema, { target: "draft-2020-12" });
}

/** Realistic example demonstrating all fields including optionals */
export const exampleResume = { /* ... full realistic example ... */ };

/** Copy-ready AI prompt */
export function buildAIPrompt(): string {
  return `You are a resume data assistant. Generate a JSON object matching the QuickCV schema below.

RULES:
- Return ONLY the raw JSON object. No markdown, no code fences, no explanation.
- All required fields must be present. Optional fields can be omitted.
- "endDate" accepts "Present". "endYear" accepts "Expected 2027".
- "employmentType": "Full-time" | "Internship" | "Contract" | "Freelance".
- "status": "In Progress" | "Completed" | "Archived".
- "pageSize": "LETTER" or "A4".
- Omit "gpa" if below 3.5.
- Keep bullet points concise, action-oriented (start with a strong verb).

JSON SCHEMA:
${JSON.stringify(getJSONSchema(), null, 2)}

EXAMPLE:
${JSON.stringify(exampleResume, null, 2)}

Now generate a resume JSON for the following person:`;
}
```

### Phase 3: Create `/schema` Page

**New file:** `app/schema/page.tsx`

A server component page that renders:

1. **Hero section** — explains the 3-step workflow (copy prompt → AI generates → import JSON)
2. **AI Prompt block** — the full prompt with one-click copy button
3. **JSON Schema viewer** — syntax-highlighted, collapsible JSON Schema output with copy button
4. **Example JSON** — a realistic filled example with copy button
5. **Import instructions** — step-by-step guide back to main editor
6. **"← Back to Editor" link**

```
┌─────────────────────────────────────────────────┐
│  📋 QuickCV Schema Guide                        │
│                                                 │
│  Generate your resume JSON with AI in 3 steps:  │
│  1. Copy the prompt below                       │
│  2. Paste into ChatGPT / Claude / Gemini        │
│  3. Add your details, get JSON, import it       │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  AI Prompt                    [📋 Copy]  │    │
│  │  ─────────────────────────────────────  │    │
│  │  You are a resume data assistant...     │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  JSON Schema                  [📋 Copy]  │    │
│  │  ─────────────────────────────────────  │    │
│  │  { "$schema": "...", ... }              │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  Example Resume JSON          [📋 Copy]  │    │
│  │  ─────────────────────────────────────  │    │
│  │  { "meta": { ... }, ... }               │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  [← Back to Editor]                             │
└─────────────────────────────────────────────────┘
```

**Styling:** Tailwind CSS. Dark code blocks, accent color highlights, smooth copy-feedback animations.

**Architecture:** Server component for static content, with a small `"use client"` island component for copy-to-clipboard buttons (zero JS shipped for the schema/example rendering).

### Phase 4: Link from Main Page — ✅ Done

**File:** `components/Editor/DataControls.tsx`

Added a small link next to the Import/Export buttons:

```diff
 <div className="flex gap-2">
+  <a
+    href="/schema"
+    target="_blank"
+    rel="noopener noreferrer"
+    className="px-3 py-1.5 text-sm rounded border border-blue-200 bg-blue-50
+               hover:bg-blue-100 font-medium text-blue-700 transition-colors"
+  >
+    📋 AI Import
+  </a>
   <button onClick={handleImportClick} ...>Import JSON</button>
   <button onClick={handleExport} ...>Export JSON</button>
 </div>
```

### Phase 5: API Endpoint — Deferred

Cut from initial implementation. No stated use case for programmatic access. Can be added later as `app/api/schema/route.ts` if needed.

---

## Implementation Notes

### Resolved: Zod 4 Verification
- **Confirmed:** `z.toJSONSchema()` is available natively in `zod@4.3.6`
- **Confirmed:** `.describe()` annotations propagate as `description` fields in JSON Schema output
- **Result:** Zero new dependencies needed

### Resolved: .describe() Location
- Descriptions live in `lib/schema-doc.ts` as a parallel described schema
- `lib/schema.ts` remains unchanged — pure validation logic, no bloat
- The described schema in `schema-doc.ts` is docs-only, never used for `safeParse()`

### Resolved: Example Resume
- Built by spreading `defaultResumeData` and extending with realistic content
- Stays in sync with actual schema since it starts from the canonical default shape

### Resolved: AI Prompt Rules
- Added: "Include at least 2 entries for experience, projects, and skills arrays"
- Added: "Each experience/project should have 2–4 bullet points"

---

## File Change Summary

| Action | File | Description |
|--------|------|-------------|
| Create | `lib/schema-doc.ts` | Described schema, JSON Schema generator, example data, AI prompt builder |
| Create | `app/schema/page.tsx` | Server component schema guide page |
| Create | `components/ui/CopyButton.tsx` | Client component for copy-to-clipboard with feedback |
| Create | `components/ui/CollapsibleSection.tsx` | Client component for collapsible sections with animation |
| Modify | `components/Editor/DataControls.tsx` | Add "📋 AI Import" link to header bar |

## Zero Impact Guarantee

- **No changes** to `lib/schema.ts` (validation logic untouched)
- **No changes** to `lib/pdf-generator.ts`
- **No changes** to `components/Preview/ResumePreview`
- **No changes** to the import/validation flow in DataControls (`safeParse()` unchanged)
- **No new dependencies** — `z.toJSONSchema()` is native to Zod 4.3.6

## Build Verification

```
Route (app)                              Size     First Load JS
┌ ○ /                                    35.2 kB         123 kB
├ ○ /_not-found                          875 B          88.4 kB
├ ƒ /api/generate-pdf                    0 B                0 B
└ ○ /schema                              9.87 kB        97.4 kB

○  (Static)   prerendered as static content
```

`/schema` is statically prerendered at build time (9.87 kB page JS). Zero impact on existing routes.
