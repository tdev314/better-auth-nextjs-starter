import { betterAuth } from "better-auth"
import { dash, sentinel } from "@better-auth/infra"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { jwt, openAPI } from "better-auth/plugins"
import { oauthProvider } from "@better-auth/oauth-provider"; 

import { db } from "@/database/db"
import * as schema from "@/database/schema"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
        schema
    }),
    emailAndPassword: {
        enabled: true
    },
    disabledPaths: ["/token"],
    plugins: [
        dash(), 
        sentinel(),
        openAPI(),
        jwt(),
        oauthProvider({
            issuer: process.env.BETTER_AUTH_URL || process.env.OAUTH_ISSUER || "http://localhost:3000",
            loginPage: "/auth/sign-in",
            consentPage: "/consent",
            scopes: ["openid", "profile", "email", "offline_access"],
            validAudiences: [
                process.env.BETTER_AUTH_URL || process.env.OAUTH_AUDIENCE || "http://localhost:3000",
            ],
            allowDynamicClientRegistration: true,
            allowUnauthenticatedClientRegistration: true,
            allowPublicClientPrelogin: true,
        }),
    ]
})
