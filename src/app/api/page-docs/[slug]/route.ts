import { NextResponse } from "next/server";
import { getPageDoc, pageDocSlugs } from "@/lib/page-docs.generated";

export const runtime = "nodejs";
export const dynamic = "force-static";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function generateStaticParams() {
  return pageDocSlugs.map((slug) => ({ slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getPageDoc(slug);

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
  }

  return NextResponse.json(doc, { headers: corsHeaders });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

