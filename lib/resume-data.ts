// lib/resume-data.ts — Default resume JSON (sample data)
// Single source of truth for initial state. The editor writes to this shape.

import type { ResumeData } from "@/types/resume";

export const defaultResumeData: ResumeData = {
  meta: {
    accentColor: "#1A56DB",
    baseFontSize: 8.5,
    nameSize: 22,
    titleSize: 10.5,
    pageMargin: 40,
    sectionSpacing: 10,
    bulletSpacing: 2,
    pageSize: "LETTER",
    hiddenSections: [],
    sectionOrder: [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
      "openSource"
    ]
  },
  header: {
    name: "",
    title: "",
    contact: {
      email: "",
      phone: "",
      city: "",
      linkedin: "",
      github: "",
      portfolio: ""
    }
  },
  summary: "",
  skills: [],
  experience: [],
  projects: [],
  education: [],
  certifications: [],
  openSource: []
};
