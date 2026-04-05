import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { ReactNode } from "react"

import { auth } from "@/lib/auth"
import { Separator } from "@/components/ui/separator"

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) redirect("/auth/sign-in?redirectTo=/admin")
    if (session.user.role !== "admin") redirect("/")

    return (
        <main className="container flex flex-col gap-6 self-center p-4 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage OAuth clients and internal applications
                    </p>
                </div>
                <nav className="flex items-center gap-4 text-sm">
                    <Link
                        href="/admin/clients"
                        className="font-medium text-foreground transition-colors hover:text-primary"
                    >
                        Clients
                    </Link>
                </nav>
            </div>
            <Separator />
            {children}
        </main>
    )
}
