// components/Editor/SectionEditor.tsx — Collapsible section wrapper for editor UI

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className={`shrink-0 border ${open ? 'border-gray-200 dark:border-gray-700 shadow-sm' : 'border-gray-100 dark:border-gray-800'} rounded-xl bg-white dark:bg-[#111111] overflow-hidden transition-colors duration-200`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${open ? 'bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{title}</span>
        <div className={`transform transition-transform duration-200 text-gray-400 flex items-center justify-center w-5 h-5 ${open ? 'rotate-180' : 'rotate-0'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 flex flex-col gap-4">
              {children}
              {onAdd && (
                <button
                  type="button"
                  onClick={onAdd}
                  className="self-start text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium tracking-tight mt-1"
                >
                  {addLabel}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
