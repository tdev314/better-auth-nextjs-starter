"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Shield, Globe, User, Mail, RefreshCw } from "lucide-react"

const scopeDetails: Record<string, { label: string; description: string; icon: typeof Shield }> = {
    openid: { label: "OpenID", description: "Verify your identity", icon: Shield },
    profile: { label: "Profile", description: "Access your name and profile picture", icon: User },
    email: { label: "Email", description: "Access your email address", icon: Mail },
    offline_access: { label: "Offline Access", description: "Stay connected when you're not using the app", icon: RefreshCw },
}

function ConsentForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const clientId = searchParams.get("client_id") ?? ""
    const scope = searchParams.get("scope") ?? ""
    const scopes = scope.split(" ").filter(Boolean)

    const [clientInfo, setClientInfo] = useState<{
        name?: string
        icon?: string
        uri?: string
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!clientId) {
            setError("Missing client_id parameter")
            setLoading(false)
            return
        }
        authClient.oauth2
            .publicClient({ query: { client_id: clientId } })
            .then(({ data, error: err }) => {
                if (err || !data) {
                    setError("Could not load application details")
                } else {
                    const d = data as { name?: string; icon?: string; uri?: string }
                    setClientInfo({ name: d.name, icon: d.icon, uri: d.uri })
                }
            })
            .catch(() => setError("Could not load application details"))
            .finally(() => setLoading(false))
    }, [clientId])

    async function handleConsent(accept: boolean) {
        setSubmitting(true)
        try {
            await authClient.oauth2.consent({ accept, scope })
        } catch {
            setError("Something went wrong. Please try again.")
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <main className="container flex grow flex-col items-center justify-center gap-4 p-4">
                <div className="w-full max-w-sm rounded-lg border bg-card p-6 text-center shadow-sm">
                    <p className="text-destructive">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                        Go Back
                    </Button>
                </div>
            </main>
        )
    }

    return (
        <main className="container flex grow flex-col items-center justify-center gap-4 p-4 md:p-6">
            <div className="w-full max-w-sm space-y-6">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="flex flex-col items-center gap-3 text-center">
                        {clientInfo?.icon ? (
                            <img
                                src={clientInfo.icon}
                                alt={clientInfo.name ?? "App"}
                                className="size-12 rounded-lg"
                            />
                        ) : (
                            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                                <Globe className="size-6 text-muted-foreground" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-lg font-semibold">
                                {clientInfo?.name ?? "An application"}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                wants access to your account
                            </p>
                            {clientInfo?.uri && (
                                <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[280px]">
                                    {clientInfo.uri}
                                </p>
                            )}
                        </div>
                    </div>

                    {scopes.length > 0 && (
                        <div className="mt-5 space-y-2">
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                This will allow the application to:
                            </p>
                            <ul className="space-y-2">
                                {scopes.map((s) => {
                                    const detail = scopeDetails[s]
                                    const Icon = detail?.icon ?? Shield
                                    return (
                                        <li
                                            key={s}
                                            className="flex items-center gap-3 rounded-md border p-3 text-sm"
                                        >
                                            <Icon className="size-4 shrink-0 text-muted-foreground" />
                                            <div>
                                                <span className="font-medium">
                                                    {detail?.label ?? s}
                                                </span>
                                                {detail?.description && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {detail.description}
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    )}

                    <div className="mt-6 flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            disabled={submitting}
                            onClick={() => handleConsent(false)}
                        >
                            Deny
                        </Button>
                        <Button
                            className="flex-1"
                            disabled={submitting}
                            onClick={() => handleConsent(true)}
                        >
                            {submitting ? "Authorizing..." : "Allow"}
                        </Button>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    You can revoke access at any time from your account settings.
                </p>
            </div>
        </main>
    )
}

export default function ConsentPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
                </div>
            }
        >
            <ConsentForm />
        </Suspense>
    )
}
