// scripts/test-pdf.ts — Standalone test: generates a PDF from default data
// Run: npx ts-node --compiler-options '{"module":"commonjs","moduleResolution":"node","paths":{"@/*":["./*"]}}' scripts/test-pdf.ts

import fs from "fs";
import path from "path";
import { generateResumePDF } from "../lib/pdf-generator";
import { defaultResumeData } from "../lib/resume-data";

async function main() {
  console.log("Generating PDF from default resume data...");
  const startTime = Date.now();

  try {
    const pdfBuffer = await generateResumePDF(defaultResumeData);
    const elapsed = Date.now() - startTime;

    const outPath = path.join(process.cwd(), "test-output.pdf");
    fs.writeFileSync(outPath, pdfBuffer);

    console.log(`PDF generated successfully in ${elapsed}ms`);
    console.log(`File size: ${(pdfBuffer.length / 1024).toFixed(1)}KB`);
    console.log(`Written to: ${outPath}`);
  } catch (err) {
    console.error("PDF generation failed:", err);
    process.exit(1);
  }
}

main();
