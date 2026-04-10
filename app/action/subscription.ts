"use server";

import { getInsforgeServerClient } from "./auth";
import { asyncHandler } from "./async-handler";

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
