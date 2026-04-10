export const AUTH_COOKIE_NAMES = {
  accessToken: "linga_access_token",
  refreshToken: "linga_refresh_token",
} as const;

export const COOKIE_OPTIONS = {
  accessToken: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 15   // 15 minutes
  },
  refreshToken: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7  // 7 days
  },
};

