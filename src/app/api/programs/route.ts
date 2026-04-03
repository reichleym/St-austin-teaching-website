import type { NextRequest } from "next/server";
import { GET as getCourses } from "../courses/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    return getCourses(request);
}
