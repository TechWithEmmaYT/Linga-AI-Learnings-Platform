import { createClient } from "@insforge/sdk";
import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
      anonKey: process.env.INSFORGE_ANON_KEY!,
    });

    const sub = payload.data as any;
    const userId = sub.metadata?.userId || sub.userId;

    if (!userId) {
      console.error("No userId found in Polar webhook metadata");
      return;
    }

    switch (payload.type) {
      case "subscription.created":
      case "subscription.active": {
        const { data, error } = await insforge.database
          .from("subscriptions")
          .upsert({
            user_id: userId,
            polar_subscription_id: sub.id,
            polar_customer_id: sub.customerId,
            status: sub.status,
            plan: "pro",
            current_period_end: sub.currentPeriodEnd,
          }, { onConflict: "user_id" });
        // console.log(`User ${userId} upgraded to Pro`);
        if (error) {
          console.error("❌ DB Upsert Error:", error);
          throw error;
        }
        console.log(`✅ Subscription ${sub.status} for User: ${userId}`, data);
        break;
      }

      case "subscription.revoked": {
        const { error } = await insforge.database
          .from("subscriptions")
          .update({
            status: "revoked",
            plan: "free",
          })
          .eq("user_id", userId);
        console.log(`User ${userId} subscription revoked`);
        if (error) {
          console.error("❌ DB Update Error:", error);
          throw error;
        }

        break;
      }

      default:
        console.log(`Unhandled Polar event type: ${payload.type}`);
    }
  }
});
