
# Auth Prompts

# PROMPT: InsForge Server Client Setup

Create a file at `lib/insforge-server.ts` that exports a function called `createInsforgeServerClient`.

This function should:
- Accept an optional `accessToken` string parameter
- Import `createClient` from `@insforge/sdk-js`
- Return `createClient()` with:
  - `baseURL` from environment variable `process.env.NEXT_PUBLIC_INSFORGE_BASE_URL`
  - `accessToken` passed to the client if provided

Add proper TypeScript types and handle the case where the env var might be undefined.


# PROMPT: Cookie Constants

Create a file at `lib/cookie.ts` that exports:

1. `AUTH_COOKIE_NAMES` object (as const) with:
   - `accessToken`: "linga_access_token"
   - `refreshToken`: "linga_refresh_token"

2. `COOKIE_OPTIONS` object with two properties:
   - `access`: cookie options for access token with httpOnly, secure (production only), sameSite "lax", path "/", maxAge 15 minutes (60 * 15)
   - `refresh`: same options but maxAge 7 days (60 * 60 * 24 * 7)

Both should use `as const` for the sameSite value and be properly typed.


# PROMPT: Auth Server Actions

Create a file at `app/action/auth.ts` with "use server" directive. Import from:
- `@/lib/cookie` for AUTH_COOKIE_NAMES and COOKIE_OPTIONS
- `@/lib/insforge-server` for createInsforgeServerClient
- `next/headers` for cookies
- `next/navigation` for redirect

Create these functions:

1. `setCookies(tokens)` - async helper that sets access and refresh tokens in cookies using next/headers cookies()

2. `readAuthCookies()` - async that returns { accessToken, refreshToken } from cookies (null if not present)

3. `clearCookies()` - async helper that clears both auth cookies by setting expires to new Date(0)

4. `signInWithEmail(email, password)` - server action that:
   - Validates inputs
   - Creates insforge client and calls auth.signInWithPassword
   - Handles 403 status by redirecting to "/auth/sign-in?error=account_not_verified"
   - Returns { error: string } on failure or { success: true, error: null } on success
   - Sets cookies with access and refresh tokens on success

5. `signUpWithEmail(name, email, password)` - server action that:
   - Validates inputs
   - Calls insforge.auth.signUp
   - Handles 409 status as "email already in use"
   - Returns error object or success
   - Sets cookies on success

6. `verifyEmail(email, otp, type)` - server action that:
   - If type is "resend": calls insforge.auth.resendVerificationEmail
   - If type is "verify": validates otp and calls insforge.auth.verifyEmail
   - Returns { error } or { success: true, error: null }

7. `signOut()` - server action that:
   - Gets current access token
   - Calls insforge.auth.signOut with the token
   - Always clears cookies (in finally block)
   - Redirects to "/"

8. `getCurrentUser()` - server action that:
   - Reads access token from cookies
   - Returns { user: null } if no token
   - Creates insforge client with token, calls auth.getCurrentUser
   - If error or no user, clears cookies and returns { user: null }
   - Returns { user: data.user } on success

9. `getInsForgeServerClient()` - server action that:
   - Reads access token
   - Throws Error with statusCode 401 if no token
   - Creates insforge client, validates current user
   - Throws 401 error if user validation fails
   - Returns { insforge, userId: data.user.id }


# PROMPT: Async Error Handler

Create a file at `app/action/async-handler.ts` with "use server" directive.

Export an async function `asyncHandler<T>` that:
- Takes an action function that returns Promise<T>
- Takes an options object with optional `fallbackError` property
- Wraps the action in try/catch
- Returns action result on success
- Returns `fallbackError` value if provided on error
- Re-throws error if no fallbackError

Use TypeScript generics for proper typing.


# PROMPT: Sign-In Page

Create a client page at `app/(routes)/auth/sign-in/page.tsx`:

It's a "use client" page that:
- Imports useState, Suspense from react
- Imports useRouter, useSearchParams from next/navigation
- Imports Link from next/link
- Imports signInWithEmail from @/app/action/auth
- Uses UI components: Button, Card (with Header/Content/Footer/Description/Title), Input, Label
- Imports a Logo component from @/components/logo
- Uses toast from sonner
- Uses Spinner component

Create a SignInForm component that:
- Gets router and searchParams
- Has email and password state
- Handle submit that calls signInWithEmail
- Shows toast error on failure
- On success, shows success toast and redirects to searchParams.get("redirect") or "/learn"

Wrap SignInForm in Suspense for the default export.

Style it as a centered card on a full-height flex container with the logo above.


# PROMPT: Sign-Up Page with Verification


A client page: `app/(routes)/auth/sign-up/page.tsx`

This a "use client" page with these imports:
- React hooks (useState, Suspense)
- Next.js router and searchParams
- signUpWithEmail and verifyEmail from @/app/action/auth
- useAuth hook from @/components/auth-provider
- UI components (Button, Card, Input, Label)
- Logo component
- toast from sonner
- Spinner component

Create SignUpForm that handles TWO modes using URL state:

1. SIGN-UP MODE (when searchParams.get("verify") !== "true"):
   - Form with name, email, password fields
   - Submit calls signUpWithEmail
   - On success, redirect to same page with `?verify=true&email={encodedEmail}`
   - Show success toast

2. VERIFY MODE (when searchParams.get("verify") === "true"):
   - Get email from searchParams
   - Form with email (pre-filled) and OTP input (6 digits max)
   - Submit calls verifyEmail(email, otp, "verify") from the /action/auth.ts file
   - On success: toast success, call refreshUser() from useAuth, redirect to "/courses"
   - Has "Resend" button that calls verifyEmail(email, "", "resend")

Use URL state (?verify=true&email=) NOT component state for the mode toggle.

Style like the sign-in page - centered card with logo.


# PROMPT: Token Refresh Route Handler

Create a Route Handler at `app/(routes)/auth/refresh/route.ts` (NOTE: route.ts not page.tsx!):

Import:
- NextRequest, NextResponse from next/server
- createInsforgeServerClient from @/lib/insforge-server
- AUTH_COOKIE_NAMES and COOKIE_OPTIONS from @/lib/cookie

Export async function GET(request: NextRequest):

1. Get redirect URL from searchParams, default to "/learn"
2. Get refresh token from request.cookies
3. If no refresh token:
   - Create redirect response to /auth/sign-in?redirect={encodedRedirect}
   - Clear both auth cookies on the response (set to expired)
   - Return response

4. Create insforge client, call auth.refreshSession({ refreshToken })
5. If error or no accessToken:
   - Same as step 3 - redirect to sign-in and clear cookies

6. On success:
   - Create redirect response to redirectUrl
   - Set access token cookie with COOKIE_OPTIONS.access
   - If new refresh token provided, set it too with COOKIE_OPTIONS.refresh
   - Return response

Create a helper function `clearAuthCookieOnResponse(response: NextResponse)` that clears both cookies.


# PROMPT: Auth Provider with TanStack Query

Create a file at `components/auth-provider.tsx`:

"use client" at top

Imports:
- createContext, useContext, ReactNode from react
- useRouter from next/navigation
- useQuery, useQueryClient from @tanstack/react-query
- getCurrentUser, signOut as serverSignOut from @/app/action/auth

Define User type with id, email?, and profile object with name?

Define AuthContextType with:
- user, isLoaded, isSignedIn, signOut function, refreshUser function

Create AuthContext with createContext

Export AuthProvider component that:
- Gets router and queryClient
- Uses useQuery with queryKey ["user"] that calls getCurrentUser
- Sets staleTime to 5 minutes (5 * 60 * 1000)
- Sets refetchOnWindowFocus to false
- Default data value is null

Creates signOut function that:
- Calls serverSignOut
- Sets query data ["user"] to null via queryClient
- Redirects to "/auth/sign-in"

Creates refreshUser function that:
- Calls queryClient.invalidateQueries with queryKey ["user"]

Returns AuthContext.Provider with value containing:
- user from useQuery data
- isLoaded: !isLoading
- isSignedIn: !!user
- signOut function
- refreshUser function

Export useAuth hook that:
- Gets context with useContext(AuthContext)
- Throws error if undefined
- Returns context


# PROMPT: User Button Component


Implement the user button component at `components/user-button.tsx`:

It's a "use client" component with these imports:
- useRouter from next/navigation
- DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger from @/components/ui/dropdown-menu
- LogOut icon from lucide-react
- Avatar, AvatarFallback, AvatarImage from @/components/ui/avatar
- useAuth hook from @/components/auth-provider

The component should:
1. Get user and signOut from useAuth hook
2. Get router from useRouter
3. Compute display values from user:
   - initials: from user's name (first letters of each word, uppercase, max 2 chars) or first letter of email, or "?"
   - userName: profile.name if exists, otherwise first 10 chars of email
   - userEmail: user's email
4. Create handleSignOut function that calls signOut() then router.push("/")

Render a DropdownMenu with:
- Trigger: a div with role="button" containing:
  - Avatar with src="/images/profile.svg", AvatarFallback showing initials, with ring styling
  - Two spans showing userName and userEmail (hidden on mobile, visible md:block)
- Content (DropdownMenuContent with align="end" and w-48):
  - DropdownMenuLabel with userName and userEmail
  - DropdownMenuSeparator
  - DropdownMenuItem for logout with LogOut icon, red text color, calls handleSignOut on click

