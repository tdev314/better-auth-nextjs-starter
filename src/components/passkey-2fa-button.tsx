"use client"

import { AuthUIContext } from "@daveyplate/better-auth-ui"
import { FingerprintIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { Button } from "./ui/button"

export function Passkey2faButton() {
    const { localization, navigate, redirectTo } = useContext(AuthUIContext)
    const [isPending, setIsPending] = useState(false)

    async function verify() {
        setIsPending(true)

        try {
            await authClient.signIn.passkey({ fetchOptions: { throw: true } })
            navigate(redirectTo)
        } catch {
            toast.error("Passkey verification failed")
            setIsPending(false)
        }
    }

    return (
        <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={isPending}
            onClick={verify}
        >
            <FingerprintIcon />
            {localization.SIGN_IN_WITH} {localization.PASSKEY}
        </Button>
    )
}
