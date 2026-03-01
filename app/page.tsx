// app/page.tsx — Main editor + preview page (Module 5)
// Two-column layout: Left = editor (useReducer), Right = ResumePreview (live)
// Download button implements the EXACT pattern from Architecture Module 5.

"use client";

import BulletEditor from "@/components/Editor/BulletEditor";
import CollapsibleItem from "@/components/Editor/CollapsibleItem";
import DataControls from "@/components/Editor/DataControls";
import SectionEditor from "@/components/Editor/SectionEditor";
import StyleControls from "@/components/Editor/StyleControls";
import ResumePreview from "@/components/Preview/ResumePreview";
import { Input, Textarea } from "@/components/ui/Input";
import { defaultResumeData } from "@/lib/resume-data";
import { resumeSchema } from "@/lib/schema";
import type { ResumeData } from "@/types/resume";
import { useEffect, useReducer, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Reducer — manages entire ResumeData state
// ---------------------------------------------------------------------------

type Action =
  | { type: "SET_FULL_STATE"; payload: ResumeData }
  | { type: "SET_META"; payload: Partial<ResumeData["meta"]> }
  | { type: "SET_HEADER"; payload: Partial<ResumeData["header"]> }
  | { type: "SET_CONTACT"; payload: Partial<ResumeData["header"]["contact"]> }
  | { type: "SET_SUMMARY"; payload: string }
  | { type: "SET_SKILLS"; payload: ResumeData["skills"] }
  | { type: "SET_EXPERIENCE"; payload: ResumeData["experience"] }
  | { type: "SET_PROJECTS"; payload: ResumeData["projects"] }
  | { type: "SET_EDUCATION"; payload: ResumeData["education"] }
  | { type: "SET_CERTIFICATIONS"; payload: ResumeData["certifications"] }
  | { type: "SET_OPENSOURCE"; payload: ResumeData["openSource"] };

function resumeReducer(state: ResumeData, action: Action): ResumeData {
  switch (action.type) {
    case "SET_FULL_STATE":
      return action.payload;
    case "SET_META":
      return { ...state, meta: { ...state.meta, ...action.payload } };
    case "SET_HEADER":
      return { ...state, header: { ...state.header, ...action.payload } };
    case "SET_CONTACT":
      return {
        ...state,
        header: {
          ...state.header,
          contact: { ...state.header.contact, ...action.payload },
        },
      };
    case "SET_SUMMARY":
      return { ...state, summary: action.payload };
    case "SET_SKILLS":
      return { ...state, skills: action.payload };
    case "SET_EXPERIENCE":
      return { ...state, experience: action.payload };
    case "SET_PROJECTS":
      return { ...state, projects: action.payload };
    case "SET_EDUCATION":
      return { ...state, education: action.payload };
    case "SET_CERTIFICATIONS":
      return { ...state, certifications: action.payload };
    case "SET_OPENSOURCE":
      return { ...state, openSource: action.payload };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Helper: update item in array by index
// ---------------------------------------------------------------------------
function updateAt<T>(arr: T[], index: number, patch: Partial<T>): T[] {
  return arr.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

function removeAt<T>(arr: T[], index: number): T[] {
  return arr.filter((_, i) => i !== index);
}

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function Home() {
  const [data, dispatch] = useReducer(resumeReducer, defaultResumeData);

  // Auto-save state
  const [isMounted, setIsMounted] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ON LOAD: check localStorage for saved resume
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("quickcv_resume_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validation = resumeSchema.safeParse(parsed);
        if (validation.success) {
          dispatch({ type: "SET_FULL_STATE", payload: validation.data });
        }
      } catch {
        // Ignored
      }
    }
  }, []);

  // Use a ref so the interval callback always sees the latest data
  // without re-triggering the interval setup on every keystroke
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // ON SAVE: every 10 seconds
  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(() => {
      setIsSaving(true);
      localStorage.setItem("quickcv_resume_data", JSON.stringify(dataRef.current));
      setLastSaved(new Date().toLocaleTimeString());
      setTimeout(() => setIsSaving(false), 200);
    }, 10000);
    return () => clearInterval(interval);
  }, [isMounted]);

  const handleClearCache = () => {
    if (window.confirm("This will clear your saved resume. Are you sure?")) {
      localStorage.removeItem("quickcv_resume_data");
      setLastSaved(null);
      dispatch({ type: "SET_FULL_STATE", payload: defaultResumeData });
    }
  };

  // Download state — exact pattern from Architecture Module 5
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-clear error toast after 5 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  // Download handler — exact pattern from Architecture Module 5
  async function handleDownload() {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        // Surface the actual error from the API, not a generic message
        const body = await res
          .json()
          .catch(() => ({ error: "Unknown error" }));
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

  // Shorthand dispatchers
  const setFullState = (payload: ResumeData) =>
    dispatch({ type: "SET_FULL_STATE", payload });
  const setMeta = (p: Partial<ResumeData["meta"]>) =>
    dispatch({ type: "SET_META", payload: p });
  const setHeader = (p: Partial<ResumeData["header"]>) =>
    dispatch({ type: "SET_HEADER", payload: p });
  const setContact = (p: Partial<ResumeData["header"]["contact"]>) =>
    dispatch({ type: "SET_CONTACT", payload: p });
  const setSummary = (s: string) =>
    dispatch({ type: "SET_SUMMARY", payload: s });
  const setSkills = (s: ResumeData["skills"]) =>
    dispatch({ type: "SET_SKILLS", payload: s });
  const setExperience = (e: ResumeData["experience"]) =>
    dispatch({ type: "SET_EXPERIENCE", payload: e });
  const setProjects = (p: ResumeData["projects"]) =>
    dispatch({ type: "SET_PROJECTS", payload: p });
  const setEducation = (e: ResumeData["education"]) =>
    dispatch({ type: "SET_EDUCATION", payload: e });
  const setCertifications = (c: ResumeData["certifications"]) =>
    dispatch({ type: "SET_CERTIFICATIONS", payload: c });
  const setOpenSource = (o: ResumeData["openSource"]) =>
    dispatch({ type: "SET_OPENSOURCE", payload: o });

  const exp = data.experience ?? [];
  const certs = data.certifications ?? [];
  const oss = data.openSource ?? [];

  // Layout state for preview scaling
  const previewColRef = useRef<HTMLDivElement>(null);
  const [colWidth, setColWidth] = useState(0);

  useEffect(() => {
    if (!previewColRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setColWidth(entries[0].contentRect.width);
    });
    observer.observe(previewColRef.current);
    return () => observer.disconnect();
  }, []);

  const PREVIEW_WIDTH = data.meta.pageSize === "A4" ? 595 : 612;
  const availableWidth = Math.max(0, colWidth - 96);
  const previewScale = colWidth > 0 ? availableWidth / PREVIEW_WIDTH : 1;

  return (
    <div className="flex flex-col h-[100vh] overflow-hidden bg-gray-100">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <h1 className="text-sm font-bold text-gray-800">QuickCV_V3</h1>
        <div className="flex items-center gap-3 relative z-50">
          {/* Data Controls for Export & Import JSON payloads */}
          <DataControls data={data} onImport={setFullState} />

          {/* Download PDF button — exact architecture pattern */}
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={`px-4 py-2 rounded text-white font-medium transition-opacity
              ${isGenerating ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
            style={{ backgroundColor: data.meta.accentColor }}
          >
            {isGenerating ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </header>

      {/* Error toast — shown below header, auto-clears after 5s */}
      {error && (
        <div
          className="mx-4 mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-1">
        {/* Left column — Editor */}
        <div className="h-[100vh] overflow-y-auto overflow-x-visible isolate flex-shrink-0 w-[40%] p-4 flex flex-col gap-3 border-r border-gray-200 bg-white">

          {/* ---- Auto-save Status ---- */}
          <div className="flex justify-between items-center text-[11px] text-[#9CA3AF]">
            <span>
              {isSaving ? "Saving..." : lastSaved ? `Last saved: ${lastSaved}` : ""}
            </span>
            {lastSaved && (
              <button
                onClick={handleClearCache}
                className="hover:underline cursor-pointer hover:text-red-500"
              >
                Clear saved data
              </button>
            )}
          </div>

          {/* ---- Style Controls (Module 6) ---- */}
          <SectionEditor title="Style" defaultOpen={false}>
            <StyleControls meta={data.meta} onChange={setMeta} />
          </SectionEditor>

          {/* ---- Header ---- */}
          <SectionEditor title="Header">
            <Input
              label="Full Name"
              value={data.header.name}
              onChange={(e) => setHeader({ name: e.target.value })}
            />
            <Input
              label="Title / Tagline"
              value={data.header.title}
              onChange={(e) => setHeader({ title: e.target.value })}
              hint='e.g. "Backend Engineer · Go · Distributed Systems"'
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Email"
                value={data.header.contact.email}
                onChange={(e) => setContact({ email: e.target.value })}
              />
              <Input
                label="Phone"
                value={data.header.contact.phone}
                onChange={(e) => setContact({ phone: e.target.value })}
                hint="+91 XXXXXXXXXX"
              />
              <Input
                label="City"
                value={data.header.contact.city}
                onChange={(e) => setContact({ city: e.target.value })}
                hint="City, Country"
              />
              <Input
                label="LinkedIn"
                value={data.header.contact.linkedin ?? ""}
                onChange={(e) =>
                  setContact({
                    linkedin: e.target.value || undefined,
                  })
                }
                hint="Optional"
              />
              <Input
                label="GitHub"
                value={data.header.contact.github ?? ""}
                onChange={(e) =>
                  setContact({
                    github: e.target.value || undefined,
                  })
                }
                hint="Optional"
              />
              <Input
                label="Portfolio"
                value={data.header.contact.portfolio ?? ""}
                onChange={(e) =>
                  setContact({
                    portfolio: e.target.value || undefined,
                  })
                }
                hint="Optional"
              />
            </div>
          </SectionEditor>

          {/* ---- Summary ---- */}
          <SectionEditor title="Summary">
            <Textarea
              label="Professional Summary"
              value={data.summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              hint="2-4 sentences. No bullet points."
            />
          </SectionEditor>

          {/* ---- Skills ---- */}
          <SectionEditor
            title="Skills"
            onAdd={() =>
              setSkills([...data.skills, { label: "", value: "" }])
            }
            addLabel="+ Add skill group"
          >
            {data.skills.map((skill, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-[100px_1fr] gap-2">
                  <Input
                    label={i === 0 ? "Label" : undefined}
                    value={skill.label}
                    onChange={(e) =>
                      setSkills(
                        updateAt(data.skills, i, { label: e.target.value })
                      )
                    }
                    placeholder="Backend"
                  />
                  <Input
                    label={i === 0 ? "Value" : undefined}
                    value={skill.value}
                    onChange={(e) =>
                      setSkills(
                        updateAt(data.skills, i, { value: e.target.value })
                      )
                    }
                    placeholder="Go, gRPC, REST APIs"
                  />
                </div>
                <div className="flex gap-0.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setSkills(moveItem(data.skills, i, i - 1))}
                    disabled={i === 0}
                    className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 px-1"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkills(moveItem(data.skills, i, i + 1))}
                    disabled={i === data.skills.length - 1}
                    className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 px-1"
                    title="Move down"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkills(removeAt(data.skills, i))}
                    title="Remove"
                    className="text-[16px] text-[#9CA3AF] hover:text-[#DC2626] bg-transparent border-none px-1 leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </SectionEditor>

          {/* ---- Experience ---- */}
          <SectionEditor
            title="Experience"
            onAdd={() =>
              setExperience([
                ...exp,
                {
                  title: "",
                  company: "",
                  startDate: "",
                  endDate: "",
                  bullets: [""],
                },
              ])
            }
            addLabel="+ Add experience"
          >
            {exp.map((job, i) => (
              <CollapsibleItem
                key={i}
                title={job.company || "Untitled Role"}
                isFirst={i === 0}
                isLast={i === exp.length - 1}
                onMoveUp={() => setExperience(moveItem(exp, i, i - 1))}
                onMoveDown={() => setExperience(moveItem(exp, i, i + 1))}
                onRemove={() => setExperience(removeAt(exp, i))}
              >
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Job Title"
                    value={job.title}
                    onChange={(e) =>
                      setExperience(
                        updateAt(exp, i, { title: e.target.value })
                      )
                    }
                  />
                  <Input
                    label="Company"
                    value={job.company}
                    onChange={(e) =>
                      setExperience(
                        updateAt(exp, i, { company: e.target.value })
                      )
                    }
                  />
                  <Input
                    label="Location"
                    value={job.location ?? ""}
                    onChange={(e) =>
                      setExperience(
                        updateAt(exp, i, {
                          location: e.target.value || undefined,
                        })
                      )
                    }
                    hint="Optional"
                  />
                  <Input
                    label="Employment Type"
                    value={job.employmentType ?? ""}
                    onChange={(e) =>
                      setExperience(
                        updateAt(exp, i, {
                          employmentType: e.target.value || undefined,
                        })
                      )
                    }
                    hint="Full-time / Internship / Contract"
                  />
                  <Input
                    label="Start Date"
                    value={job.startDate}
                    onChange={(e) =>
                      setExperience(
                        updateAt(exp, i, { startDate: e.target.value })
                      )
                    }
                    hint="e.g. Jun 2025"
                  />
                  <Input
                    label="End Date"
                    value={job.endDate}
                    onChange={(e) =>
                      setExperience(
                        updateAt(exp, i, { endDate: e.target.value })
                      )
                    }
                    hint='"Present" is valid'
                  />
                </div>
                <BulletEditor
                  bullets={job.bullets}
                  onChange={(bullets) =>
                    setExperience(updateAt(exp, i, { bullets }))
                  }
                />
              </CollapsibleItem>
            ))}
          </SectionEditor>

          {/* ---- Projects ---- */}
          <SectionEditor
            title="Projects"
            onAdd={() =>
              setProjects([
                ...data.projects,
                { name: "", tech: "", bullets: [""] },
              ])
            }
            addLabel="+ Add project"
          >
            {data.projects.map((proj, i) => (
              <CollapsibleItem
                key={i}
                title={proj.name || "Untitled Project"}
                isFirst={i === 0}
                isLast={i === data.projects.length - 1}
                onMoveUp={() => setProjects(moveItem(data.projects, i, i - 1))}
                onMoveDown={() => setProjects(moveItem(data.projects, i, i + 1))}
                onRemove={() => setProjects(removeAt(data.projects, i))}
              >
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Project Name"
                    value={proj.name}
                    onChange={(e) =>
                      setProjects(
                        updateAt(data.projects, i, { name: e.target.value })
                      )
                    }
                  />
                  <Input
                    label="Subtitle"
                    value={proj.subtitle ?? ""}
                    onChange={(e) =>
                      setProjects(
                        updateAt(data.projects, i, {
                          subtitle: e.target.value || undefined,
                        })
                      )
                    }
                    hint="Optional short descriptor"
                  />
                  <Input
                    label="Status"
                    value={proj.status ?? ""}
                    onChange={(e) =>
                      setProjects(
                        updateAt(data.projects, i, {
                          status: e.target.value || undefined,
                        })
                      )
                    }
                    hint="In Progress / Completed / Archived"
                  />
                  <Input
                    label="Tech Stack"
                    value={proj.tech}
                    onChange={(e) =>
                      setProjects(
                        updateAt(data.projects, i, { tech: e.target.value })
                      )
                    }
                    hint="Go · Redis · PostgreSQL"
                  />
                  <Input
                    label="Link"
                    value={proj.link ?? ""}
                    onChange={(e) =>
                      setProjects(
                        updateAt(data.projects, i, {
                          link: e.target.value || undefined,
                        })
                      )
                    }
                    hint="Optional URL"
                  />
                  <Input
                    label="Start Date"
                    value={proj.startDate ?? ""}
                    onChange={(e) =>
                      setProjects(
                        updateAt(data.projects, i, {
                          startDate: e.target.value || undefined,
                        })
                      )
                    }
                    hint="Optional"
                  />
                  <Input
                    label="End Date"
                    value={proj.endDate ?? ""}
                    onChange={(e) =>
                      setProjects(
                        updateAt(data.projects, i, {
                          endDate: e.target.value || undefined,
                        })
                      )
                    }
                    hint="Optional"
                  />
                </div>
                <BulletEditor
                  bullets={proj.bullets}
                  onChange={(bullets) =>
                    setProjects(updateAt(data.projects, i, { bullets }))
                  }
                />
              </CollapsibleItem>
            ))}
          </SectionEditor>

          {/* ---- Education ---- */}
          <SectionEditor
            title="Education"
            onAdd={() =>
              setEducation([
                ...data.education,
                {
                  degree: "",
                  institution: "",
                  startYear: "",
                  endYear: "",
                },
              ])
            }
            addLabel="+ Add education"
          >
            {data.education.map((edu, i) => (
              <CollapsibleItem
                key={i}
                title={edu.institution || "Untitled Education"}
                isFirst={i === 0}
                isLast={i === data.education.length - 1}
                onMoveUp={() => setEducation(moveItem(data.education, i, i - 1))}
                onMoveDown={() => setEducation(moveItem(data.education, i, i + 1))}
                onRemove={() => setEducation(removeAt(data.education, i))}
              >
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Degree"
                    value={edu.degree}
                    onChange={(e) =>
                      setEducation(
                        updateAt(data.education, i, {
                          degree: e.target.value,
                        })
                      )
                    }
                    hint="e.g. Integrated M.Tech in Software Engineering"
                  />
                  <Input
                    label="Institution"
                    value={edu.institution}
                    onChange={(e) =>
                      setEducation(
                        updateAt(data.education, i, {
                          institution: e.target.value,
                        })
                      )
                    }
                  />
                  <Input
                    label="Location"
                    value={edu.location ?? ""}
                    onChange={(e) =>
                      setEducation(
                        updateAt(data.education, i, {
                          location: e.target.value || undefined,
                        })
                      )
                    }
                    hint="Optional"
                  />
                  <Input
                    label="GPA"
                    value={edu.gpa ?? ""}
                    onChange={(e) =>
                      setEducation(
                        updateAt(data.education, i, {
                          gpa: e.target.value || undefined,
                        })
                      )
                    }
                    hint="Omit if below threshold"
                  />
                  <Input
                    label="Start Year"
                    value={edu.startYear}
                    onChange={(e) =>
                      setEducation(
                        updateAt(data.education, i, {
                          startYear: e.target.value,
                        })
                      )
                    }
                  />
                  <Input
                    label="End Year"
                    value={edu.endYear}
                    onChange={(e) =>
                      setEducation(
                        updateAt(data.education, i, {
                          endYear: e.target.value,
                        })
                      )
                    }
                    hint='"Expected 2027" is valid'
                  />
                </div>
                <Textarea
                  label="Coursework"
                  value={edu.coursework ?? ""}
                  onChange={(e) =>
                    setEducation(
                      updateAt(data.education, i, {
                        coursework: e.target.value || undefined,
                      })
                    )
                  }
                  rows={2}
                  hint="Comma-separated relevant courses. Max 6."
                />
                <BulletEditor
                  bullets={edu.achievements ?? []}
                  onChange={(achievements) =>
                    setEducation(
                      updateAt(data.education, i, { achievements })
                    )
                  }
                  label="Achievements"
                  placeholder="Scholarships, awards, honours"
                />
              </CollapsibleItem>
            ))}
          </SectionEditor>

          {/* ---- Certifications ---- */}
          <SectionEditor
            title="Certifications"
            defaultOpen={certs.length > 0}
            onAdd={() =>
              setCertifications([
                ...certs,
                { name: "", issuer: "" },
              ])
            }
            addLabel="+ Add certification"
          >
            {certs.map((cert, i) => (
              <CollapsibleItem
                key={i}
                title={cert.name || "Untitled Certification"}
                isFirst={i === 0}
                isLast={i === certs.length - 1}
                onMoveUp={() => setCertifications(moveItem(certs, i, i - 1))}
                onMoveDown={() => setCertifications(moveItem(certs, i, i + 1))}
                onRemove={() => setCertifications(removeAt(certs, i))}
              >
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Certification Name"
                    value={cert.name}
                    onChange={(e) =>
                      setCertifications(
                        updateAt(certs, i, { name: e.target.value })
                      )
                    }
                  />
                  <Input
                    label="Issuer"
                    value={cert.issuer}
                    onChange={(e) =>
                      setCertifications(
                        updateAt(certs, i, { issuer: e.target.value })
                      )
                    }
                  />
                  <Input
                    label="Date"
                    value={cert.date ?? ""}
                    onChange={(e) =>
                      setCertifications(
                        updateAt(certs, i, {
                          date: e.target.value || undefined,
                        })
                      )
                    }
                    hint="Optional. e.g. Mar 2024"
                  />
                  <Input
                    label="Credential URL"
                    value={cert.credentialUrl ?? ""}
                    onChange={(e) =>
                      setCertifications(
                        updateAt(certs, i, {
                          credentialUrl: e.target.value || undefined,
                        })
                      )
                    }
                    hint="Optional verification link"
                  />
                </div>
              </CollapsibleItem>
            ))}
          </SectionEditor>

          {/* ---- Open Source ---- */}
          <SectionEditor
            title="Open Source"
            defaultOpen={oss.length > 0}
            onAdd={() =>
              setOpenSource([
                ...oss,
                { project: "", description: "" },
              ])
            }
            addLabel="+ Add contribution"
          >
            {oss.map((contrib, i) => (
              <CollapsibleItem
                key={i}
                title={contrib.project || "Untitled Contribution"}
                isFirst={i === 0}
                isLast={i === oss.length - 1}
                onMoveUp={() => setOpenSource(moveItem(oss, i, i - 1))}
                onMoveDown={() => setOpenSource(moveItem(oss, i, i + 1))}
                onRemove={() => setOpenSource(removeAt(oss, i))}
              >
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Project"
                    value={contrib.project}
                    onChange={(e) =>
                      setOpenSource(
                        updateAt(oss, i, { project: e.target.value })
                      )
                    }
                    hint="e.g. kubernetes/kubernetes"
                  />
                  <Input
                    label="PR Link"
                    value={contrib.prLink ?? ""}
                    onChange={(e) =>
                      setOpenSource(
                        updateAt(oss, i, {
                          prLink: e.target.value || undefined,
                        })
                      )
                    }
                    hint="Optional"
                  />
                </div>
                <Textarea
                  label="Description"
                  value={contrib.description}
                  onChange={(e) =>
                    setOpenSource(
                      updateAt(oss, i, { description: e.target.value })
                    )
                  }
                  rows={2}
                  hint="One line: what you contributed."
                />
                <Input
                  label="Impact"
                  value={contrib.impact ?? ""}
                  onChange={(e) =>
                    setOpenSource(
                      updateAt(oss, i, {
                        impact: e.target.value || undefined,
                      })
                    )
                  }
                  hint='Optional. e.g. "Merged. Affects 10k+ users."'
                />
              </CollapsibleItem>
            ))}
          </SectionEditor>

          {/* Bottom spacer */}
          <div className="h-8 shrink-0" />
        </div>

        {/* Right column — Preview */}
        <div
          ref={previewColRef}
          className="h-[100vh] overflow-y-auto flex-shrink-0 w-[60%] bg-gray-100 flex justify-center items-start py-8"
        >
          <div
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: "top center",
              width: `${PREVIEW_WIDTH + 32}px`,
              display: "flex",
              justifyContent: "center"
            }}
          >
            <ResumePreview data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
