import { NextResponse } from "next/server";
import { pageDocSlugs } from "@/lib/page-docs.generated";

export const runtime = "nodejs";
export const dynamic = "force-static";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function GET() {
  return NextResponse.json(
    {
      slugs: pageDocSlugs,
    },
    { headers: corsHeaders }
  );
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

