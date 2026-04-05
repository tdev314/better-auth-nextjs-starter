"use client"

import { usePathname } from "next/navigation"
import { usePostHog } from "posthog-js/react"
import { useEffect, useRef } from "react"

import { authClient } from "@/lib/auth-client"

export function PostHogIdentify() {
    const { data: session } = authClient.useSession()
    const posthog = usePostHog()
    const pathname = usePathname()
    const prevSessionRef = useRef<typeof session>(null)

    useEffect(() => {
        if (!posthog) return

        const wasAuthenticated = !!prevSessionRef.current?.user
        const isAuthenticated = !!session?.user

        if (!wasAuthenticated && isAuthenticated) {
            const { user } = session
            posthog.identify(user.id, {
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            })

            const event = pathname === "/auth/sign-up"
                ? "user_signed_up"
                : "user_signed_in"

            posthog.capture(event, {
                userId: user.id,
                email: user.email,
            })
        }

        if (wasAuthenticated && !isAuthenticated) {
            posthog.capture("user_signed_out")
            posthog.reset()
        }

        prevSessionRef.current = session
    }, [session, posthog, pathname])

    return null
}
