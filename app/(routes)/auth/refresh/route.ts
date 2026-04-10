import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServerClient } from "@/lib/insforge-server";
import { AUTH_COOKIE_NAMES, COOKIE_OPTIONS } from "@/lib/cookie";

function clearAuthCookieOnResponse(response: NextResponse) {
  response.cookies.delete(AUTH_COOKIE_NAMES.accessToken);
  response.cookies.delete(AUTH_COOKIE_NAMES.refreshToken);
  return response;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectUrl = searchParams.get("redirect") || "/learn";
  const refreshToken = request.cookies.get(AUTH_COOKIE_NAMES.refreshToken)?.value;

  const getSignInRedirect = () => {
    const signInUrl = new URL("/auth/sign-in", request.url);
    if (redirectUrl) {
      signInUrl.searchParams.set("redirect", redirectUrl);
    }
    return clearAuthCookieOnResponse(NextResponse.redirect(signInUrl, 307));
  };

  if (!refreshToken) {
    return getSignInRedirect();
  }

  const insforge = createInsforgeServerClient();
  const { data, error } = await insforge.auth.refreshSession({ refreshToken });

  if (error || !data?.accessToken) {
    return getSignInRedirect();
  }

  // Next URL redirect parsing
  let finalRedirect;
  try {
    finalRedirect = new URL(redirectUrl, request.url);
  } catch {
    finalRedirect = new URL("/learn", request.url);
  }

  const response = NextResponse.redirect(finalRedirect, 307);

  response.cookies.set(
    AUTH_COOKIE_NAMES.accessToken,
    data.accessToken,
    COOKIE_OPTIONS.accessToken
  );

  if (data.refreshToken) {
    response.cookies.set(
      AUTH_COOKIE_NAMES.refreshToken,
      data.refreshToken,
      COOKIE_OPTIONS.refreshToken
    );
  }

  return response;
}
