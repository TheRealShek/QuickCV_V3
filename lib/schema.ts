// lib/schema.ts — Zod schema matching types/resume.ts exactly

import { z } from "zod";

const pageSizeSchema = z.enum(["LETTER", "A4"]);

const metaSchema = z.object({
  accentColor: z.string(), // hex color, e.g. "#1A56DB"
  fontFamily: z.string(), // e.g. "Inter"
  baseFontSize: z.number().min(8).max(12), // points
  nameSize: z.number().min(18).max(28), // points
  titleSize: z.number().min(9).max(13), // points
  pageMargin: z.number().min(30).max(60), // points
  sectionSpacing: z.number(), // gap before each section
  bulletSpacing: z.number(), // gap between bullets
  pageSize: pageSizeSchema, // "LETTER" | "A4"
});

const contactSchema = z.object({
  email: z.string(),
  phone: z.string(),
  city: z.string(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
});

const headerSchema = z.object({
  name: z.string(),
  title: z.string(),
  contact: contactSchema,
});

const skillSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const experienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  employmentType: z.string().optional(),
  bullets: z.array(z.string()),
});

const projectSchema = z.object({
  name: z.string(),
  subtitle: z.string().optional(),
  status: z.string().optional(),
  tech: z.string(),
  link: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bullets: z.array(z.string()),
});

const educationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  location: z.string().optional(),
  startYear: z.string(),
  endYear: z.string(),
  gpa: z.string().optional(),
  coursework: z.string().optional(),
  achievements: z.array(z.string()).optional(),
});

const certificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string().optional(),
  credentialUrl: z.string().optional(),
});

const openSourceSchema = z.object({
  project: z.string(),
  description: z.string(),
  prLink: z.string().optional(),
  impact: z.string().optional(),
});

export const resumeSchema = z.object({
  meta: metaSchema,
  header: headerSchema,
  summary: z.string(),
  skills: z.array(skillSchema),
  experience: z.array(experienceSchema).optional(),
  projects: z.array(projectSchema),
  education: z.array(educationSchema),
  certifications: z.array(certificationSchema).optional(),
  openSource: z.array(openSourceSchema).optional(),
});

export type ResumeDataFromSchema = z.infer<typeof resumeSchema>;
