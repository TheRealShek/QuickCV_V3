// components/Preview/PreviewSection.tsx — Individual section renderer for HTML preview
// Architecture: Module 4.  Read-only. Inline styles for font sizes (Rule 4).
// Colors: exact hex from DESIGN.colors, not Tailwind gray scale.

"use client";

import { DESIGN } from "@/lib/styles";
import type { ResumeData } from "@/types/resume";

// ---------------------------------------------------------------------------
// Section Header — uppercase label with accent bottom border
// ---------------------------------------------------------------------------
export function SectionHeader({
  title,
  accentColor,
}: {
  title: string;
  accentColor: string;
}) {
  return (
    <div
      style={{
        marginTop: `${DESIGN.spacing.sectionGap}pt`,
        paddingBottom: "2pt",
        borderBottom: `${DESIGN.spacing.lineThickness}px solid ${accentColor}`,
        marginBottom: "4pt",
      }}
    >
      <span
        style={{
          fontSize: `${DESIGN.fonts.sectionHeader}pt`,
          fontWeight: 700,
          color: accentColor,
          letterSpacing: "0.5px",
        }}
      >
        {title.toUpperCase()}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bullet point — "•" prefix, body font, mid-gray
// ---------------------------------------------------------------------------
export function BulletPoint({
  text,
  baseFontSize,
}: {
  text: string;
  baseFontSize: number;
}) {
  return (
    <div
      style={{
        fontSize: `${baseFontSize}pt`,
        color: DESIGN.colors.mid,
        lineHeight: 1.4,
        paddingLeft: "12pt",
        marginBottom: `${DESIGN.spacing.bulletGap}pt`,
      }}
    >
      • {text}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header Section — name, title, contact line
// ---------------------------------------------------------------------------
export function HeaderSection({ data }: { data: ResumeData }) {
  const { header, meta } = data;

  const contactParts: string[] = [
    header.contact.email,
    header.contact.phone,
    header.contact.city,
  ];
  if (header.contact.linkedin) contactParts.push(header.contact.linkedin);
  if (header.contact.github) contactParts.push(header.contact.github);
  if (header.contact.portfolio) contactParts.push(header.contact.portfolio);

  return (
    <div>
      {/* Name — largest element */}
      <div
        style={{
          fontSize: `${meta.nameSize}pt`,
          fontWeight: 700,
          color: DESIGN.colors.dark,
          lineHeight: 1.2,
        }}
      >
        {header.name}
      </div>

      {/* Title — accent color */}
      <div
        style={{
          fontSize: `${meta.titleSize}pt`,
          color: meta.accentColor,
          lineHeight: 1.3,
        }}
      >
        {header.title}
      </div>

      {/* Contact — single line, " · " separated */}
      <div
        style={{
          fontSize: `${meta.baseFontSize}pt`,
          color: DESIGN.colors.mid,
          lineHeight: 1.4,
        }}
      >
        {contactParts.join(" · ")}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Accent Divider — horizontal line
// ---------------------------------------------------------------------------
export function AccentDivider({ accentColor }: { accentColor: string }) {
  return (
    <hr
      style={{
        border: "none",
        borderTop: `${DESIGN.spacing.lineThickness}px solid ${accentColor}`,
        margin: "4pt 0",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Summary Section
// ---------------------------------------------------------------------------
export function SummarySection({ data }: { data: ResumeData }) {
  return (
    <div
      style={{
        fontSize: `${data.meta.baseFontSize}pt`,
        color: DESIGN.colors.mid,
        lineHeight: 1.4,
      }}
    >
      {data.summary}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skills Section — two-column layout: label bold left, value right
// ---------------------------------------------------------------------------
export function SkillsSection({ data }: { data: ResumeData }) {
  if (data.skills.length === 0) return null;

  return (
    <div>
      <SectionHeader title="Skills" accentColor={data.meta.accentColor} />
      {data.skills.map((skill, i) => (
        <div key={i} className="flex" style={{ marginBottom: "1pt" }}>
          <div
            style={{
              fontSize: `${data.meta.baseFontSize}pt`,
              fontWeight: 700,
              color: DESIGN.colors.dark,
              lineHeight: 1.4,
              width: "90pt",
              flexShrink: 0,
            }}
          >
            {skill.label}
          </div>
          <div
            style={{
              fontSize: `${data.meta.baseFontSize}pt`,
              color: DESIGN.colors.mid,
              lineHeight: 1.4,
              marginLeft: "8pt",
            }}
          >
            {skill.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Experience Section
// ---------------------------------------------------------------------------
export function ExperienceSection({ data }: { data: ResumeData }) {
  if (!data.experience || data.experience.length === 0) return null;

  return (
    <div>
      <SectionHeader title="Experience" accentColor={data.meta.accentColor} />
      {data.experience.map((job, i) => {
        const metaParts: string[] = [job.company];
        metaParts.push(`${job.startDate} – ${job.endDate}`);
        if (job.location) metaParts.push(job.location);
        if (job.employmentType) metaParts.push(job.employmentType);

        return (
          <div key={i} style={{ marginBottom: i < data.experience!.length - 1 ? "8pt" : 0 }}>
            {/* Job title — bold, dark */}
            <div
              style={{
                fontSize: `${DESIGN.fonts.jobTitle}pt`,
                fontWeight: 700,
                color: DESIGN.colors.dark,
                lineHeight: 1.3,
              }}
            >
              {job.title}
            </div>
            {/* Meta line — light, italic */}
            <div
              style={{
                fontSize: `${DESIGN.fonts.meta}pt`,
                color: DESIGN.colors.light,
                fontStyle: "italic",
                lineHeight: 1.3,
                marginBottom: "2pt",
              }}
            >
              {metaParts.join(" · ")}
            </div>
            {/* Bullets */}
            {job.bullets.map((bullet, j) => (
              <BulletPoint key={j} text={bullet} baseFontSize={data.meta.baseFontSize} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Projects Section
// ---------------------------------------------------------------------------
export function ProjectsSection({ data }: { data: ResumeData }) {
  if (data.projects.length === 0) return null;

  return (
    <div>
      <SectionHeader title="Projects" accentColor={data.meta.accentColor} />
      {data.projects.map((project, i) => {
        let techLine = project.tech;
        if (project.startDate || project.endDate) {
          const dateStr = [project.startDate, project.endDate]
            .filter(Boolean)
            .join(" – ");
          techLine += ` · ${dateStr}`;
        }

        return (
          <div key={i} style={{ marginBottom: i < data.projects.length - 1 ? "8pt" : 0 }}>
            {/* Project name + status */}
            <div style={{ lineHeight: 1.3 }}>
              <span
                style={{
                  fontSize: `${DESIGN.fonts.jobTitle}pt`,
                  fontWeight: 700,
                  color: DESIGN.colors.dark,
                }}
              >
                {project.name}
                {project.subtitle ? ` — ${project.subtitle}` : ""}
              </span>
              {project.status && (
                <span
                  style={{
                    fontSize: `${DESIGN.fonts.meta}pt`,
                    color: DESIGN.colors.light,
                    fontStyle: "italic",
                    marginLeft: "4pt",
                  }}
                >
                  ({project.status})
                </span>
              )}
            </div>
            {/* Tech line */}
            <div
              style={{
                fontSize: `${DESIGN.fonts.meta}pt`,
                color: DESIGN.colors.light,
                lineHeight: 1.3,
                marginBottom: project.link ? "1pt" : "2pt",
              }}
            >
              {techLine}
            </div>
            {/* Link — accent color (Architecture Section 2, SECTION 5) */}
            {project.link && (
              <div
                style={{
                  fontSize: `${DESIGN.fonts.meta}pt`,
                  color: data.meta.accentColor,
                  lineHeight: 1.3,
                  marginBottom: "2pt",
                }}
              >
                {project.link}
              </div>
            )}
            {/* Bullets */}
            {project.bullets.map((bullet, j) => (
              <BulletPoint key={j} text={bullet} baseFontSize={data.meta.baseFontSize} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Education Section
// ---------------------------------------------------------------------------
export function EducationSection({ data }: { data: ResumeData }) {
  if (data.education.length === 0) return null;

  return (
    <div>
      <SectionHeader title="Education" accentColor={data.meta.accentColor} />
      {data.education.map((edu, i) => {
        const metaParts: string[] = [edu.institution];
        metaParts.push(`${edu.startYear} – ${edu.endYear}`);
        if (edu.location) metaParts.push(edu.location);

        return (
          <div key={i} style={{ marginBottom: i < data.education.length - 1 ? "8pt" : 0 }}>
            {/* Degree — bold, dark */}
            <div
              style={{
                fontSize: `${DESIGN.fonts.jobTitle}pt`,
                fontWeight: 700,
                color: DESIGN.colors.dark,
                lineHeight: 1.3,
              }}
            >
              {edu.degree}
            </div>
            {/* Meta line */}
            <div
              style={{
                fontSize: `${DESIGN.fonts.meta}pt`,
                color: DESIGN.colors.light,
                fontStyle: "italic",
                lineHeight: 1.3,
              }}
            >
              {metaParts.join(" · ")}
            </div>
            {/* GPA */}
            {edu.gpa && (
              <div
                style={{
                  fontSize: `${data.meta.baseFontSize}pt`,
                  color: DESIGN.colors.mid,
                  lineHeight: 1.4,
                  marginTop: "2pt",
                }}
              >
                GPA: {edu.gpa}
              </div>
            )}
            {/* Coursework */}
            {edu.coursework && (
              <div
                style={{
                  fontSize: `${data.meta.baseFontSize}pt`,
                  color: DESIGN.colors.mid,
                  lineHeight: 1.4,
                  marginTop: "2pt",
                }}
              >
                Relevant Coursework: {edu.coursework}
              </div>
            )}
            {/* Achievements */}
            {edu.achievements && edu.achievements.length > 0 && (
              <div style={{ marginTop: "2pt" }}>
                {edu.achievements.map((a, j) => (
                  <BulletPoint key={j} text={a} baseFontSize={data.meta.baseFontSize} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Certifications Section
// ---------------------------------------------------------------------------
export function CertificationsSection({ data }: { data: ResumeData }) {
  if (!data.certifications || data.certifications.length === 0) return null;

  return (
    <div>
      <SectionHeader title="Certifications" accentColor={data.meta.accentColor} />
      {data.certifications.map((cert, i) => {
        let line = `${cert.name} — ${cert.issuer}`;
        if (cert.date) line += ` (${cert.date})`;

        return (
          <div key={i} style={{ marginBottom: `${data.meta.bulletSpacing}pt` }}>
            <div
              style={{
                fontSize: `${data.meta.baseFontSize}pt`,
                color: DESIGN.colors.mid,
                lineHeight: 1.4,
              }}
            >
              {line}
            </div>
            {cert.credentialUrl && (
              <div
                style={{
                  fontSize: `${data.meta.baseFontSize}pt`,
                  color: data.meta.accentColor,
                  lineHeight: 1.4,
                }}
              >
                {cert.credentialUrl}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Open Source Section
// ---------------------------------------------------------------------------
export function OpenSourceSection({ data }: { data: ResumeData }) {
  if (!data.openSource || data.openSource.length === 0) return null;

  return (
    <div>
      <SectionHeader title="Open Source" accentColor={data.meta.accentColor} />
      {data.openSource.map((contrib, i) => (
        <div key={i} style={{ marginBottom: i < data.openSource!.length - 1 ? "8pt" : 0 }}>
          {/* Project name */}
          <div
            style={{
              fontSize: `${DESIGN.fonts.jobTitle}pt`,
              fontWeight: 700,
              color: DESIGN.colors.dark,
              lineHeight: 1.3,
            }}
          >
            {contrib.project}
          </div>
          {/* Description */}
          <div
            style={{
              fontSize: `${data.meta.baseFontSize}pt`,
              color: DESIGN.colors.mid,
              lineHeight: 1.4,
            }}
          >
            {contrib.description}
          </div>
          {/* PR Link */}
          {contrib.prLink && (
            <div
              style={{
                fontSize: `${data.meta.baseFontSize}pt`,
                color: data.meta.accentColor,
                lineHeight: 1.4,
              }}
            >
              {contrib.prLink}
            </div>
          )}
          {/* Impact */}
          {contrib.impact && (
            <div
              style={{
                fontSize: `${DESIGN.fonts.meta}pt`,
                color: DESIGN.colors.light,
                fontStyle: "italic",
                lineHeight: 1.4,
              }}
            >
              {contrib.impact}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
