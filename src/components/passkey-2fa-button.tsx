"use client"

import { Fingerprint } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { Button } from "./ui/button"

export function Passkey2faButton() {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)

    async function verify() {
        setIsPending(true)
        try {
            await authClient.signIn.passkey({ fetchOptions: { throw: true } })
            router.refresh()
            router.replace("/account/settings")
        } catch {
            toast.error("Passkey verification failed")
            setIsPending(false)
        }
    }

    return (
        <Button
            variant="outline"
            className="w-full"
            disabled={isPending}
            onClick={verify}
        >
            <Fingerprint className="size-4" />
            Verify with passkey
        </Button>
    )
}
