import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { dashClient, sentinelClient } from "@better-auth/infra/client"
import { oauthProviderClient } from "@better-auth/oauth-provider/client"
import posthog from "@/lib/posthog"

const authEventsByPath: Record<string, string> = {
  "/change-email": "email_changed",
  "/change-password": "password_changed",
  "/update-user": "profile_updated",
}

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    dashClient(),
    sentinelClient({
      autoSolveChallenge: true,
    }),
    oauthProviderClient(),
  ],
  fetchOptions: {
    onSuccess: (ctx) => {
      if (typeof window === "undefined") return
      const path = new URL(ctx.response.url).pathname
      for (const [suffix, event] of Object.entries(authEventsByPath)) {
        if (path.endsWith(suffix)) {
          posthog.capture(event)
          break
        }
      }
    },
  },
})
