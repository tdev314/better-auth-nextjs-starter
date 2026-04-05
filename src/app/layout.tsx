import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import type { ReactNode } from "react"

import "@/styles/globals.css"

import { Header } from "@/components/header"
import { Providers } from "./providers"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"]
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"]
})

const appName = process.env.APPLICATION_NAME || "BETTER-AUTH. STARTER"
const primaryHue = process.env.NEXT_PUBLIC_PRIMARY_HUE
const primaryChroma = process.env.NEXT_PUBLIC_PRIMARY_CHROMA

export const metadata: Metadata = {
    title: appName,
    description:
        `${appName} with Postgres, Drizzle, shadcn/ui and Tanstack Query`,
    openGraph: {
        title: appName,
        description: `${appName} with Postgres, Drizzle, shadcn/ui and Tanstack Query`,
        siteName: appName
    }
}

export const viewport: Viewport = {
    initialScale: 1,
    viewportFit: "cover",
    width: "device-width"
}

export default function RootLayout({
    children
}: Readonly<{
    children: ReactNode
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            style={{
                ...(primaryHue && { "--primary-hue": primaryHue }),
                ...(primaryChroma && { "--primary-chroma": primaryChroma }),
            } as React.CSSProperties}
        >
            <body
                className={`${geistSans.variable} ${geistMono.variable} flex min-h-svh flex-col antialiased`}
            >
                <Providers>
                    <Header />

                    {children}
                </Providers>
            </body>
        </html>
    )
}
