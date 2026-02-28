// components/Preview/ResumePreview.tsx — HTML preview of resume (mirrors PDF)
// Architecture: Module 4.  Read-only.  Fixed-width container scaled to fit viewport.
// Rule 4: No Tailwind text utilities for font sizes — inline styles only, values from DESIGN.
// Section 10: Preview width from PAGE_DIMENSIONS[meta.pageSize], not hardcoded.
// Section 11 Rule 4: Colors from DESIGN.colors hex values, not Tailwind gray scale.

"use client";

import { PAGE_DIMENSIONS } from "@/lib/layout";
import type { ResumeData } from "@/types/resume";
import { useEffect, useRef, useState } from "react";
import {
    AccentDivider,
    CertificationsSection,
    EducationSection,
    ExperienceSection,
    HeaderSection,
    OpenSourceSection,
    ProjectsSection,
    SkillsSection,
    SummarySection,
} from "./PreviewSection";

interface ResumePreviewProps {
  data: ResumeData;
}

export default function ResumePreview({ data }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const PREVIEW_WIDTH = PAGE_DIMENSIONS[data.meta.pageSize].width;

  // Recalculate scale when container resizes
  useEffect(() => {
    function updateScale() {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement?.clientWidth ?? PREVIEW_WIDTH;
        // Leave 16px padding on each side
        const available = parentWidth - 32;
        const newScale = Math.min(available / PREVIEW_WIDTH, 1);
        setScale(newScale);
      }
    }

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [PREVIEW_WIDTH]);

  return (
    <div ref={containerRef} className="relative">
      {/* Approximate preview disclaimer — Architecture Section 10 */}
      <div
        className="text-center mb-2"
        style={{
          fontSize: "11px",
          color: "#9CA3AF",
        }}
      >
        Preview is approximate. Download PDF for exact output.
      </div>

      {/* Scaled preview container */}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${PREVIEW_WIDTH}px`,
          height: "auto",
        }}
      >
        {/* Resume page — white background, fixed width, page padding */}
        <div
          style={{
            width: `${PREVIEW_WIDTH}px`,
            minHeight: `${PAGE_DIMENSIONS[data.meta.pageSize].height}px`,
            backgroundColor: "#ffffff",
            fontFamily: "Inter, sans-serif",
            padding: `${data.meta.pageMargin}pt`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)",
          }}
        >
          <HeaderSection data={data} />
          <AccentDivider accentColor={data.meta.accentColor} />
          <SummarySection data={data} />
          <SkillsSection data={data} />
          <ExperienceSection data={data} />
          <ProjectsSection data={data} />
          <EducationSection data={data} />
          <CertificationsSection data={data} />
          <OpenSourceSection data={data} />
        </div>
      </div>
    </div>
  );
}
