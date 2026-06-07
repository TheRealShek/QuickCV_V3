// components/ui/CollapsibleSection.tsx — Collapsible section with chevron animation

"use client";

import { useState, useRef, useEffect } from "react";

interface CollapsibleSectionProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleSection({
  title,
  badge,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(
    defaultOpen ? undefined : 0,
  );

  useEffect(() => {
    if (!contentRef.current) return;
    if (isOpen) {
      setHeight(contentRef.current.scrollHeight);
      // After transition, switch to auto so content can resize naturally
      const timer = setTimeout(() => setHeight(undefined), 300);
      return () => clearTimeout(timer);
    } else {
      // Force a reflow so the browser registers the current height before animating to 0
      setHeight(contentRef.current.scrollHeight);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHeight(0);
        });
      });
    }
  }, [isOpen]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-150"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        ref={contentRef}
        className="transition-[height] duration-300 ease-in-out overflow-hidden"
        style={{ height: height !== undefined ? `${height}px` : "auto" }}
      >
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}
