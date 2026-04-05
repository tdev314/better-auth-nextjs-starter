import posthog from "posthog-js"

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

if (typeof window !== "undefined" && posthogKey) {
    posthog.init(posthogKey, {
        api_host: posthogHost || "https://us.i.posthog.com",
        capture_pageview: false,
        capture_pageleave: true,
    })
}

export default posthog
