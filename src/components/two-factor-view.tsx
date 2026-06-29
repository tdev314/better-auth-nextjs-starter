"use client"

import {
    AuthUIContext,
    AuthView,
} from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { Suspense, useContext, useEffect, useState } from "react"

import { Passkey2faButton } from "@/components/passkey-2fa-button"
import { TotpSetupKey } from "@/components/totp-setup-key"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function TwoFactorView() {
    const { localization } = useContext(AuthUIContext)
    const [passkeyAvailable, setPasskeyAvailable] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined" || !window.PublicKeyCredential) return

        const check = PublicKeyCredential
            .isUserVerifyingPlatformAuthenticatorAvailable?.()

        if (check) {
            check.then(setPasskeyAvailable).catch(() => setPasskeyAvailable(false))
        } else {
            setPasskeyAvailable(true)
        }
    }, [])

    return (
        <AuthView
            path="two-factor"
            classNames={{
                form: {
                    base: "justify-items-center [&>.flex]:justify-center",
                    forgotPasswordLink: "hidden",
                    primaryButton: "hidden",
                    qrCode: "mx-auto",
                    otpInput: "h-12 w-12 text-lg",
                    otpInputContainer: "justify-center",
                },
                footerLink: "inline-flex items-center gap-1.5",
            }}
            cardHeader={passkeyAvailable ? (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1.5">
                        <CardTitle className="text-lg md:text-xl">
                            {localization.TWO_FACTOR}
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm">
                            {localization.TWO_FACTOR_DESCRIPTION}
                        </CardDescription>
                    </div>

                    <Passkey2faButton />

                    <div className="flex items-center gap-2">
                        <Separator className="!w-auto grow" />
                        <span className="shrink-0 text-muted-foreground text-sm">
                            {localization.OR_CONTINUE_WITH}
                        </span>
                        <Separator className="!w-auto grow" />
                    </div>
                </div>
            ) : undefined}
            cardFooter={
                <div className="flex w-full flex-col items-center gap-2">
                    <Suspense>
                        <TotpSetupKey />
                    </Suspense>
                    <Link
                        className="text-muted-foreground text-xs hover:text-foreground hover:underline"
                        href="/auth/recover-account"
                    >
                        Lost access to your authenticator?
                    </Link>
                </div>
            }
        />
    )
}
