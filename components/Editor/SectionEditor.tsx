// components/Editor/SectionEditor.tsx — Collapsible section wrapper for editor UI

"use client";

import { useState } from "react";

interface SectionEditorProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
}

export default function SectionEditor({
  title,
  defaultOpen = true,
  children,
  onAdd,
  addLabel = "+ Add",
}: SectionEditorProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <span className="text-xs text-gray-400">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="p-3 flex flex-col gap-3">
          {children}
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="self-start text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {addLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
