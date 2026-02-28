// lib/resume-data.ts — Default resume JSON (sample data)
// Single source of truth for initial state. The editor writes to this shape.

import type { ResumeData } from "@/types/resume";

export const defaultResumeData: ResumeData = {
  meta: {
    accentColor: "#1A56DB",
    fontFamily: "Inter",
    baseFontSize: 8.5,
    nameSize: 22,
    titleSize: 10.5,
    pageMargin: 40,
    sectionSpacing: 10,
    bulletSpacing: 2,
    pageSize: "LETTER",
  },

  header: {
    name: "Shekhar Thakur",
    title: "Backend Engineer · Go · Distributed Systems",
    contact: {
      email: "shekhar@example.com",
      phone: "+91 9876543210",
      city: "Vellore, India",
      linkedin: "linkedin.com/in/therealshek",
      github: "github.com/TheRealShek",
    },
  },

  summary:
    "Backend engineer specialising in high-throughput distributed systems with Go. Currently building production-grade task queue infrastructure with Redis and PostgreSQL. Focused on writing systems that are observable, testable, and deployable from day one.",

  skills: [
    { label: "Languages", value: "Go, TypeScript, Python, SQL" },
    { label: "Backend", value: "Go, gRPC, REST APIs, Worker Pools, Middleware" },
    { label: "Databases", value: "PostgreSQL, Redis, SQLite" },
    { label: "Messaging", value: "Redis Streams, Pub/Sub" },
    { label: "Observability", value: "Prometheus, Grafana, Structured Logging" },
    { label: "DevOps", value: "Docker, Docker Compose, GitHub Actions, CI/CD" },
    { label: "Cloud", value: "AWS (EC2, S3, RDS), Vercel" },
    { label: "Tools", value: "Git, Neovim, VS Code, Linux, Make" },
  ],

  experience: [
    {
      title: "Backend Engineering Intern",
      company: "Acme Corp",
      location: "Remote",
      startDate: "Jun 2025",
      endDate: "Present",
      employmentType: "Internship",
      bullets: [
        "Built a distributed job scheduler handling 50k+ tasks/day using Go worker pools and Redis-backed priority queues",
        "Reduced average API response latency by 35% by implementing connection pooling and query optimisation on PostgreSQL",
        "Designed and deployed a health-check microservice with Prometheus metrics, alerting on p99 latency > 200ms",
      ],
    },
  ],

  projects: [
    {
      name: "VanguardQ",
      subtitle: "Production Task Queue System",
      status: "In Progress",
      tech: "Go · Redis · PostgreSQL · Docker",
      link: "github.com/TheRealShek/vanguardq",
      bullets: [
        "Built a multi-tenant task queue supporting delayed, scheduled, and priority-based job execution with Redis Streams",
        "Implemented visibility timeout and dead-letter queue patterns to guarantee at-least-once delivery",
        "Designed a worker pool with graceful shutdown, panic recovery, and per-worker structured logging",
        "Achieved < 5ms p99 enqueue latency under sustained 10k tasks/sec load in benchmark suite",
      ],
    },
    {
      name: "StackNotes",
      subtitle: "Markdown Knowledge Base",
      status: "Completed",
      tech: "Next.js · TypeScript · SQLite · Tailwind CSS",
      link: "github.com/TheRealShek/stacknotes",
      bullets: [
        "Built a full-stack note-taking app with real-time Markdown preview and full-text search across 1000+ notes",
        "Implemented tag-based organisation with O(1) lookup using an inverted index backed by SQLite FTS5",
        "Deployed on Vercel with edge caching, achieving < 100ms TTFB for all read operations",
      ],
    },
    {
      name: "QuickCV",
      subtitle: "Programmatic Resume Builder",
      status: "Completed",
      tech: "Next.js · PDFKit · TypeScript · Tailwind CSS",
      bullets: [
        "Built a resume builder that generates pixel-perfect PDFs from a single JSON config using PDFKit",
        "Implemented automatic pagination with orphan/widow prevention for section headers and bullet points",
        "Created a live HTML preview that mirrors PDF layout with < 5% visual drift",
      ],
    },
  ],

  education: [
    {
      degree: "Integrated M.Tech in Software Engineering",
      institution: "Vellore Institute of Technology",
      location: "Vellore, India",
      startYear: "2022",
      endYear: "Expected 2027",
      gpa: "8.1 / 10",
      coursework:
        "Data Structures, Algorithms, Operating Systems, Distributed Systems, Database Systems, Computer Networks",
    },
  ],

  certifications: [
    {
      name: "AWS Certified Developer – Associate",
      issuer: "Amazon Web Services",
      date: "Mar 2025",
    },
  ],

  openSource: [
    {
      project: "redis/go-redis",
      description:
        "Fixed connection pool leak under high concurrency by adding proper context cancellation handling",
      prLink: "github.com/redis/go-redis/pull/1234",
      impact: "Merged. Affects 50k+ downstream projects.",
    },
  ],
};
