"use client"

import { usePostHog } from "posthog-js/react"
import { useEffect, useRef } from "react"

import { authClient } from "@/lib/auth-client"

export function PostHogIdentify() {
    const { data: session } = authClient.useSession()
    const posthog = usePostHog()
    const identifiedUserIdRef = useRef<string | null>(null)

    useEffect(() => {
        if (!posthog) return

        const userId = session?.user?.id ?? null

        if (userId && userId !== identifiedUserIdRef.current) {
            const { user } = session
            posthog.identify(user.id, {
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            })

            const event = window.location.pathname === "/auth/sign-up"
                ? "user_signed_up"
                : "user_signed_in"

            posthog.capture(event, {
                userId: user.id,
                email: user.email,
            })
            identifiedUserIdRef.current = userId
        }

        if (!userId && identifiedUserIdRef.current) {
            posthog.capture("user_signed_out")
            posthog.reset()
            identifiedUserIdRef.current = null
        }
    }, [session, posthog])

    return null
}
