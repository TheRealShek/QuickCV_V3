// lib/pdf-generator.ts — Core PDF rendering engine
// Takes ResumeData, returns Buffer. Heart of QuickCV_V3.
// Architecture: Section 5 (structure), Section 10 (pagination), Section 11 (measurement rules)

import {
    PAGE_DIMENSIONS,
    addPageIfNeeded,
    measureTextHeight,
} from "@/lib/layout";
import { DESIGN } from "@/lib/styles";
import type { ResumeData } from "@/types/resume";
import path from "path";
import PDFDocument from "pdfkit";

// ---------------------------------------------------------------------------
// Font registration — Section 12 gotcha: use process.cwd() + 'public/fonts/'
// ---------------------------------------------------------------------------
function registerFonts(doc: PDFKit.PDFDocument) {
  const fontsDir = path.join(process.cwd(), "public", "fonts");
  doc.registerFont("Regular", path.join(fontsDir, "Inter-Regular.ttf"));
  doc.registerFont("Bold", path.join(fontsDir, "Inter-Bold.ttf"));
  doc.registerFont("Light", path.join(fontsDir, "Inter-Light.ttf"));
}

// ---------------------------------------------------------------------------
// Helper: available content width (page width minus left + right margins)
// ---------------------------------------------------------------------------
function contentWidth(data: ResumeData): number {
  const dims = PAGE_DIMENSIONS[data.meta.pageSize];
  return dims.width - data.meta.pageMargin * 2;
}

// ---------------------------------------------------------------------------
// Helper: left margin X position
// ---------------------------------------------------------------------------
function leftX(data: ResumeData): number {
  return data.meta.pageMargin;
}

// ---------------------------------------------------------------------------
// RENDER: Header — Section 2, SECTION 1
// Name: bold, nameSize, dark. Title: regular, titleSize, accent.
// Contact: regular, body size, mid, single line separated by " · "
// ---------------------------------------------------------------------------
function renderHeader(
  doc: PDFKit.PDFDocument,
  data: ResumeData,
) {
  const { header, meta } = data;
  const x = leftX(data);
  const w = contentWidth(data);

  // Name — largest element on page
  doc.font("Bold").fontSize(meta.nameSize).fillColor(DESIGN.colors.dark);
  doc.text(header.name, x, doc.y, { width: w });

  // Title — accent color, directly below name
  doc.font("Regular").fontSize(meta.titleSize).fillColor(meta.accentColor);
  doc.text(header.title, x, doc.y, { width: w });

  // Contact — single line, " · " separated, mid-gray
  const contactParts: string[] = [
    header.contact.email,
    header.contact.phone,
    header.contact.city,
  ];
  if (header.contact.linkedin) contactParts.push(header.contact.linkedin);
  if (header.contact.github) contactParts.push(header.contact.github);
  if (header.contact.portfolio) contactParts.push(header.contact.portfolio);

  const contactLine = contactParts.join(" · ");

  doc
    .font("Regular")
    .fontSize(meta.baseFontSize)
    .fillColor(DESIGN.colors.mid);
  doc.text(contactLine, x, doc.y, {
    width: w,
    lineGap: DESIGN.spacing.metaLineGap,
  });
}

// ---------------------------------------------------------------------------
// RENDER: Accent divider line — horizontal line in accent color
// ---------------------------------------------------------------------------
function renderDivider(
  doc: PDFKit.PDFDocument,
  data: ResumeData,
) {
  const x = leftX(data);
  const w = contentWidth(data);

  doc.moveDown(0.4);
  const y = doc.y;
  doc
    .moveTo(x, y)
    .lineTo(x + w, y)
    .strokeColor(data.meta.accentColor)
    .lineWidth(DESIGN.spacing.lineThickness)
    .stroke();
  doc.moveDown(0.4);
}

// ---------------------------------------------------------------------------
// RENDER: Section header — uppercase label with accent underline
// Architecture Section 2 rendering rules: section headers have bottom border
// ---------------------------------------------------------------------------
function renderSectionHeader(
  doc: PDFKit.PDFDocument,
  title: string,
  data: ResumeData,
) {
  const x = leftX(data);
  const w = contentWidth(data);

  doc.moveDown(0.2);

  // Section gap before header
  doc.y += data.meta.sectionSpacing;

  // Section title
  doc
    .font("Bold")
    .fontSize(DESIGN.fonts.sectionHeader)
    .fillColor(data.meta.accentColor);
  doc.text(title.toUpperCase(), x, doc.y, { width: w });

  // Accent underline
  const lineY = doc.y + 1;
  doc
    .moveTo(x, lineY)
    .lineTo(x + w, lineY)
    .strokeColor(data.meta.accentColor)
    .lineWidth(DESIGN.spacing.lineThickness)
    .stroke();

  doc.y = lineY + 4;
}

// ---------------------------------------------------------------------------
// RENDER: Summary — Section 2, SECTION 2
// Plain paragraph. No bold, no bullets. baseFontSize, mid-gray.
// ---------------------------------------------------------------------------
function renderSummary(
  doc: PDFKit.PDFDocument,
  data: ResumeData,
) {
  const x = leftX(data);
  const w = contentWidth(data);

  // Measure before drawing (Rule 1: set font before heightOfString)
  const h = measureTextHeight(doc, data.summary, {
    width: w,
    font: "Regular",
    fontSize: data.meta.baseFontSize,
    lineGap: DESIGN.spacing.bodyLineGap,
  });
  addPageIfNeeded(doc, h, data.meta.pageSize, data.meta.pageMargin);

  doc
    .font("Regular")
    .fontSize(data.meta.baseFontSize)
    .fillColor(DESIGN.colors.mid);
  doc.text(data.summary, x, doc.y, {
    width: w,
    lineGap: DESIGN.spacing.bodyLineGap,
  });
}

// ---------------------------------------------------------------------------
// RENDER: Skills — Section 2, SECTION 3
// Two-column table. Label bold dark, value regular mid-gray.
// No borders — whitespace separates rows. Fixed-width label column.
// ---------------------------------------------------------------------------
function renderSkills(
  doc: PDFKit.PDFDocument,
  data: ResumeData,
) {
  if (data.skills.length === 0) return;

  const x = leftX(data);
  const w = contentWidth(data);
  const labelColWidth = 90; // fixed label column
  const valueColWidth = w - labelColWidth - 8; // 8pt gap between columns
  const valueX = x + labelColWidth + 8;

  // Measure total height for page break check
  // Section header + all rows
  const headerHeight = measureTextHeight(doc, "SKILLS", {
    width: w,
    font: "Bold",
    fontSize: DESIGN.fonts.sectionHeader,
  });
  // Estimate at least header + 2 rows for orphan prevention (Rule 1 from Section 10)
  const firstRowHeight = data.skills[0]
    ? measureTextHeight(doc, data.skills[0].value, {
        width: valueColWidth,
        font: "Regular",
        fontSize: data.meta.baseFontSize,
        lineGap: DESIGN.spacing.bodyLineGap,
      })
    : 0;
  addPageIfNeeded(
    doc,
    headerHeight + 22 + firstRowHeight,
    data.meta.pageSize,
    data.meta.pageMargin,
  );

  renderSectionHeader(doc, "Skills", data);

  for (const skill of data.skills) {
    // Measure the taller of label/value to know row height
    const labelH = measureTextHeight(doc, skill.label, {
      width: labelColWidth,
      font: "Bold",
      fontSize: data.meta.baseFontSize,
      lineGap: DESIGN.spacing.bodyLineGap,
    });
    const valueH = measureTextHeight(doc, skill.value, {
      width: valueColWidth,
      font: "Regular",
      fontSize: data.meta.baseFontSize,
      lineGap: DESIGN.spacing.bodyLineGap,
    });
    const rowH = Math.max(labelH, valueH);

    addPageIfNeeded(doc, rowH, data.meta.pageSize, data.meta.pageMargin);

    const rowY = doc.y;

    // Label — bold, dark
    doc
      .font("Bold")
      .fontSize(data.meta.baseFontSize)
      .fillColor(DESIGN.colors.dark);
    doc.text(skill.label, x, rowY, {
      width: labelColWidth,
      lineGap: DESIGN.spacing.bodyLineGap,
    });

    // Value — regular, mid-gray
    doc
      .font("Regular")
      .fontSize(data.meta.baseFontSize)
      .fillColor(DESIGN.colors.mid);
    doc.text(skill.value, valueX, rowY, {
      width: valueColWidth,
      lineGap: DESIGN.spacing.bodyLineGap,
    });

    // Advance Y to the bottom of the taller column
    doc.y = rowY + rowH;
  }
}

// ---------------------------------------------------------------------------
// RENDER: A single bullet point
// "• " prefix, baseFontSize, mid-gray, leftIndent 12pt.
// ---------------------------------------------------------------------------
function renderBullet(
  doc: PDFKit.PDFDocument,
  bullet: string,
  data: ResumeData,
) {
  const x = leftX(data);
  const w = contentWidth(data);
  const indent = 12;
  const bulletWidth = w - indent;
  const bulletText = "• " + bullet;

  // Measure then draw (Rule 3 from Section 11: measure immediately before drawing)
  const h = measureTextHeight(doc, bulletText, {
    width: bulletWidth,
    font: "Regular",
    fontSize: data.meta.baseFontSize,
    lineGap: DESIGN.spacing.bulletLineGap,
  });
  addPageIfNeeded(doc, h, data.meta.pageSize, data.meta.pageMargin);

  doc
    .font("Regular")
    .fontSize(data.meta.baseFontSize)
    .fillColor(DESIGN.colors.mid);
  doc.text(bulletText, x + indent, doc.y, {
    width: bulletWidth,
    lineGap: DESIGN.spacing.bulletLineGap,
  });

  // Bullet spacing (gap between bullets)
  doc.y += data.meta.bulletSpacing;
}

// ---------------------------------------------------------------------------
// RENDER: Experience — Section 2, SECTION 4
// Job title: bold, dark, 9.5pt.
// Company + dates + type: single meta line, italic not available — use Light, light-gray, 8.5pt.
// Bullets: "• " prefix, 8.5pt, mid-gray, left indent 12pt.
// 4pt gap between bullets. 8pt gap between jobs.
// ---------------------------------------------------------------------------
function renderExperience(
  doc: PDFKit.PDFDocument,
  data: ResumeData,
) {
  if (!data.experience || data.experience.length === 0) return;

  const x = leftX(data);
  const w = contentWidth(data);

  // Section header with orphan prevention
  const headerHeight = measureTextHeight(doc, "EXPERIENCE", {
    width: w,
    font: "Bold",
    fontSize: DESIGN.fonts.sectionHeader,
  });
  addPageIfNeeded(
    doc,
    headerHeight + 28,
    data.meta.pageSize,
    data.meta.pageMargin,
  );

  renderSectionHeader(doc, "Experience", data);

  for (let i = 0; i < data.experience.length; i++) {
    const job = data.experience[i];

    // Build meta line: Company · StartDate – EndDate · Location · EmploymentType
    const metaParts: string[] = [job.company];
    metaParts.push(`${job.startDate} – ${job.endDate}`);
    if (job.location) metaParts.push(job.location);
    if (job.employmentType) metaParts.push(job.employmentType);
    const metaLine = metaParts.join(" · ");

    // Rule 2 from Section 10: Never split a job header from its first bullet
    const titleH = measureTextHeight(doc, job.title, {
      width: w,
      font: "Bold",
      fontSize: DESIGN.fonts.jobTitle,
      lineGap: DESIGN.spacing.metaLineGap,
    });
    const metaH = measureTextHeight(doc, metaLine, {
      width: w,
      font: "Light",
      fontSize: DESIGN.fonts.meta,
      lineGap: DESIGN.spacing.metaLineGap,
    });
    const firstBulletH = job.bullets[0]
      ? measureTextHeight(doc, "• " + job.bullets[0], {
          width: w - 12,
          font: "Regular",
          fontSize: data.meta.baseFontSize,
          lineGap: DESIGN.spacing.bulletLineGap,
        })
      : 0;

    addPageIfNeeded(
      doc,
      titleH + metaH + firstBulletH,
      data.meta.pageSize,
      data.meta.pageMargin,
    );

    // Job title — bold, dark, 9.5pt
    doc
      .font("Bold")
      .fontSize(DESIGN.fonts.jobTitle)
      .fillColor(DESIGN.colors.dark);
    doc.text(job.title, x, doc.y, {
      width: w,
      lineGap: DESIGN.spacing.metaLineGap,
    });

    // Meta line — Light font (closest to italic), light-gray, 8.5pt
    doc
      .font("Light")
      .fontSize(DESIGN.fonts.meta)
      .fillColor(DESIGN.colors.light);
    doc.text(metaLine, x, doc.y, {
      width: w,
      lineGap: DESIGN.spacing.metaLineGap,
    });

    doc.y += 2; // small gap before bullets

    // Bullets
    for (const bullet of job.bullets) {
      renderBullet(doc, bullet, data);
    }

    // 8pt gap between jobs
    if (i < data.experience.length - 1) {
      doc.y += 8;
    }
  }
}

// ---------------------------------------------------------------------------
// RENDER: Projects — Section 2, SECTION 5
// Name bold + status italic in parens. Tech + link on second line.
// Bullets below. 8pt vertical gap between projects.
// ---------------------------------------------------------------------------
function renderProjects(
  doc: PDFKit.PDFDocument,
  data: ResumeData,
) {
  if (data.projects.length === 0) return;

  const x = leftX(data);
  const w = contentWidth(data);

  // Section header with orphan prevention
  const headerHeight = measureTextHeight(doc, "PROJECTS", {
    width: w,
    font: "Bold",
    fontSize: DESIGN.fonts.sectionHeader,
  });
  addPageIfNeeded(
    doc,
    headerHeight + 28,
    data.meta.pageSize,
    data.meta.pageMargin,
  );

  renderSectionHeader(doc, "Projects", data);

  for (let i = 0; i < data.projects.length; i++) {
    const project = data.projects[i];

    // Build project name line: "Name (Status)" or just "Name"
    let nameLine = project.name;
    if (project.subtitle) {
      nameLine += ` — ${project.subtitle}`;
    }

    // Build tech/link meta line
    let techLine = project.tech;
    if (project.link) {
      techLine += ` · ${project.link}`;
    }
    // Include dates if present
    if (project.startDate || project.endDate) {
      const dateStr = [project.startDate, project.endDate]
        .filter(Boolean)
        .join(" – ");
      techLine += ` · ${dateStr}`;
    }

    // Rule 2 from Section 10: Never split project header from first bullet
    const nameH = measureTextHeight(doc, nameLine, {
      width: w,
      font: "Bold",
      fontSize: DESIGN.fonts.jobTitle,
      lineGap: DESIGN.spacing.metaLineGap,
    });
    const statusH = project.status
      ? measureTextHeight(doc, `(${project.status})`, {
          width: w,
          font: "Light",
          fontSize: DESIGN.fonts.meta,
          lineGap: DESIGN.spacing.metaLineGap,
        })
      : 0;
    const techH = measureTextHeight(doc, techLine, {
      width: w,
      font: "Regular",
      fontSize: DESIGN.fonts.meta,
      lineGap: DESIGN.spacing.metaLineGap,
    });
    const firstBulletH = project.bullets[0]
      ? measureTextHeight(doc, "• " + project.bullets[0], {
          width: w - 12,
          font: "Regular",
          fontSize: data.meta.baseFontSize,
          lineGap: DESIGN.spacing.bulletLineGap,
        })
      : 0;

    addPageIfNeeded(
      doc,
      nameH + statusH + techH + firstBulletH,
      data.meta.pageSize,
      data.meta.pageMargin,
    );

    // Project name — bold, dark, 9.5pt
    // Render name and status on same line
    doc
      .font("Bold")
      .fontSize(DESIGN.fonts.jobTitle)
      .fillColor(DESIGN.colors.dark);

    if (project.status) {
      // Measure name width to place status after it
      const nameWidth = doc.widthOfString(nameLine);
      doc.text(nameLine, x, doc.y, {
        width: w,
        lineGap: DESIGN.spacing.metaLineGap,
        continued: true,
      });
      // Status — Light font (italic substitute), light-gray, in parentheses
      doc
        .font("Light")
        .fontSize(DESIGN.fonts.meta)
        .fillColor(DESIGN.colors.light);
      doc.text(` (${project.status})`, {
        width: w - nameWidth,
        lineGap: DESIGN.spacing.metaLineGap,
      });
    } else {
      doc.text(nameLine, x, doc.y, {
        width: w,
        lineGap: DESIGN.spacing.metaLineGap,
      });
    }

    // Tech line + link — regular, light-gray, 8.5pt
    doc
      .font("Regular")
      .fontSize(DESIGN.fonts.meta)
      .fillColor(DESIGN.colors.light);
    doc.text(techLine, x, doc.y, {
      width: w,
      lineGap: DESIGN.spacing.metaLineGap,
    });

    doc.y += 2; // small gap before bullets

    // Bullets
    for (const bullet of project.bullets) {
      renderBullet(doc, bullet, data);
    }

    // 8pt vertical gap between projects
    if (i < data.projects.length - 1) {
      doc.y += 8;
    }
  }
}

// ---------------------------------------------------------------------------
// RENDER: Education — Section 2, SECTION 6
// Degree: bold, dark. Institution + dates: light-gray meta line.
// GPA, coursework, achievements: optional, regular, mid-gray.
// ---------------------------------------------------------------------------
function renderEducation(
  doc: PDFKit.PDFDocument,
  data: ResumeData,
) {
  if (data.education.length === 0) return;

  const x = leftX(data);
  const w = contentWidth(data);

  // Section header with orphan prevention
  const headerHeight = measureTextHeight(doc, "EDUCATION", {
    width: w,
    font: "Bold",
    fontSize: DESIGN.fonts.sectionHeader,
  });
  addPageIfNeeded(
    doc,
    headerHeight + 28,
    data.meta.pageSize,
    data.meta.pageMargin,
  );

  renderSectionHeader(doc, "Education", data);

  for (let i = 0; i < data.education.length; i++) {
    const edu = data.education[i];

    // Meta line: Institution · StartYear – EndYear · Location
    const metaParts: string[] = [edu.institution];
    metaParts.push(`${edu.startYear} – ${edu.endYear}`);
    if (edu.location) metaParts.push(edu.location);
    const metaLine = metaParts.join(" · ");

    // Measure header block for page break prevention
    const degreeH = measureTextHeight(doc, edu.degree, {
      width: w,
      font: "Bold",
      fontSize: DESIGN.fonts.jobTitle,
      lineGap: DESIGN.spacing.metaLineGap,
    });
    const metaH = measureTextHeight(doc, metaLine, {
      width: w,
      font: "Light",
      fontSize: DESIGN.fonts.meta,
      lineGap: DESIGN.spacing.metaLineGap,
    });

    addPageIfNeeded(
      doc,
      degreeH + metaH + 10,
      data.meta.pageSize,
      data.meta.pageMargin,
    );

    // Degree — bold, dark, 9.5pt
    doc
      .font("Bold")
      .fontSize(DESIGN.fonts.jobTitle)
      .fillColor(DESIGN.colors.dark);
    doc.text(edu.degree, x, doc.y, {
      width: w,
      lineGap: DESIGN.spacing.metaLineGap,
    });

    // Meta line — Light, light-gray
    doc
      .font("Light")
      .fontSize(DESIGN.fonts.meta)
      .fillColor(DESIGN.colors.light);
    doc.text(metaLine, x, doc.y, {
      width: w,
      lineGap: DESIGN.spacing.metaLineGap,
    });

    // GPA — if present
    if (edu.gpa) {
      doc.y += 2;
      doc
        .font("Regular")
        .fontSize(data.meta.baseFontSize)
        .fillColor(DESIGN.colors.mid);
      doc.text(`GPA: ${edu.gpa}`, x, doc.y, {
        width: w,
        lineGap: DESIGN.spacing.bodyLineGap,
      });
    }

    // Coursework — if present
    if (edu.coursework) {
      doc.y += 2;
      doc
        .font("Regular")
        .fontSize(data.meta.baseFontSize)
        .fillColor(DESIGN.colors.mid);
      doc.text(`Relevant Coursework: ${edu.coursework}`, x, doc.y, {
        width: w,
        lineGap: DESIGN.spacing.bodyLineGap,
      });
    }

    // Achievements — if present
    if (edu.achievements && edu.achievements.length > 0) {
      doc.y += 2;
      for (const achievement of edu.achievements) {
        renderBullet(doc, achievement, data);
      }
    }

    // Gap between education entries
    if (i < data.education.length - 1) {
      doc.y += 8;
    }
  }
}

// ---------------------------------------------------------------------------
// RENDER: Certifications — Section 2, SECTION 7
// One line per cert: Name — Issuer (Date)
// ---------------------------------------------------------------------------
function renderCertifications(
  doc: PDFKit.PDFDocument,
  data: ResumeData,
) {
  if (!data.certifications || data.certifications.length === 0) return;

  const x = leftX(data);
  const w = contentWidth(data);

  // Section header with orphan prevention
  const headerHeight = measureTextHeight(doc, "CERTIFICATIONS", {
    width: w,
    font: "Bold",
    fontSize: DESIGN.fonts.sectionHeader,
  });
  addPageIfNeeded(
    doc,
    headerHeight + 22,
    data.meta.pageSize,
    data.meta.pageMargin,
  );

  renderSectionHeader(doc, "Certifications", data);

  for (const cert of data.certifications) {
    // Build line: Name — Issuer (Date)
    let line = `${cert.name} — ${cert.issuer}`;
    if (cert.date) {
      line += ` (${cert.date})`;
    }

    const h = measureTextHeight(doc, line, {
      width: w,
      font: "Regular",
      fontSize: data.meta.baseFontSize,
      lineGap: DESIGN.spacing.bodyLineGap,
    });
    addPageIfNeeded(doc, h, data.meta.pageSize, data.meta.pageMargin);

    doc
      .font("Regular")
      .fontSize(data.meta.baseFontSize)
      .fillColor(DESIGN.colors.mid);
    doc.text(line, x, doc.y, {
      width: w,
      lineGap: DESIGN.spacing.bodyLineGap,
    });

    // credentialUrl — rendered as accent-colored text below if present
    if (cert.credentialUrl) {
      doc
        .font("Regular")
        .fontSize(data.meta.baseFontSize)
        .fillColor(data.meta.accentColor);
      doc.text(cert.credentialUrl, x, doc.y, {
        width: w,
        lineGap: DESIGN.spacing.metaLineGap,
        link: cert.credentialUrl.startsWith("http")
          ? cert.credentialUrl
          : `https://${cert.credentialUrl}`,
      });
      // Reset fill color
      doc.fillColor(DESIGN.colors.mid);
    }

    doc.y += data.meta.bulletSpacing;
  }
}

// ---------------------------------------------------------------------------
// RENDER: Open Source — Section 2, SECTION 8
// Project name, description, PR link, impact.
// ---------------------------------------------------------------------------
function renderOpenSource(
  doc: PDFKit.PDFDocument,
  data: ResumeData,
) {
  if (!data.openSource || data.openSource.length === 0) return;

  const x = leftX(data);
  const w = contentWidth(data);

  // Section header with orphan prevention
  const headerHeight = measureTextHeight(doc, "OPEN SOURCE", {
    width: w,
    font: "Bold",
    fontSize: DESIGN.fonts.sectionHeader,
  });
  addPageIfNeeded(
    doc,
    headerHeight + 22,
    data.meta.pageSize,
    data.meta.pageMargin,
  );

  renderSectionHeader(doc, "Open Source", data);

  for (let i = 0; i < data.openSource.length; i++) {
    const contrib = data.openSource[i];

    // Project name — bold, dark
    const nameH = measureTextHeight(doc, contrib.project, {
      width: w,
      font: "Bold",
      fontSize: DESIGN.fonts.jobTitle,
      lineGap: DESIGN.spacing.metaLineGap,
    });
    const descH = measureTextHeight(doc, contrib.description, {
      width: w,
      font: "Regular",
      fontSize: data.meta.baseFontSize,
      lineGap: DESIGN.spacing.bodyLineGap,
    });

    addPageIfNeeded(
      doc,
      nameH + descH,
      data.meta.pageSize,
      data.meta.pageMargin,
    );

    // Project name
    doc
      .font("Bold")
      .fontSize(DESIGN.fonts.jobTitle)
      .fillColor(DESIGN.colors.dark);
    doc.text(contrib.project, x, doc.y, {
      width: w,
      lineGap: DESIGN.spacing.metaLineGap,
    });

    // Description
    doc
      .font("Regular")
      .fontSize(data.meta.baseFontSize)
      .fillColor(DESIGN.colors.mid);
    doc.text(contrib.description, x, doc.y, {
      width: w,
      lineGap: DESIGN.spacing.bodyLineGap,
    });

    // PR Link — accent color if present
    if (contrib.prLink) {
      doc
        .font("Regular")
        .fontSize(data.meta.baseFontSize)
        .fillColor(data.meta.accentColor);
      doc.text(contrib.prLink, x, doc.y, {
        width: w,
        lineGap: DESIGN.spacing.metaLineGap,
        link: contrib.prLink.startsWith("http")
          ? contrib.prLink
          : `https://${contrib.prLink}`,
      });
      doc.fillColor(DESIGN.colors.mid);
    }

    // Impact — if present
    if (contrib.impact) {
      doc
        .font("Light")
        .fontSize(DESIGN.fonts.meta)
        .fillColor(DESIGN.colors.light);
      doc.text(contrib.impact, x, doc.y, {
        width: w,
        lineGap: DESIGN.spacing.metaLineGap,
      });
    }

    // Gap between contributions
    if (i < data.openSource.length - 1) {
      doc.y += 8;
    }
  }
}

// ---------------------------------------------------------------------------
// MAIN: generateResumePDF — orchestrator
// Creates document, registers fonts, renders all sections in order,
// returns Buffer. Architecture Section 5 structure.
// ---------------------------------------------------------------------------
export async function generateResumePDF(
  data: ResumeData,
): Promise<Buffer> {
  const dims = PAGE_DIMENSIONS[data.meta.pageSize];

  const doc = new PDFDocument({
    size: [dims.width, dims.height],
    margins: {
      top: data.meta.pageMargin,
      bottom: data.meta.pageMargin,
      left: data.meta.pageMargin,
      right: data.meta.pageMargin,
    },
    compress: true,
    info: {
      Title: `${data.header.name} — Resume`,
      Author: data.header.name,
    },
  });

  // Register custom fonts
  registerFonts(doc);

  // Render sections in order (V1 — hardcoded order per architecture)
  renderHeader(doc, data);
  renderDivider(doc, data);
  renderSummary(doc, data);
  renderSkills(doc, data);
  renderExperience(doc, data);
  renderProjects(doc, data);
  renderEducation(doc, data);
  renderCertifications(doc, data);
  renderOpenSource(doc, data);

  doc.end();

  // Convert stream to Buffer (required for API response)
  // Section 12 gotcha: doc.end() does not return a Promise — collect chunks manually
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}
