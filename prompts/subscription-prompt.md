
# PROMPT- Subscription Server Actions

Create a file at `app/action/subscription.ts` with "use server" directive.
`createCheckout()` - server action that:
   - Gets insforge client and current user via getInsForgeServerClient
   - If no user, return { error: "Failed to get user", data: null }
   - Creates Polar checkout with:
     - products array with process.env.POLAR_PRODUCT_ID
     - customerEmail from data.user.email
     - successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/learn?checkout_id={CHECKOUT_ID}`
     - returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`
     - metadata with userId
   - Returns { url: result.url } on success
   - Wrapped in asyncHandler

`getUserSubscription()` - server action that:
   - Gets insforge client and userId
   - Queries subscriptions table for current user
   - Selects plan, status, current_period_end
   - Determines isPro if:
     - plan === "pro"
     - status === "active"
     - current_period_end is in the future
   - Returns { isPro, plan, status, currentPeriodEnd }
   - Has fallbackError of { isPro: false, plan: "free", status: null, currentPeriodEnd: null }
   - Wrapped in asyncHandler


# PROMPT - Polar Webhook Handler

Create a file at `app/api/webhook/polar/route.ts`:
Imports: - Webhooks from @polar-sh/nextjs - createClient from @insforge/sdk
Export POST handler using Webhooks():
- webhookSecret: process.env.POLAR_WEBHOOK_SECRET
- onPayload: async function handling subscription events
Inside onPayload:
- Create InsForge client:
  - baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL
  - anonKey: process.env.INSFORGE_ANON_KEY
- Extract subscription data from payload.data
- Get userId from sub.metadata?.userId or sub.userId
- If no userId, log error and return

Handle switch cases for payload.type:

Case "subscription.created" or "subscription.active":
- Upsert to subscriptions table:
  - user_id: userId
  - polar_subscription_id: sub.id
  - polar_customer_id: sub.customerId
  - status: sub.status
  - plan: "pro"
  - current_period_end: sub.currentPeriodEnd
- onConflict: "user_id"
- Log success message

Case "subscription.revoked":
- Update subscriptions table:
  - status: "revoked"
  - plan: "free"
- Where user_id equals userId
- Log downgrade message

# PROMPT - Upgrade Page (Subscription)

Create a client page at `app/(routes)/(dashboard)/upgrade/page.tsx`:

Features array constant:
- All 10 levels per language, Unlimited voice sessions, Full leaderboard + weekly ranking, All 20+ languages, Priority AI response

The page should:
- Use useQuery with queryKey ["subscription"] calling getUserSubscription()
- Create mutation with useMutation for createCheckout:
  - onSuccess: redirect window.location.href = result.url
  - onError: toast.error("Failed to start checkout")
- Show loading state with Spinner if data is loading
- Header section centered:
   - Badge with Zap icon "Linga Super"
   - Title: "You are a Super Learner!" if pro, else "Learn faster with Super"
   - Subtitle text based on pro status
- Main Card with gradient background:
   - Plan label with uppercase styling
   - Price display "$9.99/month" (only if not pro)
   - Feature list with Check icons in 2-column grid
   - If not pro: Upgrade button with loading state, Zap icon, hover scale effect
   - If pro: Manage Subscription button linking to polar.sh/settings
   - Footer text about billing or secure payments
- Bottom trust badge "Trusted by 500+ daily learners"

