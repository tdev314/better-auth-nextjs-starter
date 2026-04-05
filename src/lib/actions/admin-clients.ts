"use server"

import { headers } from "next/headers"
import { eq, desc } from "drizzle-orm"
import { db } from "@/database/db"
import { oauthClients } from "@/database/schema"
import { auth } from "@/lib/auth"

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) throw new Error("Not authenticated")
    if (session.user.role !== "admin") throw new Error("Forbidden")
    return session
}

export type OAuthClientRow = typeof oauthClients.$inferSelect

export async function getClients(): Promise<OAuthClientRow[]> {
    await requireAdmin()
    return db
        .select()
        .from(oauthClients)
        .orderBy(desc(oauthClients.createdAt))
}

export async function getClient(id: string): Promise<OAuthClientRow | null> {
    await requireAdmin()
    const rows = await db
        .select()
        .from(oauthClients)
        .where(eq(oauthClients.id, id))
        .limit(1)
    return rows[0] ?? null
}

export async function createClient(data: {
    name: string
    redirectUris: string[]
    scopes?: string[]
    skipConsent?: boolean
    enableEndSession?: boolean
    type?: string
    uri?: string
}) {
    await requireAdmin()

    const result = await auth.api.adminCreateOAuthClient({
        headers: await headers(),
        body: {
            redirect_uris: data.redirectUris,
            client_name: data.name,
            scope: data.scopes?.join(" ") || "openid profile email offline_access",
            skip_consent: data.skipConsent ?? false,
            enable_end_session: data.enableEndSession ?? true,
            client_secret_expires_at: 0,
            ...(data.uri && { client_uri: data.uri }),
            ...(data.type === "public" && { token_endpoint_auth_method: "none" }),
        },
    })

    return {
        id: result.id as string,
        clientId: result.clientId as string,
        clientSecret: result.clientSecret as string | null,
        name: result.name as string | null,
    }
}

export async function updateClient(
    id: string,
    data: {
        name?: string | null
        uri?: string | null
        icon?: string | null
        redirectUris?: string[]
        scopes?: string[] | null
        skipConsent?: boolean | null
        enableEndSession?: boolean | null
        requirePKCE?: boolean | null
        disabled?: boolean | null
        grantTypes?: string[] | null
        responseTypes?: string[] | null
        contacts?: string[] | null
        tos?: string | null
        policy?: string | null
        isPublic?: boolean | null
    },
) {
    await requireAdmin()

    await db
        .update(oauthClients)
        .set({
            ...(data.name !== undefined && { name: data.name }),
            ...(data.uri !== undefined && { uri: data.uri }),
            ...(data.icon !== undefined && { icon: data.icon }),
            ...(data.redirectUris !== undefined && { redirectUris: data.redirectUris }),
            ...(data.scopes !== undefined && { scopes: data.scopes }),
            ...(data.skipConsent !== undefined && { skipConsent: data.skipConsent }),
            ...(data.enableEndSession !== undefined && { enableEndSession: data.enableEndSession }),
            ...(data.requirePKCE !== undefined && { requirePKCE: data.requirePKCE }),
            ...(data.disabled !== undefined && { disabled: data.disabled }),
            ...(data.grantTypes !== undefined && { grantTypes: data.grantTypes }),
            ...(data.responseTypes !== undefined && { responseTypes: data.responseTypes }),
            ...(data.contacts !== undefined && { contacts: data.contacts }),
            ...(data.tos !== undefined && { tos: data.tos }),
            ...(data.policy !== undefined && { policy: data.policy }),
            ...(data.isPublic !== undefined && { public: data.isPublic }),
            updatedAt: new Date(),
        })
        .where(eq(oauthClients.id, id))

    return { success: true }
}

export async function deleteClient(id: string) {
    await requireAdmin()
    await db.delete(oauthClients).where(eq(oauthClients.id, id))
    return { success: true }
}

export async function toggleClient(id: string, disabled: boolean) {
    await requireAdmin()
    await db
        .update(oauthClients)
        .set({ disabled, updatedAt: new Date() })
        .where(eq(oauthClients.id, id))
    return { success: true }
}

async function hashSecret(value: string): Promise<string> {
    const data = new TextEncoder().encode(value)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const bytes = new Uint8Array(hashBuffer)
    let binary = ""
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export async function rotateClientSecret(clientId: string) {
    await requireAdmin()

    const { randomBytes } = await import("node:crypto")
    const newSecret = randomBytes(32).toString("base64url")
    const hashed = await hashSecret(newSecret)

    await db
        .update(oauthClients)
        .set({ clientSecret: hashed, updatedAt: new Date() })
        .where(eq(oauthClients.clientId, clientId))

    return { clientSecret: newSecret }
}
