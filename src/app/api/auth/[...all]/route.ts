import { toNextJsHandler } from "better-auth/next-js"
import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/auth"

function isValidRedirectUri(uri: string): boolean {
    try {
        const parsed = new URL(uri)
        if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") return true
        return parsed.protocol === "https:"
    } catch {
        return false
    }
}

const { POST: _POST, GET } = toNextJsHandler(auth)

async function POST(request: NextRequest) {
    const url = new URL(request.url)
    const isRegistration = url.pathname.endsWith("/register")

    if (isRegistration) {
        const cloned = request.clone()
        try {
            const body = await cloned.json()

            const uris: unknown[] = body.redirect_uris ?? body.redirectUris ?? []
            for (const uri of uris) {
                if (typeof uri !== "string" || !isValidRedirectUri(uri)) {
                    return NextResponse.json(
                        { error: "invalid_redirect_uri", error_description: "Redirect URIs must use HTTPS (except localhost)" },
                        { status: 400 },
                    )
                }
            }

            if (body.require_pkce === false || body.requirePKCE === false) {
                return NextResponse.json(
                    { error: "invalid_client_metadata", error_description: "PKCE is required and cannot be disabled" },
                    { status: 400 },
                )
            }
        } catch {
            return NextResponse.json(
                { error: "invalid_request", error_description: "Malformed request body" },
                { status: 400 },
            )
        }
    }

    return _POST(request)
}

export { POST, GET }
