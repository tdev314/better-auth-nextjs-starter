---
name: PostHog Integration
overview: Add PostHog analytics to the Better Auth Next.js starter with automatic pageview tracking, user identification tied to auth sessions, and key auth/account event capture (sign up, sign in, sign out, email changed, password changed, name updated).
todos:
  - id: install-dep
    content: Install posthog-js dependency via pnpm
    status: completed
  - id: posthog-init
    content: Create src/lib/posthog.ts with PostHog initialization
    status: completed
  - id: posthog-provider
    content: Create src/components/posthog-provider.tsx with PostHogProvider wrapper
    status: completed
  - id: posthog-pageview
    content: Create src/components/posthog-page-view.tsx for SPA pageview tracking
    status: completed
  - id: posthog-identify
    content: Create src/components/posthog-identify.tsx for user identification and auth event tracking
    status: completed
  - id: update-auth-client
    content: Add fetchOptions.onSuccess to auth-client.ts for email_changed, password_changed, profile_updated events
    status: completed
  - id: update-providers
    content: Update src/app/providers.tsx to include PostHog in the provider tree
    status: completed
  - id: update-env
    content: Add NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST to .env.example
    status: completed
isProject: false
---

# PostHog Integration

## Approach

Use `posthog-js` (the standard client SDK) with `posthog-js/react` bindings. This avoids middleware changes and is the battle-tested pattern for Next.js App Router. The newer `@posthog/next` package (v0.1.0, March 2026) exists but is still very new; the traditional approach is simpler and fully sufficient here.

## Environment Variables

Add to [`.env.example`](.env.example):

```
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

## New Files

### 1. `src/lib/posthog.ts` — PostHog singleton

Initialize `posthog-js` with the env vars. Guard against server-side execution. Enable `capture_pageview: false` (we handle it manually for App Router SPA transitions) and `capture_pageleave: true`.

### 2. `src/components/posthog-provider.tsx` — Client provider

A `"use client"` component that wraps children with `PostHogProvider` from `posthog-js/react`, passing the initialized PostHog instance. This goes inside the existing provider tree.

### 3. `src/components/posthog-page-view.tsx` — Pageview tracker

A `"use client"` component using `usePathname()` and `useSearchParams()` from `next/navigation` plus `usePostHog()` from `posthog-js/react`. On route change, calls `posthog.capture('$pageview')`. Renders `null`. This is the standard Next.js App Router pattern because the router doesn't trigger full page loads.

### 4. `src/components/posthog-identify.tsx` — User identity + auth events

A `"use client"` component that:
- Calls `authClient.useSession()` to watch the auth session
- When session transitions from unauthenticated to authenticated:
  - Calls `posthog.identify(user.id, { email, name, createdAt })` to link events to the user
  - Checks `usePathname()` to determine if the user was on `/auth/sign-up` and captures either `user_signed_up` or `user_signed_in`
- When session transitions from authenticated to unauthenticated:
  - Captures `user_signed_out`
  - Calls `posthog.reset()` to unlink future anonymous events from the previous user

## Modified Files

### [`src/lib/auth-client.ts`](src/lib/auth-client.ts) — Account change events

Add `fetchOptions.onSuccess` to `createAuthClient`. This intercepts all successful auth API calls and fires PostHog events for account changes. The better-auth client calls these endpoints internally when the `AccountView` UI is used:

- `/api/auth/change-email` -> capture `email_changed`
- `/api/auth/change-password` -> capture `password_changed`
- `/api/auth/update-user` -> capture `profile_updated`

This is the cleanest approach since the UI library (`@daveyplate/better-auth-ui`) calls `authClient` methods internally and we cannot hook into its forms directly.

### [`src/app/providers.tsx`](src/app/providers.tsx)

Wrap the existing tree with `PHProvider`. Add `PostHogPageView` and `PostHogIdentify` as siblings inside the provider:

```
<PHProvider>
  <ThemeProvider>
    <AuthUIProvider>
      <PostHogPageView />
      <PostHogIdentify />
      {children}
      <Toaster />
    </AuthUIProvider>
  </ThemeProvider>
</PHProvider>
```

`PostHogIdentify` must be inside `AuthUIProvider` so `authClient.useSession()` works.

### [`.env.example`](.env.example)

Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`.

## Events Tracked

- `$pageview` — Every client-side route change (url, pathname automatic)
- `$pageleave` — User leaves page (automatic via PostHog)
- `user_signed_up` — Session activates on `/auth/sign-up` (userId, email)
- `user_signed_in` — Session activates on other auth paths (userId, email)
- `user_signed_out` — Session deactivates
- `email_changed` — Successful call to `/api/auth/change-email`
- `password_changed` — Successful call to `/api/auth/change-password`
- `profile_updated` — Successful call to `/api/auth/update-user` (name or image change)

## Dependency

- Install `posthog-js` via pnpm
