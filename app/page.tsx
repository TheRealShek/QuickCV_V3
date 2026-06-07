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
import { motion } from "framer-motion";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/Editor/SortableItem';
import { ThemeToggle } from "@/components/ThemeToggle";

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
  const [schemaBannerDismissed, setSchemaBannerDismissed] = useState(false);

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
  const [zoomLevel, setZoomLevel] = useState<number | "fit">("fit");

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
  const fitScale = colWidth > 0 ? availableWidth / PREVIEW_WIDTH : 1;
  const computedScale = zoomLevel === "fit" ? fitScale : zoomLevel;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const activeParts = (active.id as string).split("-");
      const overParts = (over.id as string).split("-");
      if (activeParts[0] !== overParts[0]) return;

      const section = activeParts[0];
      const oldIndex = parseInt(activeParts[1]);
      const newIndex = parseInt(overParts[1]);

      switch(section) {
        case 'skills': setSkills(arrayMove(data.skills, oldIndex, newIndex)); break;
        case 'experience': setExperience(arrayMove(exp, oldIndex, newIndex)); break;
        case 'projects': setProjects(arrayMove(data.projects, oldIndex, newIndex)); break;
        case 'education': setEducation(arrayMove(data.education, oldIndex, newIndex)); break;
        case 'certifications': setCertifications(arrayMove(certs, oldIndex, newIndex)); break;
        case 'openSource': setOpenSource(arrayMove(oss, oldIndex, newIndex)); break;
      }
    }
  };

  return (
    <div className="flex flex-col h-[100vh] overflow-hidden bg-gray-100 dark:bg-[#1e1e1e] transition-colors">
      {/* Top bar */}
      <header className="bg-white/70 dark:bg-[#252525]/80 backdrop-blur-md border-b border-white/20 dark:border-white/5 px-6 py-4 flex items-center justify-between shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.05)] z-50">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">QuickCV</h1>
        <div className="flex items-center gap-3 relative z-50">
          <ThemeToggle />
          
          {/* Data Controls for Export & Import JSON payloads */}
          <DataControls data={data} onImport={setFullState} />

          {/* Download PDF button — exact architecture pattern */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-shadow
              ${isGenerating ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 hover:shadow"}`}
            style={{ backgroundColor: data.meta.accentColor }}
          >
            {isGenerating ? "Generating..." : "Download PDF"}
          </motion.button>
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
      <main className="flex-1 flex overflow-hidden">
        {/* Left column — Editor */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="scrollbar-thin h-full overflow-y-auto overflow-x-visible isolate w-[45%] min-w-[320px] p-6 flex flex-col gap-4 border-r border-gray-200 dark:border-white/5 bg-white dark:bg-[#252525] shadow-[10px_0_30px_rgba(0,0,0,0.05)] z-20 relative transition-colors">

          {/* ---- Schema guide callout ---- */}
          <div className={`shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${schemaBannerDismissed ? 'max-h-0 opacity-0 mb-0' : 'max-h-[200px] opacity-100'}`}>
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-[13px] text-blue-800 dark:text-blue-200 leading-relaxed shadow-sm">
              <span className="shrink-0 mt-0.5">📋</span>
              <span className="flex-1 min-w-0 break-words">
                New here? Read the{" "}
                <a
                  href="/schema"
                  className="font-semibold underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-100"
                >
                  Schema Reference
                </a>{" "}
                to understand the JSON format. Also available as{" "}
                <a
                  href="/api/schema"
                  className="font-semibold underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-100"
                >
                  plain text
                </a>{" "}
                for AI agents.
              </span>
                <button
                  onClick={() => setSchemaBannerDismissed(true)}
                  className="shrink-0 ml-auto text-blue-400 hover:text-blue-700 transition-colors p-1"
                  aria-label="Dismiss"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

          {/* ---- Auto-save Status ---- */}
          <div className="shrink-0 flex justify-between items-center text-[11px] text-[#9CA3AF]">
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
            <SortableContext items={data.skills.map((_, i) => `skills-${i}`)} strategy={verticalListSortingStrategy}>
              {data.skills.map((skill, i) => (
                <SortableItem key={`skills-${i}`} id={`skills-${i}`}>
                  {(dragHandleProps) => (
                    <div className="flex gap-2 items-start bg-white dark:bg-[#2a2a2a] p-2 rounded-lg border border-transparent dark:border-white/5 z-10 transition-colors">
                      <div {...dragHandleProps} className="mt-1.5 cursor-grab hover:bg-gray-100 dark:hover:bg-white/5 p-1 rounded text-gray-400 dark:text-gray-500 text-lg leading-none mr-1" title="Drag to reorder">
                        ⋮⋮
                      </div>
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
                      <div className="flex gap-0.5 mt-1 items-center h-full pt-1.5">
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
                  )}
                </SortableItem>
              ))}
            </SortableContext>
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
            <SortableContext items={exp.map((_, i) => `experience-${i}`)} strategy={verticalListSortingStrategy}>
              {exp.map((job, i) => (
                <SortableItem key={`experience-${i}`} id={`experience-${i}`}>
                  {(dragHandleProps) => (
                    <CollapsibleItem
                      title={job.company || "Untitled Role"}
                      onRemove={() => setExperience(removeAt(exp, i))}
                      dragHandleProps={dragHandleProps}
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
                  )}
                </SortableItem>
              ))}
            </SortableContext>
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
            <SortableContext items={data.projects.map((_, i) => `projects-${i}`)} strategy={verticalListSortingStrategy}>
              {data.projects.map((proj, i) => (
                <SortableItem key={`projects-${i}`} id={`projects-${i}`}>
                  {(dragHandleProps) => (
                    <CollapsibleItem
                      title={proj.name || "Untitled Project"}
                      onRemove={() => setProjects(removeAt(data.projects, i))}
                      dragHandleProps={dragHandleProps}
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
                  )}
                </SortableItem>
              ))}
            </SortableContext>
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
            <SortableContext items={data.education.map((_, i) => `education-${i}`)} strategy={verticalListSortingStrategy}>
              {data.education.map((edu, i) => (
                <SortableItem key={`education-${i}`} id={`education-${i}`}>
                  {(dragHandleProps) => (
                    <CollapsibleItem
                      title={edu.institution || "Untitled Education"}
                      onRemove={() => setEducation(removeAt(data.education, i))}
                      dragHandleProps={dragHandleProps}
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
                  )}
                </SortableItem>
              ))}
            </SortableContext>
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
            <SortableContext items={certs.map((_, i) => `certifications-${i}`)} strategy={verticalListSortingStrategy}>
              {certs.map((cert, i) => (
                <SortableItem key={`certifications-${i}`} id={`certifications-${i}`}>
                  {(dragHandleProps) => (
                    <CollapsibleItem
                      title={cert.name || "Untitled Certification"}
                      onRemove={() => setCertifications(removeAt(certs, i))}
                      dragHandleProps={dragHandleProps}
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
                  )}
                </SortableItem>
              ))}
            </SortableContext>
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
            <SortableContext items={oss.map((_, i) => `openSource-${i}`)} strategy={verticalListSortingStrategy}>
              {oss.map((contrib, i) => (
                <SortableItem key={`openSource-${i}`} id={`openSource-${i}`}>
                  {(dragHandleProps) => (
                    <CollapsibleItem
                      title={contrib.project || "Untitled Contribution"}
                      onRemove={() => setOpenSource(removeAt(oss, i))}
                      dragHandleProps={dragHandleProps}
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
                        hint="Optional"
                      />
                    </CollapsibleItem>
                  )}
                </SortableItem>
              ))}
            </SortableContext>
          </SectionEditor>

          {/* Bottom spacer */}
          <div className="h-8 shrink-0" />
        </div>
        </DndContext>

        {/* Right column — Preview */}
        <div
          ref={previewColRef}
          className="scrollbar-thin relative h-full overflow-y-auto overflow-x-auto flex-1 bg-gray-50 dark:bg-[#1e1e1e] flex justify-center items-start py-8 transition-colors"
        >
          {/* Ambient Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
          
          {/* Floating Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-[calc(27.5%-100px)] bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-full px-4 py-2 flex items-center gap-2 z-50"
          >
            <button
              onClick={() => setZoomLevel((prev) => (prev === "fit" ? fitScale - 0.1 : prev - 0.1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/60 text-gray-700 transition-colors"
              title="Zoom Out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <span className="text-xs font-semibold text-gray-700 min-w-[50px] text-center">
              {zoomLevel === "fit" ? "Fit" : `${Math.round(zoomLevel * 100)}%`}
            </span>
            <button
              onClick={() => setZoomLevel((prev) => (prev === "fit" ? fitScale + 0.1 : prev + 0.1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/60 text-gray-700 transition-colors"
              title="Zoom In"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
            <button
              onClick={() => setZoomLevel("fit")}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${zoomLevel === "fit" ? "bg-blue-100/80 text-blue-700" : "hover:bg-white/60 text-gray-600"}`}
            >
              Fit to Screen
            </button>
          </motion.div>

          <div
            className="relative z-10"
            style={{
              transform: `scale(${computedScale})`,
              transformOrigin: "top center",
              width: `${PREVIEW_WIDTH + 32}px`,
              display: "flex",
              justifyContent: "center"
            }}
          >
            {(!data.header.name && !data.header.title && !data.summary && data.skills.length === 0 && exp.length === 0 && data.education.length === 0 && data.projects.length === 0 && certs.length === 0 && oss.length === 0) ? (
              <div className="flex flex-col items-center justify-center w-full min-h-[500px] text-gray-400">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-500">Your resume is empty</p>
                <p className="text-xs mt-1 text-gray-400">Fill out the form on the left or import JSON to get started.</p>
              </div>
            ) : (
              <ResumePreview data={data} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
