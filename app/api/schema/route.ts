// app/api/schema/route.ts — Schema endpoint for AI agents and scripts
//
// GET /api/schema          → JSON { prompt, jsonSchema, example, fieldReference }
// GET /api/schema?fmt=text → plain text prompt only (curl-friendly)

import { NextRequest, NextResponse } from "next/server";
import {
  buildAIPrompt,
  getJSONSchema,
  exampleResume,
  fieldReference,
} from "@/lib/schema-doc";

export async function GET(request: NextRequest) {
  const fmt = request.nextUrl.searchParams.get("fmt");

  // Plain text variant — just the prompt, ready for `curl | pbcopy`
  if (fmt === "text") {
    return new NextResponse(buildAIPrompt(), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  // Default — structured JSON for agents and scripts
  return NextResponse.json(
    {
      prompt: buildAIPrompt(),
      jsonSchema: getJSONSchema(),
      example: exampleResume,
      fieldReference,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
}
