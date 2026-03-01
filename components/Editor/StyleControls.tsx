// components/Editor/StyleControls.tsx — Font, color, spacing customisation
// Architecture: Module 6. Accepts meta + onChange callback.
// All controls call onChange immediately on change, updating parent state.

"use client";

import type { ResumeData } from "@/types/resume";

import type React from "react";

interface StyleControlsProps {
  meta: ResumeData["meta"];
  onChange: (patch: Partial<ResumeData["meta"]>) => void;
}

const defaultOrder = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "openSource",
];

const sectionLabels: Record<string, string> = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  openSource: "Open Source",
};

export default function StyleControls({ meta, onChange }: StyleControlsProps) {
  const currentOrder = meta.sectionOrder || defaultOrder;
  const hiddenSections = meta.hiddenSections || [];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData("index", index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("index"), 10);
    if (isNaN(dragIndex) || dragIndex === dropIndex) return;

    const newOrder = [...currentOrder];
    const [draggedItem] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);
    onChange({ sectionOrder: newOrder });
  };

  const toggleVisibility = (key: string) => {
    const isHidden = hiddenSections.includes(key);
    if (isHidden) {
      onChange({ hiddenSections: hiddenSections.filter((k) => k !== key) });
    } else {
      onChange({ hiddenSections: [...hiddenSections, key] });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sections Overview Panel */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Sections
        </label>
        <div className="border border-gray-200 rounded divide-y divide-gray-100">
          {currentOrder.map((key, index) => {
            const isVisible = !hiddenSections.includes(key);
            return (
              <div
                key={key}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="flex items-center gap-2 p-2 bg-white hover:bg-gray-50 cursor-grab active:cursor-grabbing"
              >
                <div className="text-gray-400 text-sm cursor-grab active:cursor-grabbing w-4 text-center">
                  ⠿
                </div>
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => toggleVisibility(key)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className={`text-sm flex-1 ${!isVisible ? "text-gray-400" : "text-gray-700"}`}>
                  {sectionLabels[key] || key}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Styling Controls */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Styling
        </label>
        <div className="grid grid-cols-2 gap-4">
          {/* Accent Color — color picker */}
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-gray-600">
              Accent Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={meta.accentColor}
                onChange={(e) => onChange({ accentColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0"
              />
              <input
                type="text"
                value={meta.accentColor}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange({ accentColor: v });
                }}
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                maxLength={7}
              />
            </div>
          </div>

          {/* Base Font Size — range 7.5-11 */}
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-gray-600 flex justify-between">
              <span>Base Font Size</span>
              <span className="text-blue-600">{meta.baseFontSize} pt</span>
            </label>
            <input
              type="range"
              min={7.5}
              max={11}
              step={0.5}
              value={meta.baseFontSize}
              onChange={(e) =>
                onChange({ baseFontSize: parseFloat(e.target.value) || 8.5 })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-xs text-gray-400">7.5–11 pt</span>
          </div>

          {/* Name Size — range 16-26 */}
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-gray-600 flex justify-between">
              <span>Name Size</span>
              <span className="text-blue-600">{meta.nameSize} pt</span>
            </label>
            <input
              type="range"
              min={16}
              max={26}
              step={1}
              value={meta.nameSize}
              onChange={(e) =>
                onChange({ nameSize: parseFloat(e.target.value) || 22 })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-xs text-gray-400">16–26 pt</span>
          </div>

          {/* Title Size — range 9-13 */}
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-gray-600 flex justify-between">
              <span>Title Size</span>
              <span className="text-blue-600">{meta.titleSize} pt</span>
            </label>
            <input
              type="range"
              min={9}
              max={13}
              step={0.5}
              value={meta.titleSize}
              onChange={(e) =>
                onChange({ titleSize: parseFloat(e.target.value) || 10.5 })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-xs text-gray-400">9–13 pt</span>
          </div>

          {/* Page Margin — range 25-55 */}
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-gray-600 flex justify-between">
              <span>Page Margin</span>
              <span className="text-blue-600">{meta.pageMargin} pt</span>
            </label>
            <input
              type="range"
              min={25}
              max={55}
              step={1}
              value={meta.pageMargin}
              onChange={(e) =>
                onChange({ pageMargin: parseInt(e.target.value) || 40 })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-xs text-gray-400">25–55 pt</span>
          </div>

          {/* Section Spacing — range 4-16 */}
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-gray-600 flex justify-between">
              <span>Section Spacing</span>
              <span className="text-blue-600">{meta.sectionSpacing} pt</span>
            </label>
            <input
              type="range"
              min={4}
              max={16}
              step={1}
              value={meta.sectionSpacing}
              onChange={(e) =>
                onChange({ sectionSpacing: parseInt(e.target.value) || 10 })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-xs text-gray-400">Gap before sections</span>
          </div>

          {/* Bullet Spacing — range 0-4 */}
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-gray-600 flex justify-between">
              <span>Bullet Spacing</span>
              <span className="text-blue-600">{meta.bulletSpacing} pt</span>
            </label>
            <input
              type="range"
              min={0}
              max={4}
              step={0.5}
              value={meta.bulletSpacing}
              onChange={(e) =>
                onChange({ bulletSpacing: parseFloat(e.target.value) || 2 })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-xs text-gray-400">Gap between bullets</span>
          </div>

          {/* Page Size — LETTER or A4 */}
          <div className="flex flex-col gap-0.5 relative z-10">
            <label className="text-xs font-medium text-gray-600">Page Size</label>
            <select
              value={meta.pageSize}
              onChange={(e) =>
                onChange({ pageSize: e.target.value as "LETTER" | "A4" })
              }
              className="relative z-50 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="LETTER">Letter (8.5 × 11)</option>
              <option value="A4">A4 (210 × 297mm)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
