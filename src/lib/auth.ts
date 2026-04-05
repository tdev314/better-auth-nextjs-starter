import { betterAuth } from "better-auth"
import { dash, sentinel } from "@better-auth/infra"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { openAPI } from "better-auth/plugins"

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
    plugins: [
        dash(), 
        sentinel(),
        openAPI(),
    ]
})
