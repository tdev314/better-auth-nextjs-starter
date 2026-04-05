"use client"

import { PostHogProvider } from "posthog-js/react"
import type { ReactNode } from "react"

import posthog from "@/lib/posthog"

export function PHProvider({ children }: { children: ReactNode }) {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return <>{children}</>

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
