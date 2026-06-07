// app/api/schema/route.ts — Schema endpoint for AI agents and scripts
//
// GET /api/schema → plain text schema reference (token-efficient, curl-friendly)

import { NextResponse } from "next/server";
import { buildPlainTextSchema } from "@/lib/schema-doc";

export async function GET() {
  return new NextResponse(buildPlainTextSchema(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
