// app/schema/page.tsx — Schema reference & AI prompt page (server component)
// Serves two audiences:
// 1. Humans who want to learn the JSON structure field by field
// 2. AI agents that can read this page and understand how to generate valid JSON

import type { Metadata } from "next";
import Link from "next/link";
import {
  exampleResume,
  buildPlainTextSchema,
  fieldReference,
} from "@/lib/schema-doc";
import CopyButton from "@/components/ui/CopyButton";
import CollapsibleSection from "@/components/ui/CollapsibleSection";

export const metadata: Metadata = {
  title: "Schema Reference — QuickCV",
  description:
    "Complete reference for the QuickCV resume JSON format. Learn every field, see examples, or copy an AI-ready prompt to generate your resume data.",
};

// ---------------------------------------------------------------------------
// Pre-compute serialised strings at build/request time (server only)
// ---------------------------------------------------------------------------

const schemaText = buildPlainTextSchema();
const exampleJson = JSON.stringify(exampleResume, null, 2);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SchemaPage() {
  const requiredSections = fieldReference.filter((s) => s.rootRequired);
  const optionalSections = fieldReference.filter((s) => !s.rootRequired);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#1A56DB] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Editor
          </Link>
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            QuickCV
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* ── Page title ──────────────────────────────────────────── */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Schema Reference
          </h1>
          <p className="mt-3 text-base text-gray-500 max-w-3xl">
            This is the complete reference for the QuickCV resume JSON format.
            Whether you&apos;re writing your JSON by hand, building a tool that
            generates it, or pointing an AI at this page — everything you need
            is here.
          </p>
        </div>

        {/* ── Table of contents ────────────────────────────────────── */}
        <nav className="mb-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            On this page
          </h2>
          <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            <a href="#field-reference" className="text-sm text-[#1A56DB] hover:underline">
              Field Reference
            </a>
            <a href="#ai-prompt" className="text-sm text-[#1A56DB] hover:underline">
              AI Prompt
            </a>
            <a href="#full-example" className="text-sm text-[#1A56DB] hover:underline">
              Full Example
            </a>
            <a href="#import-guide" className="text-sm text-[#1A56DB] hover:underline">
              How to Import
            </a>
          </div>
        </nav>

        {/* ── Top-level structure overview ─────────────────────────── */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Top-level structure
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            The resume JSON is a single object with these top-level keys.
            Required sections must always be present; optional sections can be
            omitted entirely.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Key</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Required</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fieldReference.map((section) => (
                  <tr key={section.key} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <a href={`#section-${section.key}`} className="font-mono text-[#1A56DB] hover:underline">
                        {section.key}
                      </a>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600">
                      {section.isArray ? `${section.title}[]` : "object"}
                      {section.key === "summary" && <span className="text-gray-400 ml-1">(string)</span>}
                    </td>
                    <td className="px-4 py-3">
                      {section.rootRequired ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          required
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          optional
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{section.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Field Reference ──────────────────────────────────────── */}
        <section id="field-reference" className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Field Reference
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Every field in every section, with its type, whether it&apos;s required,
            and what it does. This is the source of truth for the JSON structure.
          </p>

          {/* Required sections */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Required sections
            </h3>
            <div className="space-y-4">
              {requiredSections.map((section) => (
                <div key={section.key} id={`section-${section.key}`}>
                  <CollapsibleSection
                    title={section.title}
                    badge={section.isArray ? "array" : section.key === "summary" ? "string" : "object"}
                    defaultOpen={false}
                  >
                    <p className="text-sm text-gray-500 mb-4">
                      {section.description}
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Field</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Type</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700 w-20">Status</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {section.fields.map((field) => (
                            <tr key={field.name} className="hover:bg-gray-50/50">
                              <td className="px-4 py-2.5 font-mono text-xs text-gray-900 whitespace-nowrap">
                                {field.name}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                                {field.type}
                              </td>
                              <td className="px-4 py-2.5">
                                {field.required ? (
                                  <span className="text-xs font-medium text-blue-700">required</span>
                                ) : (
                                  <span className="text-xs text-gray-400">optional</span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-gray-600">
                                {field.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CollapsibleSection>
                </div>
              ))}
            </div>
          </div>

          {/* Optional sections */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Optional sections
            </h3>
            <div className="space-y-4">
              {optionalSections.map((section) => (
                <div key={section.key} id={`section-${section.key}`}>
                  <CollapsibleSection
                    title={section.title}
                    badge="optional · array"
                    defaultOpen={false}
                  >
                    <p className="text-sm text-gray-500 mb-4">
                      {section.description}
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Field</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Type</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700 w-20">Status</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {section.fields.map((field) => (
                            <tr key={field.name} className="hover:bg-gray-50/50">
                              <td className="px-4 py-2.5 font-mono text-xs text-gray-900 whitespace-nowrap">
                                {field.name}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                                {field.type}
                              </td>
                              <td className="px-4 py-2.5">
                                {field.required ? (
                                  <span className="text-xs font-medium text-blue-700">required</span>
                                ) : (
                                  <span className="text-xs text-gray-400">optional</span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-gray-600">
                                {field.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CollapsibleSection>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI Prompt (plain text schema) ─────────────────────────── */}
        <section id="ai-prompt" className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              AI Prompt
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Copy this prompt and paste it into ChatGPT, Claude, Gemini, or any
              AI assistant. It contains the full schema and a working example so
              the AI knows exactly what to generate. Also available via{" "}
              <a href="/api/schema" className="text-[#1A56DB] underline underline-offset-2 hover:text-[#1A56DB]/80">
                <code className="text-xs">curl /api/schema</code>
              </a>.
            </p>
          </div>

          <div className="relative rounded-xl bg-gray-900 shadow-lg ring-1 ring-white/5">
            <CopyButton text={schemaText} label="Copy Prompt" />
            <pre className="overflow-x-auto p-5 pt-12 text-sm leading-relaxed text-gray-100 font-mono whitespace-pre-wrap break-words max-h-[32rem] overflow-y-auto">
              {schemaText}
            </pre>
          </div>
        </section>

        {/* ── Full Example ─────────────────────────────────────────── */}
        <section id="full-example" className="mb-8">
          <CollapsibleSection title="Full Example" badge="JSON" defaultOpen={false}>
            <p className="text-sm text-gray-500 mb-4">
              A complete, realistic resume JSON that passes validation. Copy it
              as a starting point and replace with your own content.
            </p>
            <div className="relative rounded-xl bg-gray-900 shadow-inner">
              <CopyButton text={exampleJson} label="Copy Example" />
              <pre className="overflow-x-auto p-5 pt-12 text-sm leading-relaxed text-gray-100 font-mono max-h-[32rem] overflow-y-auto">
                {exampleJson}
              </pre>
            </div>
          </CollapsibleSection>
        </section>



        {/* ── How to Import ────────────────────────────────────────── */}
        <section id="import-guide" className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            How to Import
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                num: 1,
                title: "Get your JSON",
                desc: "Write it by hand using the field reference above, copy the AI prompt into your preferred AI and add your details, or start from the full example.",
              },
              {
                num: 2,
                title: "Save as .json",
                desc: "Save the AI's output (or your handwritten JSON) as a .json file. Make sure it's raw JSON — no markdown code fences.",
              },
              {
                num: 3,
                title: "Import in the editor",
                desc: "On the editor page, click \"Import JSON\" in the top bar and select your file. The editor validates and loads it instantly.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#1A56DB] text-sm font-bold text-white">
                  {step.num}
                </span>
                <h3 className="text-base font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer CTA ──────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1A56DB] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Editor
          </Link>
          <p className="text-xs text-gray-400">
            Use <strong>Import JSON</strong> on the editor page to load your data
          </p>
        </div>
      </main>
    </div>
  );
}
