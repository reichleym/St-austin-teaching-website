import { NextResponse } from "next/server";
import { logoutUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
    await logoutUser();
    return NextResponse.json({ ok: true });
}
