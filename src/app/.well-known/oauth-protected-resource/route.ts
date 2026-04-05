import { serverClient } from "@/lib/server-client"

export const GET = async () => {
    const metadata = await serverClient.getProtectedResourceMetadata({
        resource: process.env.BETTER_AUTH_URL || "http://localhost:3000",
        authorization_servers: [
            process.env.BETTER_AUTH_URL || "http://localhost:3000",
        ],
    })

    return new Response(JSON.stringify(metadata), {
        headers: {
            "Content-Type": "application/json",
            "Cache-Control":
                "public, max-age=15, stale-while-revalidate=15, stale-if-error=86400",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
        },
    })
}
