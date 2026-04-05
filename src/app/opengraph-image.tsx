import { ImageResponse } from "next/og"

export const alt = "OpenGraph Image"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpenGraphImage() {
    const cdnUrl = process.env.OPENGRAPH_IMAGE_URL
    if (cdnUrl) {
        const res = await fetch(cdnUrl)
        return new Response(res.body, {
            headers: {
                "Content-Type": res.headers.get("Content-Type") || "image/png",
                "Cache-Control": "public, max-age=86400"
            }
        })
    }

    const appName = process.env.APPLICATION_NAME || "BETTER-AUTH. STARTER"

    return new ImageResponse(
        (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "black",
                    color: "white",
                    fontSize: 64,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                }}
            >
                {appName}
            </div>
        ),
        { ...size }
    )
}
