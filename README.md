# QuickCV (V3)

A programmatic, fully customizable resume builder. No drag-and-drop interfaces or rigid templates are used; layout and rendering are managed entirely programmatically.

QuickCV allows users to edit resume contents using form inputs, adjust typographic style tokens, live-preview the HTML representation, and compile pixel-perfect PDFs server-side. Additionally, it features an AI Schema & Prompt Engine designed to let Large Language Models (LLMs) generate compatible JSON resume payloads that import instantly.

Built with TypeScript, Next.js 14 (App Router), PDFKit, and Tailwind CSS.

---

## Key Features

*   **Live HTML Preview** — Real-time layout feedback as data is updated in the editor.
*   **Serverless PDF Generation** — Renders pixel-perfect, printer-ready PDFs on the server using a custom PDFKit compiler.
*   **Design Tokens** — Fine-tune styling programmatically (including accent color, base font size, name/title sizes, section gaps, bullet margins, and page sizes: A4 or Letter).
*   **AI-Agent Integration** — Features a `/schema` reference page and `/api/schema` endpoints designed to feed LLMs schemas and structural guidelines so they output compatible imports.
*   **Strict Schema Validation** — Powered by Zod, rejecting invalid payloads early to guarantee data structure consistency.

---

## Tech Stack & Architecture

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | React Server Components & API routes |
| **PDF Engine** | PDFKit | Low-level server-side PDF drawing |
| **Styling** | Tailwind CSS | Utility-first responsive styles |
| **Validation** | Zod | Runtime type safety & import parsing |
| **Fonts** | Inter (300 / 400 / 700) | Self-hosted typography |
| **Hosting** | Vercel | Serverless API & edge hosting |

### Project Directory Structure

```
├── app/
│   ├── api/
│   │   ├── generate-pdf/route.ts  # PDFKit serverless PDF generator
│   │   └── schema/route.ts        # JSON schema and text-prompt APIs
│   ├── schema/page.tsx            # Human & AI-readable documentation
│   ├── layout.tsx
│   └── page.tsx                   # Main resume editor & preview
├── components/
│   ├── Editor/                    # Input forms, data controls, & styles
│   ├── Preview/                   # Live HTML rendering panel
│   └── ui/                        # Reusable form components
├── lib/
│   ├── resume-data.ts             # Default/fallback state schema
│   ├── schema-doc.ts              # AI prompt builders & JSON schema
│   └── schema.ts                  # Zod validation schema matching TypeScript types
└── public/fonts/                  # Bundled Inter font files for PDFKit
```

---

## AI Prompting & Import Flow

QuickCV is built to integrate with AI assistants such as Claude, ChatGPT, and Gemini.

1. **Retrieve the Prompt**: Navigate to `/schema` in the browser or retrieve it programmatically via:
   ```bash
   curl http://localhost:3000/api/schema?fmt=text
   ```
2. **Generate JSON**: Input this prompt to your LLM along with your career history. The LLM will output a strictly compliant JSON payload.
3. **Import & Edit**: Upload the `.json` file in the QuickCV editor. The system validates the fields using Zod, performs a nested fallback merge, and populates the UI.

---

## Getting Started

### 1. Installation
Clone the repository and install the dependencies:
```bash
bun install
```

### 2. Development Server
Run the development server locally:
```bash
bun dev
```
Open [http://localhost:3000](http://localhost:3000) to view the editor.

### 3. Production Build
Validate TypeScript compiling and create an optimized production build:
```bash
bun run build
```

---

## Gotchas & Deployment Notes

When deploying to serverless platforms like Vercel, keep these configurations in mind:

*   **PDFKit External Bundling**: PDFKit uses dynamic `require()` statements to load font data, which breaks standard Webpack/Next.js bundling. PDFKit is marked as external in `next.config.mjs`:
    ```js
    experimental: {
      serverComponentsExternalPackages: ["pdfkit"]
    }
    ```
*   **Font Path Resolving**: Custom Inter fonts are placed in `public/fonts/` so they are successfully deployed and resolved by PDFKit running inside serverless functions.
