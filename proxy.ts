import { NextRequest, NextResponse } from "next/server"
import { AUTH_COOKIE_NAMES } from "./lib/cookie";

const authRoutes = ["/auth/sign-in", "/auth/sign-up"];
const protectedRoutes = ["/learn", "/courses", "/level", "/leaderboard", "/upgrade"];

function isTokenStale(token: string) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1]
        .replace(/-/g, "+").replace(/_/g, "/")));
    // Check if token is expired (within 30 second buffer)
    return payload.exp * 1000 <= Date.now() + 30_000;
  } catch { return false; }
}


export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  const refreshToken = request.cookies.get(AUTH_COOKIE_NAMES.refreshToken)?.value;
  const redirectTo = encodeURIComponent(`${pathname}${search}`);

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  const hasValidToken = accessToken && !isTokenStale(accessToken);

  if (isAuthRoute) {
    if (hasValidToken) return NextResponse.redirect(new URL("/learn",
      request.url
    ))

    return NextResponse.next();
  }

  if (!isProtected) return NextResponse.next();
  if (hasValidToken) return NextResponse.next();

  if (refreshToken) {

    if (request.method === "GET") {
      const refreshUrl = request.nextUrl.clone();
      refreshUrl.pathname = "/auth/refresh";
      refreshUrl.search = `?redirect=${redirectTo}`
      return NextResponse.redirect(refreshUrl)
    }
    return NextResponse.next();
  }

  return request.method === "GET"
    ? NextResponse.redirect(new URL(`/auth/sign-in?redirect=${redirectTo}`, request.url))
    : NextResponse.json({ error: "Unauthorized" }, { status: 401 });

}

export const config = {
  matcher: [
    "/auth/:path*",
    "/learn/:path*",
    "/courses/:path*",
    "/level/:path*",
    "/leaderboard/:path*",
    "/upgrade/:path*"],
};
