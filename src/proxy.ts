import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "st_austin_portal_session";

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const hasSessionCookie = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

    if (!hasSessionCookie && path.startsWith("/portal/dashboard")) {
        const redirectUrl = new URL("/portal", request.url);
        const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

        redirectUrl.searchParams.set("auth", "login");
        redirectUrl.searchParams.set("redirect", requestedPath);

        return NextResponse.redirect(redirectUrl);
    }

    if (!hasSessionCookie && path.startsWith("/apply")) {
        const currentAuthView = request.nextUrl.searchParams.get("auth");
        if (currentAuthView === "login" || currentAuthView === "signup") {
            return NextResponse.next();
        }

        const redirectUrl = new URL("/apply", request.url);
        const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

        redirectUrl.searchParams.set("auth", "login");
        redirectUrl.searchParams.set("redirect", requestedPath);

        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/portal/dashboard/:path*", "/apply/:path*"],
};
