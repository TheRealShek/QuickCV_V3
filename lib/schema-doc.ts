// lib/schema-doc.ts — Documentation-only schema, example data, and AI prompt builder.
// Keeps lib/schema.ts (validation logic) clean. This file is purely for the /schema page.

import { z } from "zod";
import { defaultResumeData } from "./resume-data";
import type { ResumeData } from "@/types/resume";

// ---------------------------------------------------------------------------
// Described schema — mirrors lib/schema.ts structure with .describe() annotations.
// NOT used for validation. Only used to generate JSON Schema docs.
// ---------------------------------------------------------------------------

const describedPageSize = z
  .enum(["LETTER", "A4"])
  .describe("Page format: 'LETTER' (US 8.5×11) or 'A4' (210×297mm)");

const describedMeta = z.object({
  accentColor: z.string().describe("Hex color for headings and links, e.g. '#1A56DB'"),
  baseFontSize: z.number().min(8).max(12).describe("Body text size in points (8–12)"),
  nameSize: z.number().min(18).max(28).describe("Name font size in points (18–28)"),
  titleSize: z.number().min(9).max(13).describe("Role/title font size in points (9–13)"),
  pageMargin: z.number().min(30).max(60).describe("All four page margins in points (30–60)"),
  sectionSpacing: z.number().describe("Vertical gap before each section in points"),
  bulletSpacing: z.number().describe("Vertical gap between bullet points in points"),
  pageSize: describedPageSize,
  hiddenSections: z
    .array(z.string())
    .optional()
    .describe("Section keys to hide from PDF: summary, skills, experience, projects, education, certifications, openSource"),
  sectionOrder: z
    .array(z.string())
    .optional()
    .describe("Render order of sections. Valid keys: summary, skills, experience, projects, education, certifications, openSource"),
});

const describedContact = z.object({
  email: z.string().describe("Email address"),
  phone: z.string().describe("Phone number with country code, e.g. '+1-555-0100'"),
  city: z.string().describe("City and state/country, e.g. 'San Francisco, CA'"),
  linkedin: z.string().optional().describe("LinkedIn profile URL or handle"),
  github: z.string().optional().describe("GitHub profile URL or username"),
  portfolio: z.string().optional().describe("Personal website or portfolio URL"),
});

const describedHeader = z.object({
  name: z.string().describe("Full name as it should appear on the resume"),
  title: z.string().describe("Professional title or target role, e.g. 'Senior Software Engineer'"),
  contact: describedContact,
});

const describedSkill = z.object({
  label: z.string().describe("Skill category, e.g. 'Backend', 'Frontend', 'DevOps'"),
  value: z.string().describe("Comma-separated list of technologies, e.g. 'Go, gRPC, PostgreSQL'"),
});

const describedExperience = z.object({
  title: z.string().describe("Job title"),
  company: z.string().describe("Company or organization name"),
  location: z.string().optional().describe("City/state or 'Remote'"),
  startDate: z.string().describe("Start date, e.g. 'Jan 2021' or 'March 2020'"),
  endDate: z.string().describe("End date or 'Present' for current roles"),
  employmentType: z
    .string()
    .optional()
    .describe("One of: 'Full-time', 'Internship', 'Contract', 'Freelance'"),
  bullets: z.array(z.string()).describe("Achievement bullets — start each with a strong action verb"),
});

const describedProject = z.object({
  name: z.string().describe("Project name"),
  subtitle: z.string().optional().describe("Short tagline or description"),
  status: z.string().optional().describe("One of: 'In Progress', 'Completed', 'Archived'"),
  tech: z.string().describe("Tech stack used, e.g. 'React, TypeScript, Firebase'"),
  link: z.string().optional().describe("URL to project repo or live demo"),
  startDate: z.string().optional().describe("Project start date"),
  endDate: z.string().optional().describe("Project end date"),
  bullets: z.array(z.string()).describe("Key outcomes or features — start each with a strong action verb"),
});

const describedEducation = z.object({
  degree: z.string().describe("Degree name, e.g. 'B.S. Computer Science'"),
  institution: z.string().describe("University or school name"),
  location: z.string().optional().describe("City/state of the institution"),
  startYear: z.string().describe("Start year, e.g. '2013'"),
  endYear: z.string().describe("End year or 'Expected 2027' for in-progress degrees"),
  gpa: z.string().optional().describe("GPA — omit if below 3.5"),
  coursework: z.string().optional().describe("Comma-separated relevant coursework"),
  achievements: z.array(z.string()).optional().describe("Academic honors or achievements"),
});

const describedCertification = z.object({
  name: z.string().describe("Certification name, e.g. 'AWS Solutions Architect'"),
  issuer: z.string().describe("Issuing organization"),
  date: z.string().optional().describe("Date obtained, e.g. '2023'"),
  credentialUrl: z.string().optional().describe("Verification URL"),
});

const describedOpenSource = z.object({
  project: z.string().describe("Repo in 'org/repo' format, e.g. 'kubernetes/kubernetes'"),
  description: z.string().describe("What you contributed"),
  prLink: z.string().optional().describe("URL to the PR or commit"),
  impact: z.string().optional().describe("Outcome or reach of the contribution"),
});

const describedResumeSchema = z.object({
  meta: describedMeta.describe("Styling and layout configuration"),
  header: describedHeader.describe("Name, title, and contact information"),
  summary: z.string().describe("2–3 sentence professional summary"),
  skills: z.array(describedSkill).describe("Technical skill categories with comma-separated values"),
  experience: z.array(describedExperience).optional().describe("Work experience entries, most recent first"),
  projects: z.array(describedProject).describe("Personal or professional projects"),
  education: z.array(describedEducation).describe("Education history"),
  certifications: z.array(describedCertification).optional().describe("Professional certifications"),
  openSource: z.array(describedOpenSource).optional().describe("Open source contributions"),
});

// ---------------------------------------------------------------------------
// JSON Schema output
// ---------------------------------------------------------------------------

/** Machine-readable JSON Schema derived from the described Zod schema */
export function getJSONSchema(): Record<string, unknown> {
  return z.toJSONSchema(describedResumeSchema, { target: "draft-2020-12" });
}

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
// AI prompt builder
// ---------------------------------------------------------------------------

export function buildAIPrompt(): string {
  const schema = JSON.stringify(getJSONSchema(), null, 2);
  const example = JSON.stringify(exampleResume, null, 2);

  return `You are a resume data assistant. Generate a JSON object matching the QuickCV schema below.

RULES:
- Return ONLY the raw JSON object. No markdown, no code fences, no explanation.
- All required fields must be present. Optional fields can be omitted if not applicable.
- Include at least 2 entries for experience, projects, and skills arrays. Single-item arrays look sparse on a resume.
- "endDate" accepts "Present" for current roles. "endYear" accepts "Expected 2027" for in-progress degrees.
- "employmentType" must be one of: "Full-time", "Internship", "Contract", "Freelance".
- "status" must be one of: "In Progress", "Completed", "Archived".
- "pageSize" must be "LETTER" or "A4".
- Omit "gpa" if it would be below 3.5.
- Keep bullet points concise and action-oriented — start each with a strong verb.
- Each experience/project should have 2–4 bullet points.

JSON SCHEMA:
${schema}

EXAMPLE:
${example}

Now generate a resume JSON for the following person:`;
}

// ---------------------------------------------------------------------------
// Field reference — structured documentation for the /schema page.
// Serves both humans reading the docs and AI agents parsing the page.
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

