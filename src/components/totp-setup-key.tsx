"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"

export function TotpSetupKey() {
    const searchParams = useSearchParams()
    const totpURI = searchParams.get("totpURI")
    const [revealed, setRevealed] = useState(false)

    if (!totpURI) return null

    const secret = new URL(totpURI).searchParams.get("secret")
    if (!secret) return null

    if (!revealed) {
        return (
            <button
                type="button"
                className="text-muted-foreground text-xs hover:text-foreground hover:underline"
                onClick={() => setRevealed(true)}
            >
                Can&apos;t scan the QR code?
            </button>
        )
    }

    const formatted = secret.match(/.{1,4}/g)?.join(" ") ?? secret

    return (
        <div className="w-full max-w-sm space-y-1.5 text-center">
            <p className="text-muted-foreground text-xs">
                Enter this key in your authenticator app:
            </p>
            <div className="select-all rounded-lg border bg-muted/50 px-4 py-3 font-mono text-sm tracking-wider">
                {formatted}
            </div>
        </div>
    )
}
