// lib/schema-doc.ts — Single source of truth for schema documentation.
// Keeps lib/schema.ts (validation logic) clean. This file is purely for:
//   1. The /schema reference page (fieldReference + exampleResume)
//   2. The /api/schema plain-text endpoint (buildPlainTextSchema)

import { defaultResumeData } from "./resume-data";
import type { ResumeData } from "@/types/resume";

// ---------------------------------------------------------------------------
// Field reference — structured documentation for the /schema page.
// This is the SINGLE SOURCE OF TRUTH for schema documentation.
// Serves humans reading the docs, AI agents parsing the page, and
// the plain-text /api/schema endpoint.
// ---------------------------------------------------------------------------

export interface FieldDoc {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface SectionDoc {
  key: string;
  title: string;
  description: string;
  rootRequired: boolean; // is this section required at the top level?
  isArray: boolean;
  fields: FieldDoc[];
}

export const fieldReference: SectionDoc[] = [
  {
    key: "meta",
    title: "meta",
    description:
      "Styling and layout configuration. Controls fonts, colors, margins, and which sections appear in the PDF.",
    rootRequired: true,
    isArray: false,
    fields: [
      { name: "accentColor", type: "string", required: true, description: "Hex color for headings, links, and section rules. Example: \"#1A56DB\"" },
      { name: "baseFontSize", type: "number", required: true, description: "Body text size in points. Range: 8–12." },
      { name: "nameSize", type: "number", required: true, description: "Name font size in points. Range: 18–28." },
      { name: "titleSize", type: "number", required: true, description: "Role/title font size in points. Range: 9–13." },
      { name: "pageMargin", type: "number", required: true, description: "All four page margins in points. Range: 30–60." },
      { name: "sectionSpacing", type: "number", required: true, description: "Vertical gap before each section in points." },
      { name: "bulletSpacing", type: "number", required: true, description: "Vertical gap between bullet points in points." },
      { name: "pageSize", type: '"LETTER" | "A4"', required: true, description: "Page format. LETTER = US 8.5×11 in, A4 = 210×297 mm." },
      { name: "hiddenSections", type: "string[]", required: false, description: "Section keys to hide from PDF output. Valid keys: summary, skills, experience, projects, education, certifications, openSource." },
      { name: "sectionOrder", type: "string[]", required: false, description: "Render order. Default: [\"summary\", \"skills\", \"experience\", \"projects\", \"education\", \"certifications\", \"openSource\"]." },
    ],
  },
  {
    key: "header",
    title: "header",
    description:
      "Name, professional title, and contact information displayed at the top of the resume.",
    rootRequired: true,
    isArray: false,
    fields: [
      { name: "name", type: "string", required: true, description: "Full name as it should appear on the resume." },
      { name: "title", type: "string", required: true, description: "Professional title or target role. Example: \"Senior Software Engineer\"." },
      { name: "contact.email", type: "string", required: true, description: "Email address." },
      { name: "contact.phone", type: "string", required: true, description: "Phone number with country code. Example: \"+1-555-0100\"." },
      { name: "contact.city", type: "string", required: true, description: "City and state/country. Example: \"San Francisco, CA\"." },
      { name: "contact.linkedin", type: "string", required: false, description: "LinkedIn profile URL or handle." },
      { name: "contact.github", type: "string", required: false, description: "GitHub profile URL or username." },
      { name: "contact.portfolio", type: "string", required: false, description: "Personal website or portfolio URL." },
    ],
  },
  {
    key: "summary",
    title: "summary",
    description:
      "A 2–3 sentence professional summary at the top of the resume. This is a plain string, not an object.",
    rootRequired: true,
    isArray: false,
    fields: [
      { name: "summary", type: "string", required: true, description: "2–3 sentence professional summary. Placed directly after the header." },
    ],
  },
  {
    key: "skills",
    title: "skills",
    description:
      "Technical skills grouped by category. Each entry is a category label with a comma-separated list of technologies.",
    rootRequired: true,
    isArray: true,
    fields: [
      { name: "label", type: "string", required: true, description: "Skill category name. Examples: \"Backend\", \"Frontend\", \"DevOps\", \"Languages\"." },
      { name: "value", type: "string", required: true, description: "Comma-separated list of technologies. Example: \"Go, gRPC, PostgreSQL, Redis\"." },
    ],
  },
  {
    key: "experience",
    title: "experience",
    description:
      "Work experience entries, ordered most recent first. Each entry has a job title, company, dates, and achievement bullets.",
    rootRequired: false,
    isArray: true,
    fields: [
      { name: "title", type: "string", required: true, description: "Job title." },
      { name: "company", type: "string", required: true, description: "Company or organization name." },
      { name: "location", type: "string", required: false, description: "City/state or \"Remote\"." },
      { name: "startDate", type: "string", required: true, description: "Start date. Example: \"Jan 2021\" or \"March 2020\"." },
      { name: "endDate", type: "string", required: true, description: "End date or \"Present\" for current roles." },
      { name: "employmentType", type: "string", required: false, description: "One of: \"Full-time\", \"Internship\", \"Contract\", \"Freelance\"." },
      { name: "bullets", type: "string[]", required: true, description: "Achievement bullets. Start each with a strong action verb. Aim for 2–4 per entry." },
    ],
  },
  {
    key: "projects",
    title: "projects",
    description:
      "Personal or professional projects. Each entry includes the project name, tech stack, and outcome bullets.",
    rootRequired: true,
    isArray: true,
    fields: [
      { name: "name", type: "string", required: true, description: "Project name." },
      { name: "subtitle", type: "string", required: false, description: "Short tagline or one-line description." },
      { name: "status", type: "string", required: false, description: "One of: \"In Progress\", \"Completed\", \"Archived\"." },
      { name: "tech", type: "string", required: true, description: "Tech stack. Example: \"React, TypeScript, Firebase\"." },
      { name: "link", type: "string", required: false, description: "URL to project repo or live demo." },
      { name: "startDate", type: "string", required: false, description: "Project start date." },
      { name: "endDate", type: "string", required: false, description: "Project end date." },
      { name: "bullets", type: "string[]", required: true, description: "Key outcomes or features. Start each with a strong action verb." },
    ],
  },
  {
    key: "education",
    title: "education",
    description: "Education history. Include degrees, institutions, and optionally GPA and coursework.",
    rootRequired: true,
    isArray: true,
    fields: [
      { name: "degree", type: "string", required: true, description: "Degree name. Example: \"B.S. Computer Science\"." },
      { name: "institution", type: "string", required: true, description: "University or school name." },
      { name: "location", type: "string", required: false, description: "City/state of the institution." },
      { name: "startYear", type: "string", required: true, description: "Start year. Example: \"2013\"." },
      { name: "endYear", type: "string", required: true, description: "End year or \"Expected 2027\" for in-progress degrees." },
      { name: "gpa", type: "string", required: false, description: "GPA. Omit if below 3.5 — never show a bad GPA." },
      { name: "coursework", type: "string", required: false, description: "Comma-separated relevant coursework." },
      { name: "achievements", type: "string[]", required: false, description: "Academic honors or achievements." },
    ],
  },
  {
    key: "certifications",
    title: "certifications",
    description: "Professional certifications with issuer and optional credential URL.",
    rootRequired: false,
    isArray: true,
    fields: [
      { name: "name", type: "string", required: true, description: "Certification name. Example: \"AWS Solutions Architect\"." },
      { name: "issuer", type: "string", required: true, description: "Issuing organization." },
      { name: "date", type: "string", required: false, description: "Date obtained. Example: \"2023\"." },
      { name: "credentialUrl", type: "string", required: false, description: "Verification URL." },
    ],
  },
  {
    key: "openSource",
    title: "openSource",
    description: "Open source contributions. Reference the repo, describe the contribution, and optionally link to the PR.",
    rootRequired: false,
    isArray: true,
    fields: [
      { name: "project", type: "string", required: true, description: "Repo in \"org/repo\" format. Example: \"kubernetes/kubernetes\"." },
      { name: "description", type: "string", required: true, description: "What you contributed." },
      { name: "prLink", type: "string", required: false, description: "URL to the PR or commit." },
      { name: "impact", type: "string", required: false, description: "Outcome or reach of the contribution." },
    ],
  },
];

// ---------------------------------------------------------------------------
// Realistic example — extends defaultResumeData with filled-in content
// ---------------------------------------------------------------------------

export const exampleResume: ResumeData = {
  ...defaultResumeData,
  meta: {
    ...defaultResumeData.meta,
    accentColor: "#1A56DB",
    baseFontSize: 9,
    nameSize: 22,
    titleSize: 10.5,
    pageMargin: 40,
    sectionSpacing: 10,
    bulletSpacing: 2,
    pageSize: "LETTER",
    sectionOrder: [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
      "openSource",
    ],
  },
  header: {
    name: "Jane Doe",
    title: "Senior Software Engineer",
    contact: {
      email: "jane@example.com",
      phone: "+1-555-0100",
      city: "San Francisco, CA",
      linkedin: "linkedin.com/in/janedoe",
      github: "github.com/janedoe",
    },
  },
  summary:
    "Senior engineer with 7 years of experience in distributed systems and cloud-native infrastructure. Passionate about developer tooling and open source.",
  skills: [
    { label: "Backend", value: "Go, gRPC, PostgreSQL, Redis, Kafka" },
    { label: "Frontend", value: "React, TypeScript, Next.js, Tailwind CSS" },
    { label: "DevOps", value: "Kubernetes, Terraform, GitHub Actions, AWS" },
  ],
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Acme Corp",
      location: "San Francisco, CA",
      startDate: "Jan 2021",
      endDate: "Present",
      employmentType: "Full-time",
      bullets: [
        "Designed and shipped a real-time data pipeline processing 2M events/day using Kafka and Go",
        "Led migration from monolith to microservices, reducing deploy time by 60%",
        "Mentored 4 junior engineers through structured code review and pairing sessions",
      ],
    },
    {
      title: "Software Engineer",
      company: "StartupXYZ",
      location: "Remote",
      startDate: "Jun 2018",
      endDate: "Dec 2020",
      employmentType: "Full-time",
      bullets: [
        "Built the core REST API serving 50K daily active users with Node.js and PostgreSQL",
        "Implemented CI/CD pipeline with GitHub Actions, cutting release cycles from weekly to daily",
      ],
    },
  ],
  projects: [
    {
      name: "OpenTracer",
      subtitle: "Lightweight distributed tracing SDK",
      tech: "Go, gRPC, Jaeger",
      status: "Completed",
      link: "https://github.com/janedoe/opentracer",
      bullets: [
        "Built a tracing SDK adopted by 3 internal teams, reducing debugging time by 40%",
        "Implemented context propagation across 12 microservices with zero-config setup",
      ],
    },
    {
      name: "DevDash",
      subtitle: "Developer productivity dashboard",
      tech: "React, TypeScript, D3.js",
      status: "In Progress",
      bullets: [
        "Designed interactive charts visualizing CI/CD metrics across 8 repositories",
        "Integrated GitHub API for real-time PR review tracking and team velocity analysis",
      ],
    },
  ],
  education: [
    {
      degree: "B.S. Computer Science",
      institution: "UC Berkeley",
      location: "Berkeley, CA",
      startYear: "2013",
      endYear: "2017",
      gpa: "3.8",
      coursework: "Distributed Systems, Operating Systems, Algorithms, Machine Learning",
    },
  ],
  certifications: [
    {
      name: "AWS Solutions Architect — Associate",
      issuer: "Amazon Web Services",
      date: "2023",
      credentialUrl: "https://aws.amazon.com/verification/...",
    },
  ],
  openSource: [
    {
      project: "kubernetes/kubernetes",
      description: "Fixed race condition in scheduler queue causing pod starvation under high load",
      prLink: "https://github.com/kubernetes/kubernetes/pull/12345",
      impact: "Merged in v1.28, affects all clusters",
    },
  ],
};

// ---------------------------------------------------------------------------
// Plain-text schema builder — token-efficient output for AI agents.
// This is what /api/schema returns. Encodes fieldReference + exampleResume
// into a compact, column-aligned DSL that AI models parse trivially.
// ---------------------------------------------------------------------------

function formatTopLevelStructure(): string {
  const lines: string[] = [];
  lines.push(`## Top-level structure\n`);
  lines.push(`| Key | Type | Required | Description |`);
  lines.push(`|---|---|---|---|`);
  
  for (const section of fieldReference) {
    const kind = section.isArray ? `${section.title}[]` : "object";
    const typeLabel = section.key === "summary" ? `string` : kind;
    const req = section.rootRequired ? "required" : "optional";
    lines.push(`| \`${section.key}\` | \`${typeLabel}\` | ${req} | ${section.description} |`);
  }
  
  return lines.join("\n");
}

function formatSection(section: SectionDoc): string {
  const kind = section.isArray ? "array" : section.key === "summary" ? "string" : "object";
  const req = section.rootRequired ? "required" : "optional";
  const lines: string[] = [];

  lines.push(`### ${section.key} (${req} ${kind})`);
  lines.push(`${section.description}\n`);
  
  lines.push(`| Field | Type | Status | Description |`);
  lines.push(`|---|---|---|---|`);

  for (const field of section.fields) {
    const status = field.required ? "required" : "optional";
    lines.push(
      `| \`${field.name}\` | \`${field.type}\` | ${status} | ${field.description} |`
    );
  }

  return lines.join("\n");
}

export function buildPlainTextSchema(): string {
  const topLevel = formatTopLevelStructure();
  const sections = fieldReference.map(formatSection).join("\n\n");
  const example = JSON.stringify(exampleResume, null, 2);

  return `# QuickCV Schema Reference

This is the complete reference for the QuickCV resume JSON format.

## RULES
- Return ONLY raw JSON. No markdown, no code fences, no explanation.
- All required fields must be present. Optional fields can be omitted.
- Include at least 2 entries for experience, projects, and skills arrays.
- Bullets: start with a strong action verb, aim for 2–4 per entry.
- employmentType must be one of: "Full-time", "Internship", "Contract", "Freelance".
- status must be one of: "In Progress", "Completed", "Archived".
- pageSize must be "LETTER" or "A4".
- Omit gpa if it would be below 3.5.
- endDate accepts "Present" for current roles. endYear accepts "Expected 2027" for in-progress degrees.

${topLevel}

## Field Reference

Every field in every section, with its type, whether it's required, and what it does.

${sections}

## Full Example

A complete, realistic resume JSON that passes validation.

\`\`\`json
${example}
\`\`\`

Now generate a resume JSON for the following person:`;
}
