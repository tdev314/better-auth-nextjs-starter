import { createMcpHandler } from "mcp-handler"
import { mcpHandler } from "@better-auth/oauth-provider"
import { z } from "zod"

const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000"

const handler = mcpHandler(
    {
        jwksUrl: `${baseUrl}/api/auth/jwks`,
        verifyOptions: {
            issuer: baseUrl,
            audience: baseUrl,
        },
    },
    (req, jwt) => {
        return createMcpHandler(
            (server) => {
                server.registerTool(
                    "echo",
                    {
                        description: "Echo a message back to the caller",
                        inputSchema: {
                            message: z.string(),
                        },
                    },
                    async ({ message }) => ({
                        content: [
                            {
                                type: "text" as const,
                                text: `Echo: ${message}${jwt?.sub ? ` (user: ${jwt.sub})` : ""}`,
                            },
                        ],
                    })
                )
            },
            {
                serverInfo: {
                    name: process.env.APPLICATION_NAME || "better-auth-mcp",
                    version: "1.0.0",
                },
            },
            {
                basePath: "/api/mcp",
                maxDuration: 60,
            }
        )(req)
    }
)

export { handler as GET, handler as POST, handler as DELETE }
