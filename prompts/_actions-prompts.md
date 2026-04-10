# ALL Actions Prompts for Building Course & Subscription

# PROMPT: Async Handler Utility

Create a file at `app/action/async-handler.ts` with "use server" directive.

Export an async function `asyncHandler<T>` that:
- Takes an action function that returns Promise<T>
- Takes an options object with optional `fallbackError` property
- Wraps the action in try/catch
- Returns action result on success
- Returns `fallbackError` value if provided on error
- Re-throws error if no fallbackError

Use TypeScript generics for proper typing.


# PROMPT: Course Actions

Create a file at `app/action/course.ts` with "use server" directive.

Imports:
- FREE_LEVELS, TOTAL_EXERCISES, XP_EARN_PER_CORRECT from @/lib/constants
- revalidatePath from next/cache
- getUserSubscription from ./subscription
- getInsForgeServerClient from ./auth
- asyncHandler from ./async-handler

Create these functions:

`getAllCourses()` - server action that:
   - Gets insforge client and userId
   - Parallel queries:
     - user_progress table for active_course_id
     - courses table for all courses
   - Maps courses adding isActive boolean (true if course.id === user's active_course_id)
   - Calls revalidatePath("/courses")
   - Returns array of courses with isActive flag
   - Has fallbackError of empty array []

`getUserProgress()` - server action that:
   - Gets insforge client and userId
   - Queries user_progress table for current user
   - Ignores PGRST116 errors (no rows found)
   - Returns user progress data or null
   - Has fallbackError of null

`upsertUserProgress(courseId: string)` - server action that:
   - Gets insforge client and userId
   - Upserts to user_progress table:
     - user_id: userId
     - active_course_id: courseId
     - onConflict: "user_id"
   - Returns the upserted data
   - Wrapped in asyncHandler

`getCurrentCourse()` - server action that:
   - Gets insforge client and userId
   - Gets userProgress from user_progress table
   - If no userProgress, return null
   - Parallel queries for:
     - Course details by active_course_id
     - All levels for the course (ordered by level_number ascending)
     - All level_progress for current user
     - getUserSubscription() for isPro status
   - Maps levels adding computed fields:
     - completed: from level_progress
     - current: not completed AND previous level completed AND not pro-locked
     - locked: not completed AND not previous completed OR pro-locked
     - isProLocked: true if not pro AND level_number > FREE_LEVELS
     - percentage: Math.min(Math.round((score / TOTAL_EXERCISES) * 100), 100)
   - Returns { course, progress: userProgress, levels: levelsWithProgress, isPro }
   - Wrapped in asyncHandler


`getXPStats()` - server action that:
   - Gets insforge client and userId
   - Calculates start of current week (Monday at midnight)
   - Parallel queries:
     - user_progress for total points
     - voice_sessions for this week's sessions (score field, created_at >= startOfWeek)
   - Calculates weeklyPoints: sum of (session.score * XP_EARN_PER_CORRECT)
   - Returns { points, weeklyPoints }
   - Wrapped in asyncHandler

 `getLeaderboard(limit = 10)` - server action that:
   - Gets insforge client and userId
   - Queries leaderboard_view (a database view) ordered by rank ascending
   - Limits to specified count
   - Maps results adding isCurrentUser boolean
   - Finds current user's rank and points from the data
   - Returns { leaderboard, userPoints, userRank }
   - Wrapped in asyncHandler

 `startLevelSession(levelId: string)` - server action that:
   - Gets insforge client and userId
   - Checks subscription: if not pro, check if user already has a voice_session for this level_id
   - If existing session found, throw Error "UPGRADE_REQUIRED"
   - Parallel DB operations:
     - Insert new voice_session with user_id, level_id, status: "active", completed: false
     - Update user_progress set active_level_id to levelId
     - Upsert level_progress with user_id, level_id, completed: false (onConflict: user_id,level_id)
   - Returns { sessionId }
   - Wrapped in asyncHandler

`getCurrentLevel()` - server action that:
   - Gets insforge client and userId
   - Gets userProgress with active_level_id and active_course_id
   - If no active_level_id, return null
   - Parallel queries:
     - Level details by active_level_id
     - Course title and lang by active_course_id
     - Latest incomplete voice_session for this level
     - getUserSubscription() for isPro check
   - Pro security check: if level.level_number > FREE_LEVELS and not pro, return null
   - Returns level with language, lang, sessionId, userId
   - Wrapped in asyncHandler



 # PROMPT: Subscription Actions

Create a file at `app/action/subscription.ts` with "use server" directive.

Create two functions:

`getUserSubscription()` - server action that:
   - Gets insforge client and userId
   - Queries subscriptions table for current user
   - Selects plan, status, current_period_end
   - Determines isPro if:
     - plan === "pro"
     - status === "active"
     - current_period_end is in the future
   - Returns object with isPro, plan, status, currentPeriodEnd
   - Has fallbackError of { isPro: false, plan: "free", status: null, currentPeriodEnd: null }
   - Wrapped in asyncHandler

 `createCheckout()` - server action that:
   - Gets insforge client and current user
   - Creates a Polar checkout with:
     - products array containing process.env.POLAR_PRODUCT_ID
     - customerEmail from current user
     - successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/learn?checkout_id={CHECKOUT_ID}`
     - returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`
     - metadata with userId and plan "pro"
   - Returns { url: result.url } on success
   - Returns { error: "Failed to get user", data: null } if user not found
   - Wrapped in asyncHandler
