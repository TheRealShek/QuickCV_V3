// types/resume.ts — complete, matches Architecture Section 2 field breakdown exactly

export type PageSize = "LETTER" | "A4";

export interface ResumeData {
  meta: {
    accentColor: string; // e.g. "#1A56DB"
    baseFontSize: number; // body text, points, range 8-12
    nameSize: number; // name font size, range 18-28
    titleSize: number; // role title size, range 9-13
    pageMargin: number; // all four margins, points, range 30-60
    sectionSpacing: number; // gap before each section
    bulletSpacing: number; // gap between bullets
    pageSize: PageSize; // "LETTER" | "A4", default: "LETTER"
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
