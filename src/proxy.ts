import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "st_austin_portal_session";

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const hasSessionCookie = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

    if (path.startsWith("/portal/dashboard") && !hasSessionCookie) {
        return NextResponse.redirect(new URL("/portal", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/portal/dashboard/:path*"],
};
