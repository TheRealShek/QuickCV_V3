// components/Editor/StyleControls.tsx — Font, color, spacing customisation
// Architecture: Module 6. Accepts meta + onChange callback.
// All controls call onChange immediately on change, updating parent state.

"use client";

import { Input } from "@/components/ui/Input";
import type { ResumeData } from "@/types/resume";

interface StyleControlsProps {
  meta: ResumeData["meta"];
  onChange: (patch: Partial<ResumeData["meta"]>) => void;
}

export default function StyleControls({ meta, onChange }: StyleControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
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

      {/* Base Font Size — range 8-12 */}
      <Input
        label="Base Font Size"
        type="number"
        min={8}
        max={12}
        step={0.5}
        value={meta.baseFontSize}
        onChange={(e) =>
          onChange({ baseFontSize: parseFloat(e.target.value) || 8.5 })
        }
        hint="8–12 pt"
      />

      {/* Name Size — range 18-28 */}
      <Input
        label="Name Size"
        type="number"
        min={18}
        max={28}
        step={1}
        value={meta.nameSize}
        onChange={(e) =>
          onChange({ nameSize: parseFloat(e.target.value) || 22 })
        }
        hint="18–28 pt"
      />

      {/* Title Size — range 9-13 */}
      <Input
        label="Title Size"
        type="number"
        min={9}
        max={13}
        step={0.5}
        value={meta.titleSize}
        onChange={(e) =>
          onChange({ titleSize: parseFloat(e.target.value) || 10.5 })
        }
        hint="9–13 pt"
      />

      {/* Page Margin — range 30-60 */}
      <Input
        label="Page Margin"
        type="number"
        min={30}
        max={60}
        step={1}
        value={meta.pageMargin}
        onChange={(e) =>
          onChange({ pageMargin: parseInt(e.target.value) || 40 })
        }
        hint="30–60 pt"
      />

      {/* Section Spacing */}
      <Input
        label="Section Spacing"
        type="number"
        min={4}
        max={20}
        step={1}
        value={meta.sectionSpacing}
        onChange={(e) =>
          onChange({ sectionSpacing: parseInt(e.target.value) || 10 })
        }
        hint="Gap before sections"
      />

      {/* Bullet Spacing */}
      <Input
        label="Bullet Spacing"
        type="number"
        min={0}
        max={8}
        step={0.5}
        value={meta.bulletSpacing}
        onChange={(e) =>
          onChange({ bulletSpacing: parseFloat(e.target.value) || 2 })
        }
        hint="Gap between bullets"
      />

      {/* Page Size — LETTER or A4 */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs font-medium text-gray-600">Page Size</label>
        <select
          value={meta.pageSize}
          onChange={(e) =>
            onChange({ pageSize: e.target.value as "LETTER" | "A4" })
          }
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="LETTER">Letter (8.5 × 11)</option>
          <option value="A4">A4 (210 × 297mm)</option>
        </select>
      </div>
    </div>
  );
}
