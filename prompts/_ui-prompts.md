# PROMPT - Courses Page with Card Item Component

Create two client files:
 app/(routes)/courses/page.tsx
 app/(routes)/courses/card-item.tsx
CardItem component (`card-item.tsx`):
- Props: title, id, imageSrc, learners?, disabled?, active?
- useMutation for upsertUserProgress
- onSuccess: invalidate ["currentCourse"], router.push("/learn")
- Card with variant=active?"primary":"elevated", Check badge if active, Image, Title
Courses page** (`page.tsx`):
- Imports: Header, CardItem (local), getAllCourses, useQuery, Skeleton
- useQuery with ["courses"] key
- Loading: 10 skeleton cards in grid
- Loaded: Title "I want to learn...", responsive grid (2 cols mobile, auto-fill desktop)
- Map courses to CardItem with id, title, imageSrc, isActive, disabled:false
- flex min-h-screen flex-col, Header top, footer with border-top bottom

# PROMPT - Dashboard Layout
Create a server layout at `app/(routes)/(dashboard)/layout.tsx`:
Imports:
- SidebarInset, SidebarProvider from @/components/ui/sidebar
- AppSidebar from ./_common/app-sidebar
The layout should:
1. Accept children as React.ReactNode
2. Wrap in SidebarProvider
3. Render AppSidebar component
4. Wrap children in SidebarInset with flex min-h-svh flex-col
5. Main content area: flex flex-1 flex-col items-center

# PROMPT - App Sidebar Component

Create a client component at `app/(routes)/(dashboard)/_common/app-sidebar.tsx`:
Implement the appsidebar as a client component
Navigation items array:
- Learn: /learn, icon /images/learn.svg
- Leaderboard: /leaderboard, icon /images/leaderboard.svg
- Upgrade: /upgrade, icon /images/shop.svg
The component should:
- Get pathname from usePathname
- Render Sidebar with collapsible="icon" and border-r-2
- Header: Logo component with url="/learn", py-6 padding
- Content: SidebarGroup with mapped navigation items
   - Each item: SidebarMenuButton with size="lg", asChild, isActive based on pathname match
   - Show Image icon (28x28) and title text
   - Highlight active item with primary background color and white text
-Footer: UserButton component

# PROMPT - Sticky Bar Component (XP Stats)
Create a client component at `/(dashboard)/_common/sticky-bar.tsx`:
It's a "use client" component with these imports:
The component should:
Get pathname from usePathname, check if isLeaderboardPage
Use useQueries with two queries:
   - queryKey ["subscription"], queryFn getUserSubscription()
   - queryKey ["xp-stats"], queryFn getXPStats()
Extract isPro, points, weeklyPoints from query data
Grid layout with two XP stat cards:
   - First card: Zap icon (yellow fill), "Total XP" label, show points with Skeleton while loading
   - Second card: Trophy icon (primary color), "This Week" label, show weeklyPoints with Skeleton
Show Upgrade component placeholder when not pro and not loading (will be created in next step)
Show Leaderboard component placeholder when not on leaderboard page (will be created later)
Sticky positioning at bottom-6, hidden on mobile, max-w-sm on large screens

# PROMPT - Upgrade Component (Super Card)
   Create a client component at `(dashboard)/_common/upgrade.tsx`:
   The component should:
   - Render Card with space-y-2
   - Flex layout with gap-y-2:
      - Left side: space-y-2 with
      - Image "super-logo.svg" (70x20) as Pro badge
      - h3 "Upgrade to Super" text-lg font-bold
      - p text-muted-foreground "Get personalized practice, and unlimited voice AI!"
      - Right side: relative div w-[200px] h-[110px] with Image "super-img-2.svg" fill
   - Button at bottom: variant default, size lg, full width, asChild with Link to "/upgrade"
      - Text: "Upgrade to Super"

# PROMPT - Leaderboard Component (Top 5 Preview)
Create a client component at `(dashboard)/_common/leaderboard.tsx`:
The component should:
 Use useQuery with queryKey ["leaderboard-top-5"], queryFn () => getLeaderboard(5)
Extract users from data?.leaderboard, calculate showFooter if users.length > 1
Card with px-0 and overflow-hidden
Header section: flex between, border-b border-border, px-4 py-3
 Left: Trophy icon (primary color), span "Leaderboard" text-sm font-extrabold uppercase
 Right: Link "See all" text-xs font-bold text-primary to "/leaderboard"
Users list in divide-y divide-border:
   - Loading state: map 5 skeleton rows with Skeleton for rank, avatar, name, points
   - Loaded: map users with div containing:
     - RankIcon component with rank (i+1) and points
     - AvatarUser with name and isCurrentUser flag
     - span for user name ("You" if current user, else user.name), truncate
     - div with Zap icon (yellow fill) and points number
     - Highlight current user with bg-primary/5 and text-primary
Footer (if showFooter): px-4 py-3 with Button outline size lg full width asChild Link to "/leaderboard"

# PROMPT - Leaderboard Page (Full)

Create a client page at `app/(routes)/(dashboard)/leaderboard/page.tsx`:
The page should:
Use useQuery with queryKey ["leaderboard"] calling await getLeaderboard()
Show loading state while fetching
Render StickyBar at top
Main content area with max-width container
Leaderboard title with Trophy icon
List of users from leaderboard data:
   - Show rank number (1, 2, 3 styled specially with gold/silver/bronze colors)
   - User avatar with fallback initials
   - User name and points with Zap icon
   - Highlight current user (isCurrentUser flag)
Show current user's rank and points at bottom if not in top list
Empty state if no data

# PROMPT - Upgrade Page
Create a client page at `app/(routes)/(dashboard)/upgrade/page.tsx`:
The page should:
- Get router and searchParams from hooks
- Use useQuery with queryKey ["subscription"] calling getUserSubscription()
- Create mutation with useMutation for createCheckout:
   - onSuccess: window.location.href = url (redirect to Polar checkout)
   - onError: toast.error("Failed to create checkout")
- Check for success params (checkout_id) in URL:
   - If present and user is now pro, show success toast
- Show current plan status (Free or Pro)
- Pro plan card with:
   - Checkmark list of features
   - Zap icon
   - Price display
   - Upgrade button (calls mutation) or "Current Plan" badge if already pro
- Show StickyBar at top
-  Responsive layout with proper spacing

# PROMPT - Learn Page with Level Path

Create five files for the learning path UI:
Learn Page (`page.tsx` - server component):
- Get userProgress, redirect to /courses if no active_course_id
- Render layout: full width container, max-w-[1056px] centered, flex row-reverse with StickyBar and Feedlevels from the _common
- Note: Just import Feedlevels from "./_common/feed-levels" and StickyBar from "../_common/sticky-bar" - these components will be created in the next steps

FeedLevels (`_common/feed-levels.tsx` - client component):
- useQuery with ["currentCourse"] calling getCurrentCourse()
- State for isProModalOpen
- Extract levels, courseTitle, courseImage from data
- Calculate difficulty: Beginner (levels 1-3), Intermediate (4-7), Advanced (8+)
- Render header card with primary background, back button, difficulty badge, course title with flag image
- Render level buttons in zigzag pattern using indentation math
- Show skeletons when loading
- Render SuperModal for pro upgrade
- Note: Import LevelButton from "./level-button" and SuperModal from "./super-modal" - these will be created next

LevelButton (`_common/level-button.tsx` - client component):
- Props: id, index, totalCount, levelNumber, title, purpose, locked, isProLocked, current, percentage, isLoading, onProModalOpen
- Calculate indentationLevel based on index % 8 for zigzag effect
- useMutation for startLevelSession(id), onSuccess redirect to /level, onError show pro modal if UPGRADE_REQUIRED
- Render: if loading show skeleton, else render LevelPopover wrapper
- For current level: show CircularProgressbarWithChildren with Start tooltip above
- For completed/locked: show Button with Check (completed), Crown (pro locked), or Star (locked) icon
- Show pro badge on locked levels
- Note: Import LevelPopover from "./level-popover" - this will be created next

LevelPopover (`_common/level-popover.tsx` - client component):
- Props: title, purpose, locked, isCompleted, onStartClick, isOpen, isPending, onOpenChange, children
- Render Popover with Trigger as children
- Content shows: level icon, title, description/purpose
- Button states: "Practice" (completed), "Start" (current - calls onStartClick), "Locked" (locked with lock icon), or "Upgrade to Pro" (pro locked)
- Show Spinner when isPending

SuperModal (`_common/super-modal.tsx` - client component):
- Props: isOpen, onOpenChange
- Render AlertDialog with super-modal styling
- Show Pro/Super badge image at top
- Title: "Upgrade to Pro"
- Description about unlimited practice
- Two buttons: "Maybe Later" (secondary, closes modal), "Upgrade Now" (primary, links to /upgrade)

# PROMPT - Level Page (Server Component) with Loading State
Create two files for the voice practice level page:
Level Page (`page.tsx` - server component):
- Imports: getCurrentLevel from @/app/action/course, redirect from next/navigation, VoiceSession from ./voice-session (just import, will be created next)
- Call getCurrentLevel() directly (server action)
- If no level returned, redirect to "/learn"
- Render VoiceSession component passing level data and userId from level
- Note: Just import VoiceSession - it will be created in the next step
Loading State (`loading.tsx`):
- Imports: Image from next/image, Spinner from @/components/ui/spinner
- Create default export function Loading
- Render full-screen centered layout:
  - Fixed inset-0 bg-background, flex flex-col items-center justify-center, z-50
  - Relative size-40 container for logo with pulse background effect
  - Image "logo-teacher.png" with fill, object-contain, animate-bounce
  - Heading "Preparing your session..." with gradient text (text-transparent bg-gradient-to-r from-primary)
  - Quote text "The best way to learn a language is to speak it from day one." in italic muted style
  - Bottom status bar with Spinner and "Initializing" text, uppercase tracking

# PROMPT - Level Complete Component
Create a client component at `app/(routes)/level/level-complete.tsx`:
Props:- score: number, totalExercises: number, onContinue: () => void,levelNumber?: number (optional), language?: string (optional)
The component should:
- Calculate passed = score >= MIN_PASSING_SCORE
- Full-screen centered layout (h-screen, flex, items-center, justify-center)
- If passed: show Confetti with recycle=false, 500 pieces, gravity 0.1
- Icon display:
   - Passed: Trophy icon h-24 w-24 text-yellow-500
   - Failed: Logo image "logo-2.png" 100x100
- Title text:
   - Passed: "Level Complete!"
   - Failed: "Level Incomplete" in red color
- Score display: "score/totalExercises correct" with emoji (🎉 if passed)
- If failed: show "Need {MIN_PASSING_SCORE} to pass" and "Don't give up!" encouragement
- Button at bottom:
   - Passed: "Continue" with default variant
   - Failed: "Try Again" with outline variant
- All text centered with proper gap spacing
Note: This shows completion status clearly - passed shows celebration, failed shows encouragement to retry.
