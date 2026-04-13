"use server";

import { getInsforgeServerClient } from "./auth";
import { asyncHandler } from "./async-handler";
import { polar } from "@/lib/polar";

export async function createCheckout() {
  return asyncHandler(async () => {
    const { insforge, userId } = await getInsforgeServerClient();

    const { data: userData, error: userError } = await insforge.auth.getCurrentUser();
    if (userError || !userData?.user) {
      return { error: "Failed to get user", data: null };
    }

    const result = await polar.checkouts.create({
      products: [process.env.POLAR_PRODUCT_ID!],
      customerEmail: userData.user.email,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/learn?checkout_id={CHECKOUT_ID}`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
      metadata: {
        userId,
      },
    });

    return { url: result.url };
  });
}

export async function getUserSubscription() {
  return asyncHandler(async () => {
    const { insforge, userId } = await getInsforgeServerClient();

    const { data, error } = await insforge.database
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("user_id", userId)
      .single();
    if (error && error.code !== "PGRST116") {
      throw error;
    }

    const isPro =
      data?.plan === "pro" &&
      data?.status === "active" &&
      new Date(data?.current_period_end || 0) > new Date()

    return {
      isPro,
      plan: data?.plan ?? "free",
      status: data?.status ?? null,
    };
  }, { fallbackError: { isPro: false, plan: "free", status: null } });
}
