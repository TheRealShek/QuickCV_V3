// app/api/generate-pdf/route.ts — POST → returns PDF binary
// Architecture: Section 6 (API Route) + Module 3 + Module 5 (structured errors)

import { generateResumePDF } from "@/lib/pdf-generator";
import { resumeSchema } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate schema — structured error with field path (Module 5 pattern)
  const parsed = resumeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: `Schema error: ${parsed.error.issues[0].message} at ${parsed.error.issues[0].path.join(".")}`,
      },
      { status: 400 },
    );
  }

  try {
    const pdfBuffer = await generateResumePDF(parsed.data);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PDF generation failed" },
      { status: 500 },
    );
  }
}
