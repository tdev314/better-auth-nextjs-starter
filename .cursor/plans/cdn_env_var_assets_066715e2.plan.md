---
name: CDN env var assets
overview: Make Favicon, Icon, OpenGraph image, and Logo configurable via environment variables that point to CDN URLs, falling back to local defaults when unset.
todos:
  - id: move-icon
    content: Move src/app/icon.svg to public/icon.svg
    status: completed
  - id: update-layout
    content: Update layout.tsx metadata to use FAVICON_URL, ICON_URL, OPENGRAPH_IMAGE_URL env vars
    status: completed
  - id: update-og-image
    content: Update opengraph-image.tsx to proxy CDN image when OPENGRAPH_IMAGE_URL is set
    status: completed
  - id: update-manifest
    content: Update manifest.ts to use ICON_URL env var for PWA icons
    status: completed
  - id: update-env-example
    content: Add FAVICON_URL, ICON_URL, OPENGRAPH_IMAGE_URL, LOGO_URL to .env.example
    status: completed
  - id: update-next-config
    content: Add images.remotePatterns to next.config.ts for CDN support
    status: completed
isProject: false
---

# CDN-Configurable Asset URLs via Environment Variables

## New Environment Variables

Add four new server-side env vars (no `NEXT_PUBLIC_` prefix needed since they are only used in server components/metadata):

- `FAVICON_URL` -- browser tab icon (e.g., `https://cdn.example.com/favicon.svg`)
- `ICON_URL` -- app icon for apple-touch-icon and PWA manifest icons
- `OPENGRAPH_IMAGE_URL` -- social sharing image
- `LOGO_URL` -- reserved for future use

## Changes

### 1. Move `icon.svg` out of the App Router convention

- **Move** [src/app/icon.svg](src/app/icon.svg) to `public/icon.svg`
- This disables the Next.js file-based metadata convention so we can control the icon via the metadata export instead

### 2. Update [src/app/layout.tsx](src/app/layout.tsx) metadata

Read `FAVICON_URL`, `ICON_URL`, and `OPENGRAPH_IMAGE_URL` from `process.env`. Conditionally populate `metadata.icons` and `metadata.openGraph.images`:

```typescript
const faviconUrl = process.env.FAVICON_URL
const iconUrl = process.env.ICON_URL
const ogImageUrl = process.env.OPENGRAPH_IMAGE_URL

export const metadata: Metadata = {
    title: appName,
    icons: {
        icon: faviconUrl || "/icon.svg",
        apple: iconUrl || "/apple-touch-icon.png"
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: appName
    },
    openGraph: {
        title: appName,
        siteName: appName,
        ...(ogImageUrl && { images: [{ url: ogImageUrl }] })
    }
}
```

- `icons.icon` is set explicitly (replaces the old file-based `icon.svg` convention)
- `openGraph.images` is only set when the CDN URL exists, so the dynamic `opengraph-image.tsx` route is still generated as a fallback

### 3. Update [src/app/opengraph-image.tsx](src/app/opengraph-image.tsx)

When `OPENGRAPH_IMAGE_URL` is set, fetch the CDN image and proxy it back instead of generating the text-based image. This ensures the `/opengraph-image` route always returns the correct image regardless of how it's accessed:

```typescript
export default async function OpenGraphImage() {
    const cdnUrl = process.env.OPENGRAPH_IMAGE_URL
    if (cdnUrl) {
        const res = await fetch(cdnUrl)
        return new Response(res.body, {
            headers: { "Content-Type": res.headers.get("Content-Type") || "image/png" }
        })
    }
    // ... existing dynamic generation logic
}
```

### 4. Update [src/app/manifest.ts](src/app/manifest.ts)

Use `ICON_URL` for manifest PWA icons when set, falling back to the current local paths:

```typescript
const iconUrl = process.env.ICON_URL
// ...
icons: iconUrl
    ? [{ src: iconUrl, sizes: "512x512", type: "image/png", purpose: "any" }]
    : [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }
      ]
```

### 5. Update [.env.example](.env.example)

Add the four new env vars:

```
FAVICON_URL=
ICON_URL=
OPENGRAPH_IMAGE_URL=
LOGO_URL=
```

### 6. Update [next.config.ts](next.config.ts)

Add `images.remotePatterns` to allow any HTTPS CDN domain. This is needed if `LOGO_URL` is used with `next/image` in the future:

```typescript
const nextConfig: NextConfig = {
    images: {
        remotePatterns: [{ protocol: "https", hostname: "**" }]
    }
}
```

## Files Changed

- `src/app/icon.svg` -- **moved** to `public/icon.svg`
- `src/app/layout.tsx` -- metadata reads env vars for icons and OG image
- `src/app/opengraph-image.tsx` -- proxies CDN image when env var is set
- `src/app/manifest.ts` -- uses CDN icon URL when env var is set
- `.env.example` -- documents new env vars
- `next.config.ts` -- allows remote image patterns
