"use server"

import { AUTH_COOKIE_NAMES, COOKIE_OPTIONS } from "@/lib/cookie";
import { createInsforgeServerClient } from "@/lib/insforge-server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function setCookie(tokens: {
  accessToken: string;
  refreshToken?: string | null
}) {
  const store = await cookies();
  store.set(AUTH_COOKIE_NAMES.accessToken, tokens.accessToken, COOKIE_OPTIONS.accessToken)
  if (tokens.refreshToken) {
    store.set(AUTH_COOKIE_NAMES.refreshToken, tokens.refreshToken, COOKIE_OPTIONS.refreshToken)
  }
}


async function readAuthCookies() {
  const store = await cookies();
  return {
    accessToken: store.get(AUTH_COOKIE_NAMES.accessToken)?.value ?? null,
    refreshToken: store.get(AUTH_COOKIE_NAMES.refreshToken)?.value ?? null,
  }
}

async function clearCookies() {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAMES.accessToken);
  store.delete(AUTH_COOKIE_NAMES.refreshToken);
}

export async function signInWithEmail(email: string, password: string) {
  if (!email || !password) {
    return { error: "Email/password is required" }
  }
  const insforge = createInsforgeServerClient();
  const { data, error } = await insforge.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: error.statusCode === 401 ? "Invalid email or password." : "Unable to sign in." };
  }
  if (!data?.accessToken || !data.refreshToken) {
    return { error: "Session tokens missing" }
  }
  await setCookie({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken
  })
  return { success: true, error: null }
}


export async function signUp(name: string, email: string, password: string) {
  if (!name || !email || !password) {
    return { error: "All fields are required" }
  }
  const insforge = createInsforgeServerClient();
  const { data, error } = await insforge.auth.signUp({
    name,
    email,
    password
  })
  if (error) {
    return { error: error.statusCode === 403 ? "Email already in use" : "Unable to register" };
  }

  return { success: true, error: null }
}

export async function verifyEmail(email: string, otp: string,
  type: "verify" | "resend"
) {
  if (!email) {
    return { error: "Email field is required" }
  }
  const insforge = createInsforgeServerClient();

  if (type === "resend") {
    const { data, error } = await insforge.auth.resendVerificationEmail({
      email
    })
    if (error) {
      return { error: "Unable to resend verification" }
    }

    return { success: true, error: null }
  }

  if (!otp) return { error: "Otp is required" }

  const { data, error } = await insforge.auth.verifyEmail({
    email,
    otp
  })

  if (error) {
    return { error: error.statusCode === 403 ? "Email already in use" : "Unable to verify emal" };
  }
  if (!data?.accessToken || !data.refreshToken) {
    return { error: "Session tokens missing" }
  }
  await setCookie({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken
  })
  return { success: true, error: null }
}

export async function signOutAction() {
  const { accessToken } = await readAuthCookies();
  try {
    const insforge = createInsforgeServerClient(accessToken ?? undefined);
    await insforge.auth.signOut();
  } finally {
    await clearCookies();
  }
  redirect("/");
}


export async function getCurrentUser() {
  const { accessToken } = await readAuthCookies();
  if (!accessToken) return { user: null }
  const insforge = createInsforgeServerClient(accessToken);
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data.user) {
    await clearCookies();
    return { user: null }
  }

  return { user: data.user }

}
function isTokenStale(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp * 1000 <= Date.now() + 30_000;
  } catch { return true; }
}

export async function getInsforgeServerClient() {
  let { accessToken, refreshToken } = await readAuthCookies();
  if ((!accessToken || isTokenStale(accessToken)) && refreshToken) {
    const insforge = createInsforgeServerClient();
    const { data, error } = await insforge.auth.refreshSession({ refreshToken });

    if (error || !data?.accessToken) {
      await clearCookies();
      throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
    }

    await setCookie({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    })

    accessToken = data.accessToken
  }

  if (!accessToken) throw new Error("Unauthorized");
  const insforge = createInsforgeServerClient(accessToken)
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data.user) throw new Error("Unauthorized");

  return { insforge, userId: data.user.id }

}
