import { AuthView } from "@daveyplate/better-auth-ui"
import { authViewPaths } from "@daveyplate/better-auth-ui/server"
import Link from "next/link"
import { Suspense } from "react"

import { Passkey2faButton } from "@/components/passkey-2fa-button"
import { TotpSetupKey } from "@/components/totp-setup-key"
import { TrustDeviceCheckbox } from "@/components/trust-device-checkbox"

export const dynamicParams = false

export function generateStaticParams() {
    return Object.values(authViewPaths).map((path) => ({ path }))
}

export default async function AuthPage({
    params
}: {
    params: Promise<{ path: string }>
}) {
    const { path } = await params

    const isTwoFactor = path === "two-factor"

    return (
        <main className="container flex grow flex-col items-center justify-center gap-4 self-center p-4 md:p-6">
            <AuthView
                path={path}
                classNames={isTwoFactor ? {
                    form: {
                        base: "justify-items-center [&>.flex]:hidden",
                        forgotPasswordLink: "hidden",
                        primaryButton: "hidden",
                        qrCode: "mx-auto",
                        otpInput: "h-12 w-12 text-lg",
                        otpInputContainer: "justify-center",
                    },
                    footerLink: "inline-flex items-center gap-1.5",
                } : undefined}
                cardFooter={isTwoFactor ? (
                    <div className="flex w-full flex-col items-center gap-3">
                        <div className="flex w-full items-center gap-2">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-muted-foreground text-xs">or</span>
                            <div className="h-px flex-1 bg-border" />
                        </div>
                        <Passkey2faButton />
                        <TrustDeviceCheckbox />
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
                ) : undefined}
            />

            {!["callback", "sign-out"].includes(path) && (
                <p className="w-3xs text-center text-muted-foreground text-xs">
                    By continuing, you agree to our{" "}
                    <Link
                        className="text-primary"
                        href="/terms"
                    >
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                        className="text-primary"
                        href="/privacy"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
            )}
        </main>
    )
}
