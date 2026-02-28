// lib/layout.ts — Layout measurement and page break utilities
// All functions read from meta.pageSize — no hardcoded page dimensions.
// Section 10 + Section 11 of Architecture.

import type { PageSize } from "@/types/resume";

// Page dimensions — not hardcoded in the renderer
export const PAGE_DIMENSIONS: Record<
  PageSize,
  { width: number; height: number }
> = {
  LETTER: { width: 612, height: 792 },
  A4: { width: 595, height: 842 },
};

export function getUsableHeight(
  pageSize: PageSize,
  topMargin: number,
  bottomMargin: number,
): number {
  return PAGE_DIMENSIONS[pageSize].height - topMargin - bottomMargin;
}

export function remainingSpace(
  doc: PDFKit.PDFDocument,
  pageSize: PageSize,
  bottomMargin: number,
): number {
  return PAGE_DIMENSIONS[pageSize].height - doc.y - bottomMargin;
}

export function willFit(
  doc: PDFKit.PDFDocument,
  neededHeight: number,
  pageSize: PageSize,
  bottomMargin: number,
): boolean {
  return remainingSpace(doc, pageSize, bottomMargin) >= neededHeight;
}

export function addPageIfNeeded(
  doc: PDFKit.PDFDocument,
  neededHeight: number,
  pageSize: PageSize,
  bottomMargin: number,
): void {
  if (!willFit(doc, neededHeight, pageSize, bottomMargin)) {
    doc.addPage();
  }
}

// CORRECT height measurement — uses PDFKit word-wrap engine, not naive division.
// Section 11 Rule 1: Always set font state before measuring.
// Section 11 Rule 2: lineGap must match between measurement and render.
export function measureTextHeight(
  doc: PDFKit.PDFDocument,
  text: string,
  options: {
    width: number;
    font: string; // e.g. 'Regular' | 'Bold'
    fontSize: number; // points
    lineGap?: number;
  },
): number {
  doc.font(options.font).fontSize(options.fontSize);
  return doc.heightOfString(text, {
    width: options.width,
    lineGap: options.lineGap ?? 0,
  });
}
